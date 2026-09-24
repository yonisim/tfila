@ECHO OFF

IF NOT DEFINED DATA_ABSOLUTE_PATH (
    CALL :SETUP_ENV
)
GOTO :while

:SETUP_ENV
    SET TFILA_DATA_REPO=https://github.com/yonisim/tfila-data.git
    SET DATA_RELATIVE_PATH=..\tfila-data
    CALL :NORMALIZEPATH "..\tfila-data"
    SET DATA_ABSOLUTE_PATH=%RETVAL:\=/%
    SET TFILA_REPO=https://github.com/yonisim/tfila.git
    EXIT /B

:NORMALIZEPATH
    SET RETVAL=%~f1
    EXIT /B

:while
    ping -n 2 -w 700 8.8.8.8 | find "TTL="
    echo %ERRORLEVEL%
    echo before main if
    IF %ERRORLEVEL% EQU 0 (
        echo Connected to the internet.
        goto :pull
    ) ELSE (
        echo Not connected to the internet.
    )
    :finally
    echo before start the process
    goto :start_the_process
    :continue_loop
    timeout 60
    goto :while

:pull
IF EXIST "%DATA_ABSOLUTE_PATH%" (
    setlocal
    SET cwd="%~dp0"
    echo current working dir %cwd%
    echo changing dir to %DATA_ABSOLUTE_PATH%
    cd "%DATA_ABSOLUTE_PATH%" & git pull %TFILA_DATA_REPO%
    cd %cwd%
    echo returned to working dir %cwd%
    endlocal
) ELSE (
    git clone %TFILA_DATA_REPO% "%DATA_ABSOLUTE_PATH%"
)
FOR /F %%H IN ('git rev-parse HEAD') DO SET OLD_HEAD=%%H
git reset --hard
git pull %TFILA_REPO%

REM The window watcher only reloads the page. Changes to the Electron main
REM process or dependencies need a full restart, which :start_the_process
REM does on the next pass once electron.exe is gone.
git diff --quiet %OLD_HEAD% HEAD -- package.json package-lock.json
IF ERRORLEVEL 1 (
    echo dependencies changed, running npm install
    taskkill /F /im electron.exe
    CALL npm install
)
git diff --quiet %OLD_HEAD% HEAD -- main.js preload.js
IF ERRORLEVEL 1 (
    echo main process changed, restarting electron
    taskkill /F /im electron.exe
    timeout /t 2 /nobreak
)
goto :finally

:start_the_process
tasklist  /FI "IMAGENAME eq electron.exe" | find "No tasks are running"
IF %ERRORLEVEL% EQU 0 (
    echo starting the process
    START npm start --data_dir=%DATA_ABSOLUTE_PATH%
)
goto :continue_loop

:kill_the_process
echo killing the process
taskkill /F /im electron.exe
goto :continue_update

:manage_monitor
.\py-scripts\nircmd.exe monitor off
timeout 10
.\py-scripts\nircmd.exe monitor on
goto :continue_after_monitor_check

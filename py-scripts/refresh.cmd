@ECHO OFF
:while
    ping -n 2 -w 700 8.8.8.8 | find "TTL="
    echo %ERRORLEVEL%
    IF %ERRORLEVEL% EQU 0 (
        echo Connected to the internet.
        goto :pull
        :continue_update
    ) ELSE (
        echo Not connected to the internet.
    )
    goto :start_the_process
    :continue_loop
    timeout 5
    goto :while

:pull
git reset --hard
git pull https://github.com/yonisim/tfila.git | find "up to date"
echo %ERRORLEVEL%
IF %ERRORLEVEL% EQU 1 (
    goto :kill_the_process
) ELSE (
    echo up to date
    goto :continue_loop
)

:start_the_process
tasklist  /FI "IMAGENAME eq electron.exe" | find "No tasks are running"
IF %ERRORLEVEL% EQU 0 (
    echo starting the process
    START npm start
)
goto :continue_loop

:kill_the_process
echo killing the process
taskkill /F /im electron.exe
goto :continue_update
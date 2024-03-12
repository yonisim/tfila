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
IF exist %DATA_ABSOLUTE_PATH% (
    setlocal
    SET cwd="%~dp0"
    echo current working dir %cwd%
    echo changing dir to %DATA_ABSOLUTE_PATH%
    cd %DATA_ABSOLUTE_PATH% & git pull %TFILA_DATA_REPO%
    cd %cwd%
    echo returned to working dir %cwd%
    endlocal
) else (
    git clone %TFILA_DATA_REPO% %DATA_ABSOLUTE_PATH%
)
git reset --hard
git pull %TFILA_REPO% | find "up to date"
echo %ERRORLEVEL%
IF %ERRORLEVEL% EQU 1 (
    goto :kill_the_process
    :continue_update
    goto :finally
) ELSE (
    echo up to date
    goto :finally
)

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
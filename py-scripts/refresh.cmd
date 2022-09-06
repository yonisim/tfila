@ECHO OFF
:while
    ping -n 2 -w 700 8.8.8.8 | find "TTL="
    echo %ERRORLEVEL%
    IF %ERRORLEVEL% EQU 0 (
        echo Connected to the internet.
        goto :pull
        :continue_update
        echo updating
        taskkill /F /im electron.exe
        START npm start
        goto :continue_loop
    ) ELSE (
        echo Not connected to the internet.
    )
    :continue_loop
    timeout 5
    goto :while

:pull
git reset --hard
git pull https://github.com/yonisim/tfila.git | find "up to date"
echo %ERRORLEVEL%
IF %ERRORLEVEL% EQU 1 (
    goto :continue_update
) ELSE (
    echo up to date
    goto :continue_loop
)
@ECHO OFF

SET TFILA_DATA_REPO=https://github.com/yonisim/tfila-data.git
SET DATA_RELATIVE_PATH=..\tfila-data
CALL :NORMALIZEPATH "..\tfila-data"
SET DATA_ABSOLUTE_PATH=%RETVAL:\=/%
SET TFILA_REPO=https://github.com/yonisim/tfila.git

CALL check_for_updates.cmd

:NORMALIZEPATH
  SET RETVAL=%~f1
  EXIT /B
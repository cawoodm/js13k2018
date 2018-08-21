@ECHO OFF
SETLOCAL

CD %dp0%
SET STR=%1
IF "%1"=="" SET STR=%date% %time%

:: Commit local changes
git add .
git commit -m "Build %STR%"
git push origin master

GOTO END
:: Copy to local cawoodm github site
COPY /Y .\release\*.* ..\..\..\cawoodm.github.io\js13k2018

:: Publish to github
CD ..\..\..\cawoodm.github.io\js13k2018
git add .
git commit -m "Release %STR%"
git push origin master
ECHO "Ready to test at http://cawoodm.github.io/js13k2018/"
START http://cawoodm.github.io/js13k2018/

:END

ENDLOCAL
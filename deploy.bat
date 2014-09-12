@echo off
xcopy DevCommunity\site %1\site /i /s /Y /d 
xcopy %1\Data /i /s /Y /d %1\Data_backup
copy DevCommunity\package.json %1\package.json
cd /D %1
npm install --production
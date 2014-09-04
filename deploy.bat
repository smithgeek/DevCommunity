@echo off
echo .ts\ > Typescript.excludes
echo .js.map\ >> Typescript.excludes
echo config.js\ >> Typescript.excludes
echo config-example.js\ >> Typescript.excludes
xcopy DevCommunity\server %1\server /i /s /Y /d /exclude:Typescript.excludes
xcopy %1\Data /i /s /Y /d %1\Data_backup
del Typescript.excludes
copy DevCommunity\package.json %1\package.json
cd /D %1
npm install --production
@echo off
xcopy DevCommunity\public %1\public /i /s /Y /d
xcopy DevCommunity\node_modules %1\node_modules /i /s /Y /d
xcopy DevCommunity\routes %1\routes /i /s /Y /d
xcopy DevCommunity\views %1\views /i /s /Y /d
xcopy DevCommunity\views %1\views /i /s /Y /d
copy DevCommunity\server.js %1\server.js /d
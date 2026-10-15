@echo off
cd /d "%~dp0"
start "" http://localhost:8051/
py -3 -m http.server 8051 --bind 127.0.0.1
pause

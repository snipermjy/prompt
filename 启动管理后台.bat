@echo off
chcp 65001 >nul
echo ================================
echo   启动 AI Prompt 管理后台
echo ================================
echo.
echo 正在启动开发服务器...
echo.

cd /d "%~dp0"

start http://localhost:3000/admin

npm run dev

pause

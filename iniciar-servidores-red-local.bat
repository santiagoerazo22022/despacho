@echo off
echo ========================================
echo   SISTEMA DE GESTION - DESPACHO GENERAL
echo ========================================
echo.
echo Iniciando servidores para acceso desde red local...
echo.

echo [1/2] Iniciando Backend (Puerto 3000)...
start "Backend Server" cmd /k "cd backend && npm start"

echo [2/2] Iniciando Frontend (Puerto 3001)...
start "Frontend Server" cmd /k "cd frontend && npm run start:network"

echo.
echo ========================================
echo   SERVIDORES INICIADOS
echo ========================================
echo.
echo Acceso local:
echo   Frontend: http://localhost:3001
echo   Backend:  http://localhost:3000
echo.
echo Acceso desde red local:
echo   Frontend: http://192.168.1.115:3001
echo   Backend:  http://192.168.1.115:3000
echo.
echo NOTA: Reemplaza 192.168.1.115 con tu IP real
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul

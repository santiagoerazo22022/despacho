#!/bin/bash

echo "========================================"
echo "  SISTEMA DE GESTION - DESPACHO GENERAL"
echo "========================================"
echo ""
echo "Iniciando servidores para acceso desde red local..."
echo ""

echo "[1/2] Iniciando Backend (Puerto 3000)..."
cd backend && npm start &
BACKEND_PID=$!

echo "[2/2] Iniciando Frontend (Puerto 3001)..."
cd ../frontend && HOST=0.0.0.0 PORT=3001 npm start &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "  SERVIDORES INICIADOS"
echo "========================================"
echo ""
echo "Acceso local:"
echo "  Frontend: http://localhost:3001"
echo "  Backend:  http://localhost:3000"
echo ""
echo "Acceso desde red local:"
echo "  Frontend: http://192.168.1.115:3001"
echo "  Backend:  http://192.168.1.115:3000"
echo ""
echo "NOTA: Reemplaza 192.168.1.115 con tu IP real"
echo ""
echo "Presiona Ctrl+C para detener los servidores..."

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "Deteniendo servidores..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Esperar a que los procesos terminen
wait

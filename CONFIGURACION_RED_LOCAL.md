# 🌐 Configuración para Acceso desde Red Local

Este documento explica cómo configurar el sistema para que funcione desde cualquier dispositivo en tu red local.

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)
```bash
# Windows
iniciar-servidores-red-local.bat

# Linux/Mac
./iniciar-servidores-red-local.sh
```

### Opción 2: Manual
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run start:network
```

## 📋 Configuración Detallada

### 1. Archivo .env (Crear en la raíz del proyecto)
```env
# Configuración del servidor
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Configuración de base de datos
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=despacho
DB_USER=root
DB_PASSWORD=

# Configuración de CORS - URLs permitidas
FRONTEND_URL=http://localhost:3001
FRONTEND_URL_NETWORK=http://192.168.1.115:3001

# JWT Secret
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_cambiar_en_produccion

# Configuración de archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### 2. Cambiar tu IP en los archivos
Reemplaza `192.168.1.115` con tu IP real en:
- `backend/app.js` (líneas 47 y 199)
- `CONFIGURACION_RED_LOCAL.md` (esta línea)

### 3. Obtener tu IP
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

## 🔧 Cambios Realizados

### Backend (backend/app.js)
- ✅ CORS configurado para permitir acceso desde red local
- ✅ Servidor escucha en `0.0.0.0:3000` (todas las interfaces)
- ✅ Detección automática de IPs locales

### Frontend (frontend/src/services/api.js)
- ✅ Detección automática de la URL del backend
- ✅ Soporte para IPs locales (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
- ✅ Logs de debugging para verificar conexión

### Scripts de Inicio
- ✅ `iniciar-servidores-red-local.bat` (Windows)
- ✅ `iniciar-servidores-red-local.sh` (Linux/Mac)
- ✅ `npm run start:network` (Frontend con HOST=0.0.0.0)

## 🌐 URLs de Acceso

### Desde la máquina servidor:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000

### Desde otros dispositivos en la red:
- Frontend: http://TU_IP:3001
- Backend: http://TU_IP:3000

## 🔍 Solución de Problemas

### Error: "No permitido por CORS"
1. Verifica que tu IP esté en la lista de `allowedOrigins` en `backend/app.js`
2. Asegúrate de que el backend esté escuchando en `0.0.0.0:3000`

### Error: "ERR_NETWORK"
1. Verifica que ambos servidores estén ejecutándose
2. Comprueba que el firewall no bloquee los puertos 3000 y 3001
3. Confirma que estás usando la IP correcta

### Error: "Cannot access before initialization"
1. Reinicia ambos servidores
2. Limpia la caché del navegador

## 🔒 Seguridad

⚠️ **IMPORTANTE**: Esta configuración es solo para desarrollo local. En producción:
- Cambia el JWT_SECRET
- Configura HTTPS
- Restringe las IPs permitidas
- Usa variables de entorno seguras

## 📱 Acceso desde Móviles

Una vez configurado, puedes acceder desde cualquier dispositivo en tu red:
- Teléfonos móviles
- Tablets
- Otros computadores
- Smart TVs con navegador

Solo necesitas la IP de tu servidor y los puertos 3000 y 3001.

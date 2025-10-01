# Instrucciones para Implementar el Logo PNG

## 📋 Pasos para usar el logo PNG real

### 1. Preparar la imagen
- Guarda tu logo PNG con el nombre: `logo-despacho-general.png`
- Asegúrate de que tenga fondo transparente para mejor integración

### 2. Colocar la imagen en el proyecto
- Copia el archivo PNG a: `frontend/src/assets/images/logo-despacho-general.png`
- Si la carpeta no existe, créala primero

### 3. Modificar LoginPage.js
Abre el archivo `frontend/src/pages/LoginPage.js` y:

**a) Descomenta la línea de import:**
```javascript
// Cambiar esto:
// import logoImage from '../assets/images/logo-despacho-general.png';

// Por esto:
import logoImage from '../assets/images/logo-despacho-general.png';
```

**b) Cambiar el componente Logo:**
```javascript
// Cambiar esto:
<Logo size="large" variant="icon" />

// Por esto:
<Logo size="large" variant="icon" useImage={true} imageSrc={logoImage} />
```

### 4. Verificar el resultado
- El logo PNG debería aparecer en la página de login
- Mantendrá sus proporciones originales
- Se adaptará al tamaño especificado (150x150px para "large")

## 🎨 Características del componente Logo

- **useImage**: `true` para usar PNG, `false` para usar placeholder
- **imageSrc**: Ruta de la imagen PNG importada
- **size**: `small` (60px), `medium` (100px), `large` (150px)
- **variant**: `icon` (solo logo), `full` (logo + texto)

## 🔧 Fallback
Si no se proporciona `imageSrc` o `useImage` es `false`, se mostrará un placeholder gris con texto "Logo PNG Pendiente".

## 📱 Uso en otros componentes
El mismo componente Logo se puede usar en cualquier parte del sistema:

```javascript
import logoImage from '../assets/images/logo-despacho-general.png';

// Solo el logo
<Logo size="medium" variant="icon" useImage={true} imageSrc={logoImage} />

// Logo con texto
<Logo size="large" variant="full" useImage={true} imageSrc={logoImage} />
```

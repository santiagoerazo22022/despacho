# Logo del Sistema

## Instrucciones para usar el logo PNG

Para usar el logo PNG en lugar del SVG, sigue estos pasos:

### 1. Colocar la imagen PNG
- Coloca el archivo PNG del logo en esta carpeta: `frontend/src/assets/images/`
- Nombre recomendado: `logo-despacho-general.png`

### 2. Importar la imagen en el componente
```javascript
import logoImage from '../assets/images/logo-despacho-general.png';
```

### 3. Usar el componente Logo con imagen
```javascript
<Logo 
  variant="icon" 
  size="large" 
  useImage={true} 
  imageSrc={logoImage} 
/>
```

### 4. Ejemplo en LoginPage
```javascript
import logoImage from '../assets/images/logo-despacho-general.png';

// En el componente:
<Logo 
  size="large" 
  variant="icon" 
  useImage={true} 
  imageSrc={logoImage} 
/>
```

## Características del componente Logo

- **useImage**: `true` para usar PNG, `false` para usar SVG
- **imageSrc**: Ruta de la imagen PNG
- **size**: `small`, `medium`, `large`
- **variant**: `icon` (solo logo), `full` (logo + texto)

## Fallback
Si no se proporciona `imageSrc` o `useImage` es `false`, el componente usará el SVG como fallback.

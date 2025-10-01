import React from 'react';
import { Box, Typography } from '@mui/material';

const Logo = ({ variant = 'full', size = 'medium', useImage = false, imageSrc = null }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 60, fontSize: '0.75rem' };
      case 'large':
        return { width: 150, height: 150, fontSize: '1.5rem' };
      default:
        return { width: 100, height: 100, fontSize: '1rem' };
    }
  };

  const { width, height, fontSize } = getSize();

  const LogoIcon = () => {
    // Si se proporciona una imagen PNG, usarla
    if (useImage && imageSrc) {
      return (
        <img
          src={imageSrc}
          alt="Logo Dirección Despacho General"
          style={{
            width: width,
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      );
    }

    // Placeholder mientras no tengamos el PNG
    return (
      <Box
        sx={{
          width: width,
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          borderRadius: 2,
          border: '2px dashed #9ca3af',
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: 'center', fontSize: '0.7rem' }}
        >
          Logo PNG<br />Pendiente
        </Typography>
      </Box>
    );
  };

  if (variant === 'icon') {
    return <LogoIcon />;
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <LogoIcon />
      <Typography
        variant="h6"
        component="div"
        sx={{
          fontFamily: '"Playfair Display", serif',
          fontWeight: 600,
          color: '#1e3a8a',
          textAlign: 'center',
          lineHeight: 1.2,
          mt: 0.5,
          fontSize: fontSize
        }}
      >
        Sistema de Gestión
      </Typography>
      <Typography
        variant="subtitle2"
        component="div"
        sx={{
          fontFamily: '"Playfair Display", serif',
          fontWeight: 500,
          color: '#374151',
          textAlign: 'center',
          lineHeight: 1.2,
          fontSize: fontSize * 0.8
        }}
      >
        Oficina de Despacho General
      </Typography>
    </Box>
  );
};

export default Logo;

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo/Logo';
import logoImage from '../assets/images/logo-despacho-general.png';

const schema = yup.object({
  email: yup
    .string()
    .email('Ingresa un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('¡Bienvenido al sistema!');
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 2, sm: 3 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: { xs: '90vh', sm: '80vh' },
          }}
        >
          <Paper
            elevation={24}
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: 900 },
              borderRadius: { xs: 2, sm: 4 },
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                minHeight: { xs: 'auto', md: 600 },
              }}
            >
              {/* Left side - Logo and branding */}
              <Box
                sx={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: { xs: 3, sm: 4 },
                  color: 'white',
                  minHeight: { xs: 'auto', md: '100%' },
                  py: { xs: 4, md: 4 },
                }}
              >
                <Logo size="large" variant="icon" useImage={true} imageSrc={logoImage} />
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    mt: { xs: 2, sm: 3 },
                    mb: { xs: 1, sm: 2 },
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                  }}
                >
                  Sistema de Gestión
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    textAlign: 'center',
                    mb: { xs: 0.5, sm: 1 },
                    opacity: 0.9,
                    fontWeight: 500,
                    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                  }}
                >
                  Oficina de Despacho General
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    textAlign: 'center',
                    opacity: 0.8,
                    fontWeight: 400,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                  }}
                >
                  Municipalidad de Famaillá
                </Typography>
                <Divider sx={{ 
                  my: { xs: 2, sm: 3 }, 
                  width: { xs: '80%', sm: '60%' }, 
                  borderColor: 'rgba(255,255,255,0.3)' 
                }} />
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: 'center',
                    opacity: 0.9,
                    maxWidth: { xs: 280, sm: 300 },
                    lineHeight: 1.6,
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  Plataforma integral para la gestión de expedientes, decretos y resoluciones municipales
                </Typography>
              </Box>

              {/* Right side - Login form */}
              <Box
                sx={{
                  flex: 1,
                  p: { xs: 3, sm: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: { xs: 'auto', md: '100%' },
                }}
              >
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                  <Typography
                    variant="h4"
                    component="h2"
                    sx={{
                      fontWeight: 'bold',
                      color: '#1e3a8a',
                      mb: 1,
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                    }}
                  >
                    Iniciar Sesión
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ 
                      mb: { xs: 2, sm: 3 },
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                  >
                    Ingresa tus credenciales para acceder al sistema
                  </Typography>
                </Box>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: { xs: 2, sm: 3 },
                      borderRadius: 2,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      '& .MuiAlert-icon': {
                        color: '#dc2626',
                      },
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Correo Electrónico"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    size="medium"
                    sx={{
                      mb: { xs: 1.5, sm: 2 },
                      '& .MuiInputBase-root': {
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1e3a8a',
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#6b7280', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    size="medium"
                    sx={{
                      mb: { xs: 2, sm: 3 },
                      '& .MuiInputBase-root': {
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1e3a8a',
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#6b7280', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                            sx={{ color: '#6b7280' }}
                            size="small"
                          >
                            {showPassword ? <VisibilityOff sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} /> : <Visibility sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    size="large"
                    sx={{
                      py: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                      boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                        boxShadow: '0 6px 16px rgba(30, 58, 138, 0.4)',
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        background: '#9ca3af',
                        boxShadow: 'none',
                        transform: 'none',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
                    }}>
                      {loading ? 'Iniciando sesión...' : 'Acceder al Sistema'}
                    </Typography>
                  </Button>
                </Box>

                <Box sx={{ mt: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Sistema de Gestión Municipal
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}>
                    Versión 1.0.0 - © 2024 Municipalidad de Famaillá
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;

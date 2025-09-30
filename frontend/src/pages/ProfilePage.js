import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Lock as LockIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';

import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const profileSchema = yup.object({
  nombre: yup.string().required('El nombre es requerido').min(2).max(100),
  apellido: yup.string().required('El apellido es requerido').min(2).max(100),
  telefono: yup.string(),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('La contraseña actual es requerida'),
  newPassword: yup.string().min(6, 'Mínimo 6 caracteres').required('La nueva contraseña es requerida'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Las contraseñas no coinciden')
    .required('Confirma la nueva contraseña'),
});

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      telefono: user?.telefono || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const onSubmitProfile = async (data) => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(data);
      updateUser(response.data.user);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      setPasswordLoading(true);
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Contraseña cambiada exitosamente');
      resetPassword();
    } catch (error) {
      toast.error('Error al cambiar la contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mi Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                {user?.nombre} {user?.apellido}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: user?.rol === 'admin' ? 'error.main' : 'primary.main',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  display: 'inline-block',
                  mb: 2,
                }}
              >
                {user?.rol?.toUpperCase()}
              </Typography>
              {user?.ultimo_acceso && (
                <Typography variant="body2" color="text.secondary">
                  Último acceso: {formatDate(user.ultimo_acceso)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información Personal
            </Typography>
            <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre *"
                    {...registerProfile('nombre')}
                    error={!!profileErrors.nombre}
                    helperText={profileErrors.nombre?.message}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido *"
                    {...registerProfile('apellido')}
                    error={!!profileErrors.apellido}
                    helperText={profileErrors.apellido?.message}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={user?.email || ''}
                    disabled
                    helperText="El email no se puede modificar"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    {...registerProfile('telefono')}
                    error={!!profileErrors.telefono}
                    helperText={profileErrors.telefono?.message}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>

          {/* Change Password */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cambiar Contraseña
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Para cambiar tu contraseña, ingresa tu contraseña actual y la nueva contraseña.
            </Alert>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Contraseña Actual *"
                    {...registerPassword('currentPassword')}
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword?.message}
                    disabled={passwordLoading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Nueva Contraseña *"
                    {...registerPassword('newPassword')}
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword?.message}
                    disabled={passwordLoading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirmar Nueva Contraseña *"
                    {...registerPassword('confirmPassword')}
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword?.message}
                    disabled={passwordLoading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<LockIcon />}
                    disabled={passwordLoading}
                    color="secondary"
                  >
                    {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;

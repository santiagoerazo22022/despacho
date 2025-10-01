import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LockReset as LockResetIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';

import { userService } from '../services/userService';

const createUserSchema = yup.object({
  nombre: yup.string().required('El nombre es requerido').min(2).max(100),
  apellido: yup.string().required('El apellido es requerido').min(2).max(100),
  email: yup.string().email('Email inválido').required('El email es requerido'),
  password: yup.string().required('La contraseña es requerida').min(6, 'Mínimo 6 caracteres'),
  rol: yup.string().required('El rol es requerido'),
  telefono: yup.string().nullable(),
});

const updateUserSchema = yup.object({
  nombre: yup.string().required('El nombre es requerido').min(2).max(100),
  apellido: yup.string().required('El apellido es requerido').min(2).max(100),
  email: yup.string().email('Email inválido').required('El email es requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').nullable(),
  rol: yup.string().required('El rol es requerido'),
  telefono: yup.string().nullable(),
});

const updatePasswordSchema = yup.object({
  password: yup.string().required('La contraseña es requerida').min(6, 'Mínimo 6 caracteres'),
  confirmPassword: yup.string()
    .required('Confirma la contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
});

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [rolFilter, setRolFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(dialogType === 'create' ? createUserSchema : updateUserSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(updatePasswordSchema),
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        rol: rolFilter,
      };

      const response = await userService.getUsers(params);
      setUsers(response.data.users);
      setTotalCount(response.data.pagination.totalItems);
    } catch (error) {
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, rolFilter]);

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchTerm, rolFilter, fetchUsers]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleCreateUser = () => {
    setDialogType('create');
    reset({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'administrativo',
      telefono: ''
    });
    setDialogOpen(true);
  };

  const handleEditUser = () => {
    setDialogType('edit');
    reset({
      nombre: selectedUser.nombre,
      apellido: selectedUser.apellido,
      email: selectedUser.email,
      rol: selectedUser.rol,
      telefono: selectedUser.telefono || ''
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteUser = async () => {
    try {
      await userService.deleteUser(selectedUser.id);
      toast.success('Usuario eliminado exitosamente');
      fetchUsers();
    } catch (error) {
      toast.error('Error al eliminar el usuario');
    }
    handleMenuClose();
  };

  const handleUpdatePassword = () => {
    resetPassword({
      password: '',
      confirmPassword: ''
    });
    setPasswordDialogOpen(true);
    handleMenuClose();
  };

  const onSubmitPassword = async (data) => {
    try {
      await userService.updateUser(selectedUser.id, { password: data.password });
      toast.success('Contraseña actualizada exitosamente');
      setPasswordDialogOpen(false);
      resetPassword();
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      const message = error.response?.data?.message || 
                     error.response?.data?.errors?.[0]?.msg ||
                     'Error al actualizar la contraseña';
      toast.error(message);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (dialogType === 'create') {
        await userService.createUser(data);
        toast.success('Usuario creado exitosamente');
      } else {
        // Remove password if empty for updates
        if (!data.password) {
          delete data.password;
        }
        await userService.updateUser(selectedUser.id, data);
        toast.success('Usuario actualizado exitosamente');
      }
      setDialogOpen(false);
      fetchUsers();
      reset();
    } catch (error) {
      console.error('Error en onSubmit:', error);
      const message = error.response?.data?.message || 
                     error.response?.data?.errors?.[0]?.msg ||
                     `Error al ${dialogType === 'create' ? 'crear' : 'actualizar'} el usuario`;
      toast.error(message);
    }
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case 'admin':
        return 'error';
      case 'administrativo':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-ES');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateUser}
          size="large"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Nuevo Usuario
          </Typography>
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              label="Buscar usuarios"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              size="medium"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="medium">
              <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Rol</InputLabel>
              <Select
                value={rolFilter}
                label="Rol"
                onChange={(e) => {
                  setRolFilter(e.target.value);
                  setPage(0);
                }}
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Todos</MenuItem>
                <MenuItem value="admin" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Admin</MenuItem>
                <MenuItem value="administrativo" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Administrativo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setRolFilter('');
                setPage(0);
              }}
              size="large"
              sx={{ py: { xs: 1.5, sm: 2 } }}
            >
              <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Limpiar
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>Nombre</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>Rol</TableCell>
              <TableCell sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' }, 
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'table-cell' }
              }}>Teléfono</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' }, 
                fontWeight: 'bold',
                display: { xs: 'none', md: 'table-cell' }
              }}>Fecha Registro</TableCell>
              <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {user.nombre} {user.apellido}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.rol}
                      size="small"
                      color={getRolColor(user.rol)}
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    display: { xs: 'none', sm: 'table-cell' }
                  }}>
                    {user.telefono || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.activo ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={user.activo ? 'success' : 'default'}
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    display: { xs: 'none', md: 'table-cell' }
                  }}>
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, user)}
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                      <MoreVertIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          sx={{
            '& .MuiTablePagination-toolbar': {
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 }
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
        />
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditUser}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleUpdatePassword}>
          <LockResetIcon sx={{ mr: 1 }} />
          Actualizar Contraseña
        </MenuItem>
        <MenuItem onClick={handleDeleteUser}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* User Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' }
          }
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {dialogType === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre *"
                  {...register('nombre')}
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                  size="medium"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido *"
                  {...register('apellido')}
                  error={!!errors.apellido}
                  helperText={errors.apellido?.message}
                  size="medium"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  size="medium"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
              </Grid>
              {dialogType === 'create' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contraseña *"
                    type="password"
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    size="medium"
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.rol} size="medium">
                  <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Rol *</InputLabel>
                  <Select
                    label="Rol *"
                    {...register('rol')}
                    defaultValue="administrativo"
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    <MenuItem value="admin" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Admin</MenuItem>
                    <MenuItem value="administrativo" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Administrativo</MenuItem>
                  </Select>
                  {errors.rol && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {errors.rol?.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  {...register('telefono')}
                  error={!!errors.telefono}
                  helperText={errors.telefono?.message}
                  size="medium"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 1 }}>
            <Button 
              onClick={() => setDialogOpen(false)}
              size="large"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: { xs: 2, sm: 3 }
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              size="large"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: { xs: 2, sm: 3 }
              }}
            >
              {dialogType === 'create' ? 'Crear' : 'Actualizar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Password Update Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' }
          }
        }}
      >
        <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
          <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Actualizar Contraseña - {selectedUser?.nombre} {selectedUser?.apellido}
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nueva Contraseña *"
                  type="password"
                  {...registerPassword('password')}
                  error={!!passwordErrors.password}
                  helperText={passwordErrors.password?.message}
                  size="medium"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirmar Contraseña *"
                  type="password"
                  {...registerPassword('confirmPassword')}
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword?.message}
                  size="medium"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 1 }}>
            <Button 
              onClick={() => setPasswordDialogOpen(false)}
              size="large"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: { xs: 2, sm: 3 }
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              size="large"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: { xs: 2, sm: 3 }
              }}
            >
              Actualizar Contraseña
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UsersPage;

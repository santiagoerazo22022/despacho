import React, { useState, useEffect } from 'react';
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
  Alert,
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(dialogType === 'create' ? createUserSchema : updateUserSchema),
  });

  const fetchUsers = async () => {
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
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchTerm, rolFilter]);

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
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateUser}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              label="Buscar usuarios"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={rolFilter}
                label="Rol"
                onChange={(e) => {
                  setRolFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="administrativo">Administrativo</MenuItem>
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
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Registro</TableCell>
              <TableCell align="center">Acciones</TableCell>
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
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {user.nombre} {user.apellido}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.rol}
                      size="small"
                      color={getRolColor(user.rol)}
                    />
                  </TableCell>
                  <TableCell>{user.telefono || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.activo ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={user.activo ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, user)}
                    >
                      <MoreVertIcon />
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
        <MenuItem onClick={handleDeleteUser}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* User Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {dialogType === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre *"
                  {...register('nombre')}
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido *"
                  {...register('apellido')}
                  error={!!errors.apellido}
                  helperText={errors.apellido?.message}
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
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.rol}>
                  <InputLabel>Rol *</InputLabel>
                  <Select
                    label="Rol *"
                    {...register('rol')}
                    defaultValue="administrativo"
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="administrativo">Administrativo</MenuItem>
                  </Select>
                  {errors.rol && (
                    <Typography variant="caption" color="error" sx={{ ml: 2 }}>
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
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              {dialogType === 'create' ? 'Crear' : 'Actualizar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UsersPage;

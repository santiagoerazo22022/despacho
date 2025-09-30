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
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  GetApp as GetAppIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { expedienteService } from '../services/expedienteService';
import { useAuth } from '../contexts/AuthContext';

const ExpedientesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExpediente, setSelectedExpediente] = useState(null);

  const fetchExpedientes = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        area: areaFilter,
        tipo: tipoFilter,
      };

      const response = await expedienteService.getExpedientes(params);
      setExpedientes(response.data.expedientes);
      setTotalCount(response.data.pagination.totalItems);
      
      console.log('Expedientes recibidos:', response.data.expedientes.map(e => ({ 
        id: e.id, 
        numero_expediente: e.numero_expediente, 
        tipo_expediente: e.tipo_expediente 
      }))); // Debug log
    } catch (error) {
      toast.error('Error al cargar los expedientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpedientes();
  }, [page, rowsPerPage, searchTerm, areaFilter, tipoFilter]);

  // Refrescar datos cuando se monta el componente
  useEffect(() => {
    fetchExpedientes();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleMenuClick = (event, expediente) => {
    setAnchorEl(event.currentTarget);
    setSelectedExpediente(expediente);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExpediente(null);
  };

  const handleViewExpediente = () => {
    navigate(`/expedientes/${selectedExpediente.id}`);
    handleMenuClose();
  };

  const handleDownloadFile = async () => {
    try {
      if (!selectedExpediente.nombre_archivo_escaneado) {
        toast.warning('Este expediente no tiene archivo escaneado');
        return;
      }

      const response = await expedienteService.downloadFile(selectedExpediente.id);
      expedienteService.downloadFileHelper(
        response.data,
        selectedExpediente.nombre_archivo_escaneado
      );
      toast.success('Archivo descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el archivo');
    } finally {
      handleMenuClose();
    }
  };

  const handleDownloadComprobante = async () => {
    try {
      const response = await expedienteService.downloadComprobante(selectedExpediente.id);
      expedienteService.downloadFileHelper(
        response.data,
        `comprobante-${selectedExpediente.numero_expediente}.pdf`
      );
      toast.success('Comprobante descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el comprobante');
    } finally {
      handleMenuClose();
    }
  };

  const handleEditExpediente = () => {
    navigate(`/expedientes/${selectedExpediente.id}/editar`);
    handleMenuClose();
  };

  // Función para refrescar la lista cuando se regresa de editar
  useEffect(() => {
    const handleFocus = () => {
      fetchExpedientes();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleDeleteExpediente = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este expediente?')) {
      return;
    }

    try {
      await expedienteService.deleteExpediente(selectedExpediente.id);
      toast.success('Expediente eliminado exitosamente');
      fetchExpedientes(); // Refresh the list
    } catch (error) {
      toast.error('Error al eliminar el expediente');
    } finally {
      handleMenuClose();
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Expedientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/expedientes/nuevo')}
        >
          Nuevo Expediente
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Buscar expedientes"
              value={searchTerm}
              onChange={handleSearchChange}
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
            <TextField
              fullWidth
              label="Área"
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setPage(0);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={tipoFilter}
                label="Tipo"
                onChange={(e) => {
                  setTipoFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Expediente</MenuItem>
                <MenuItem value="false">Actuación</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setAreaFilter('');
                setTipoFilter('');
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
              <TableCell>Número</TableCell>
              <TableCell>Solicitante</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Área</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : expedientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No se encontraron expedientes
                </TableCell>
              </TableRow>
            ) : (
              expedientes.map((expediente) => (
                <TableRow key={expediente.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {expediente.numero_expediente}
                    </Typography>
                  </TableCell>
                  <TableCell>{expediente.nombre_solicitante}</TableCell>
                  <TableCell>{expediente.dni}</TableCell>
                  <TableCell>{expediente.area}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color={expediente.tipo_expediente === true || expediente.tipo_expediente === 1 ? 'primary' : 'secondary'}>
                      {expediente.tipo_expediente === true || expediente.tipo_expediente === 1 ? 'Expediente' : 'Actuación'}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(expediente.fecha_carga)}</TableCell>
                  <TableCell>
                    {expediente.usuario_creador
                      ? `${expediente.usuario_creador.nombre} ${expediente.usuario_creador.apellido}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/expedientes/${expediente.id}`)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, expediente)}
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
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewExpediente}>
          <VisibilityIcon sx={{ mr: 1 }} />
          Ver Detalles
        </MenuItem>
        {selectedExpediente?.nombre_archivo_escaneado && (
          <MenuItem onClick={handleDownloadFile}>
            <DownloadIcon sx={{ mr: 1 }} />
            Descargar Archivo
          </MenuItem>
        )}
        <MenuItem onClick={handleDownloadComprobante}>
          <GetAppIcon sx={{ mr: 1 }} />
          Descargar Comprobante
        </MenuItem>
        {/* Show edit/delete options for admin and administrativo users */}
        {(user?.rol === 'admin' || user?.rol === 'administrativo') && (
          <>
            <MenuItem onClick={handleEditExpediente}>
              <EditIcon sx={{ mr: 1 }} />
              Editar Expediente
            </MenuItem>
            <MenuItem onClick={handleDeleteExpediente} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Eliminar Expediente
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default ExpedientesPage;

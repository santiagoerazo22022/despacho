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
  IconButton,
  Grid,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { expedienteService } from '../services/expedienteService';
import { toast } from 'react-toastify';
import ExpedienteModal from '../components/ExpedienteModal/ExpedienteModal';
import ExpedienteDetailModal from '../components/ExpedienteDetailModal/ExpedienteDetailModal';

const ExpedientesPage = () => {
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingExpediente, setEditingExpediente] = useState(null);
  const [viewingExpedienteId, setViewingExpedienteId] = useState(null);

  const fetchExpedientes = useCallback(async () => {
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
  }, [page, rowsPerPage, searchTerm, areaFilter, tipoFilter]);

  useEffect(() => {
    fetchExpedientes();
  }, [fetchExpedientes]);

  // Función para refrescar la lista cuando se regresa de editar
  useEffect(() => {
    const handleFocus = () => {
      fetchExpedientes();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchExpedientes]);

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

  // Modal handlers
  const handleCreateExpediente = () => {
    setEditingExpediente(null);
    setModalOpen(true);
  };

  const handleEditExpedienteModal = (expediente) => {
    setEditingExpediente(expediente);
    setModalOpen(true);
  };

  const handleViewExpediente = (expedienteId) => {
    setViewingExpedienteId(expedienteId);
    setDetailModalOpen(true);
  };

  const handleDeleteExpedienteModal = async (expediente) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este expediente?')) {
      return;
    }

    try {
      await expedienteService.deleteExpediente(expediente.id);
      toast.success('Expediente eliminado exitosamente');
      fetchExpedientes();
    } catch (error) {
      toast.error('Error al eliminar el expediente');
    }
  };

  const handleModalSuccess = () => {
    fetchExpedientes();
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
          Expedientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateExpediente}
          size="large"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Nuevo Expediente
          </Typography>
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Buscar expedientes"
              value={searchTerm}
              onChange={handleSearchChange}
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
            <TextField
              fullWidth
              label="Área"
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setPage(0);
              }}
              size="medium"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="medium">
              <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Tipo</InputLabel>
              <Select
                value={tipoFilter}
                label="Tipo"
                onChange={(e) => {
                  setTipoFilter(e.target.value);
                  setPage(0);
                }}
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Todos</MenuItem>
                <MenuItem value="true" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Expediente</MenuItem>
                <MenuItem value="false" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Actuación</MenuItem>
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
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>Número</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>Solicitante</TableCell>
              <TableCell sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' }, 
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'table-cell' }
              }}>DNI</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>Área</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>Tipo</TableCell>
              <TableCell sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' }, 
                fontWeight: 'bold',
                display: { xs: 'none', md: 'table-cell' }
              }}>Fecha</TableCell>
              <TableCell sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' }, 
                fontWeight: 'bold',
                display: { xs: 'none', lg: 'table-cell' }
              }}>Usuario</TableCell>
              <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>Acciones</TableCell>
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
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Typography variant="body2" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {expediente.numero_expediente}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {expediente.nombre_solicitante}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    display: { xs: 'none', sm: 'table-cell' }
                  }}>
                    {expediente.dni}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {expediente.area}
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color={expediente.tipo_expediente === true || expediente.tipo_expediente === 1 ? 'primary' : 'secondary'}
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                      {expediente.tipo_expediente === true || expediente.tipo_expediente === 1 ? 'Expediente' : 'Actuación'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    display: { xs: 'none', md: 'table-cell' }
                  }}>
                    {formatDate(expediente.fecha_carga)}
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    display: { xs: 'none', lg: 'table-cell' }
                  }}>
                    {expediente.usuario_creador
                      ? `${expediente.usuario_creador.nombre} ${expediente.usuario_creador.apellido}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => handleViewExpediente(expediente.id)}
                          sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                          <VisibilityIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEditExpedienteModal(expediente)}
                          sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                          <EditIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteExpedienteModal(expediente)}
                          sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                          <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
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

      {/* Modals */}
      <ExpedienteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        expediente={editingExpediente}
        onSuccess={handleModalSuccess}
      />

      <ExpedienteDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        expedienteId={viewingExpedienteId}
        onEdit={handleEditExpedienteModal}
        onDelete={handleDeleteExpedienteModal}
      />
    </Box>
  );
};

export default ExpedientesPage;

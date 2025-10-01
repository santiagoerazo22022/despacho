import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import decretoService from '../services/decretoService';

const DecretosPage = () => {
  const navigate = useNavigate();
  const [decretos, setDecretos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    tipo_documento: '',
    estado: '',
    expediente_vinculado: ''
  });

  // Filter dialog
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [decretoToDelete, setDecretoToDelete] = useState(null);

  const loadDecretos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await decretoService.getDecretos(params);
      
      if (response.success) {
        setDecretos(response.data.decretos);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
      } else {
        setError('Error al cargar los decretos');
      }
    } catch (error) {
      console.error('Error loading decretos:', error);
      setError(error.message || 'Error al cargar los decretos');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadDecretos();
  }, [pagination.page, pagination.limit, loadDecretos]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadDecretos();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      tipo_documento: '',
      estado: '',
      expediente_vinculado: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDeleteDecreto = async () => {
    try {
      await decretoService.deleteDecreto(decretoToDelete.id);
      setDeleteDialogOpen(false);
      setDecretoToDelete(null);
      loadDecretos();
    } catch (error) {
      console.error('Error deleting decreto:', error);
      setError(error.message || 'Error al eliminar el decreto');
    }
  };

  const handleDownloadFile = async (decreto) => {
    try {
      const blob = await decretoService.downloadDecretoFile(decreto.id);
      decretoService.downloadFile(blob, decreto.nombre_archivo || 'decreto.pdf');
    } catch (error) {
      console.error('Error downloading file:', error);
      setError(error.message || 'Error al descargar el archivo');
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      vigente: 'success',
      suspendido: 'warning',
      derogado: 'error',
      vencido: 'default'
    };
    return colors[estado] || 'default';
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

  const getTipoDocumentoColor = (tipo) => {
    return tipo === 'decreto' ? 'primary' : 'secondary';
  };

  if (loading && decretos.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Decretos y Resoluciones
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/decretos/create')}
        >
          Nuevo Decreto/Resolución
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar"
                placeholder="Número, título o autoridad..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filters.tipo_documento}
                  onChange={(e) => handleFilterChange('tipo_documento', e.target.value)}
                  label="Tipo"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="decreto">Decreto</MenuItem>
                  <MenuItem value="resolucion">Resolución</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="vigente">Vigente</MenuItem>
                  <MenuItem value="suspendido">Suspendido</MenuItem>
                  <MenuItem value="derogado">Derogado</MenuItem>
                  <MenuItem value="vencido">Vencido</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFilterDialogOpen(true)}
                fullWidth
              >
                Más Filtros
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="text"
                onClick={clearFilters}
                fullWidth
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Decretos Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Emisión</TableCell>
                <TableCell>Expediente Vinculado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {decretos.map((decreto) => (
                <TableRow key={decreto.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {decreto.numero_decreto}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={decreto.tipo_documento}
                      color={getTipoDocumentoColor(decreto.tipo_documento)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {decreto.titulo}
                    </Typography>
                    {decreto.tipo_documento === 'resolucion' && decreto.secretaria && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Secretaría: {decreto.secretaria}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={decreto.estado}
                      color={getEstadoColor(decreto.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(decreto.fecha_emision)}
                  </TableCell>
                  <TableCell>
                    {decreto.expediente_vinculado ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinkIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {decreto.expediente_vinculado.numero_expediente}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin vincular
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/decretos/${decreto.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/decretos/${decreto.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {decreto.ruta_archivo && (
                        <Tooltip title="Descargar archivo">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadFile(decreto)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setDecretoToDelete(decreto);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el decreto "{decretoToDelete?.numero_decreto}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteDecreto} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filtros Avanzados</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Número de Expediente Vinculado"
                value={filters.expediente_vinculado}
                onChange={(e) => handleFilterChange('expediente_vinculado', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancelar</Button>
          <Button onClick={() => {
            setFilterDialogOpen(false);
            handleSearch();
          }} variant="contained">
            Aplicar Filtros
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DecretosPage;

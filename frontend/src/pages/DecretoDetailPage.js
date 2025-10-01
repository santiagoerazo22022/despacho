import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import decretoService from '../services/decretoService';

const DecretoDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [decreto, setDecreto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadDecreto = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await decretoService.getDecretoById(id);
      
      if (response.success) {
        setDecreto(response.data);
      } else {
        setError('Error al cargar el decreto');
      }
    } catch (error) {
      console.error('Error loading decreto:', error);
      setError(error.message || 'Error al cargar el decreto');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDecreto();
  }, [id, loadDecreto]);

  const handleDeleteDecreto = async () => {
    try {
      await decretoService.deleteDecreto(id);
      setDeleteDialogOpen(false);
      navigate('/decretos');
    } catch (error) {
      console.error('Error deleting decreto:', error);
      setError(error.message || 'Error al eliminar el decreto');
    }
  };

  const handleDownloadFile = async () => {
    try {
      const blob = await decretoService.downloadDecretoFile(id);
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

  const getTipoDocumentoColor = (tipo) => {
    return tipo === 'decreto' ? 'primary' : 'secondary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/decretos')}
        >
          Volver a Decretos
        </Button>
      </Box>
    );
  }

  if (!decreto) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Decreto no encontrado
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/decretos')}
          sx={{ mt: 2 }}
        >
          Volver a Decretos
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/decretos')}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            {decreto.numero_decreto}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Editar">
            <IconButton
              onClick={() => navigate(`/decretos/${id}/edit`)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          {decreto.ruta_archivo && (
            <Tooltip title="Descargar archivo">
              <IconButton onClick={handleDownloadFile}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Eliminar">
            <IconButton
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información General
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo de Documento
                  </Typography>
                  <Chip
                    label={decreto.tipo_documento}
                    color={getTipoDocumentoColor(decreto.tipo_documento)}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado
                  </Typography>
                  <Chip
                    label={decreto.estado}
                    color={getEstadoColor(decreto.estado)}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Título
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {decreto.titulo}
                  </Typography>
                </Grid>

                {decreto.descripcion && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Descripción
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {decreto.descripcion}
                    </Typography>
                  </Grid>
                )}

                {decreto.autoridad_emisora && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Autoridad Emisora
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {decreto.autoridad_emisora}
                    </Typography>
                  </Grid>
                )}

                {decreto.tipo_documento === 'resolucion' && decreto.secretaria && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Secretaría
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {decreto.secretaria}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Expediente Vinculado */}
          {decreto.expediente_vinculado && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Expediente Vinculado
                </Typography>
                
                <Box display="flex" alignItems="center" gap={2}>
                  <LinkIcon color="primary" />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {decreto.expediente_vinculado.numero_expediente}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {decreto.expediente_vinculado.nombre_solicitante} - {decreto.expediente_vinculado.area}
                    </Typography>
                    <Chip
                      label={decreto.expediente_vinculado.tipo_expediente ? 'Expediente' : 'Actuación'}
                      size="small"
                      color={decreto.expediente_vinculado.tipo_expediente ? 'primary' : 'secondary'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          {decreto.notas && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notas
                </Typography>
                <Typography variant="body1">
                  {decreto.notas}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Fechas */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fechas
              </Typography>
              
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha de Emisión
                </Typography>
                <Typography variant="body1">
                  {formatDate(decreto.fecha_emision)}
                </Typography>
              </Box>

              {decreto.fecha_vigencia && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de Vigencia
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(decreto.fecha_vigencia)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Creado
                </Typography>
                <Typography variant="body1">
                  {formatDate(decreto.createdAt)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Última Modificación
                </Typography>
                <Typography variant="body1">
                  {formatDate(decreto.updatedAt)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Archivo */}
          {decreto.ruta_archivo && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Archivo Adjunto
                </Typography>
                
                <Box display="flex" alignItems="center" gap={2}>
                  <DescriptionIcon color="primary" />
                  <Box flex={1}>
                    <Typography variant="body1" fontWeight="medium">
                      {decreto.nombre_archivo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Archivo disponible
                    </Typography>
                  </Box>
                  <Tooltip title="Descargar">
                    <IconButton onClick={handleDownloadFile}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Usuario Creador */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Usuario Creador
              </Typography>
              
              <Typography variant="body1">
                {decreto.usuario_creador?.nombre} {decreto.usuario_creador?.apellido}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {decreto.usuario_creador?.email}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el decreto "{decreto.numero_decreto}"?
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
    </Box>
  );
};

export default DecretoDetailPage;

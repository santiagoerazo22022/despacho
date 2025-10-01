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
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { expedienteService } from '../../services/expedienteService';

const ExpedienteDetailModal = ({ open, onClose, expedienteId, onEdit, onDelete }) => {
  const [expediente, setExpediente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadExpediente = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading expediente with ID:', expedienteId);
      const response = await expedienteService.getExpedienteById(expedienteId);
      console.log('ExpedienteDetailModal response:', response);
      
      if (response.success) {
        console.log('Expediente data received:', response.data.expediente);
        console.log('Expediente fields:', {
          id: response.data.expediente?.id,
          numero_expediente: response.data.expediente?.numero_expediente,
          nombre_solicitante: response.data.expediente?.nombre_solicitante,
          area: response.data.expediente?.area,
          fecha_carga: response.data.expediente?.fecha_carga,
          usuario_creador: response.data.expediente?.usuario_creador,
          ruta_comprobante_pdf: response.data.expediente?.ruta_comprobante_pdf
        });
        setExpediente(response.data.expediente);
      } else {
        console.error('Response success is false:', response);
        setError('Error al cargar el expediente');
      }
    } catch (error) {
      console.error('Error loading expediente:', error);
      setError(error.message || 'Error al cargar el expediente');
    } finally {
      setLoading(false);
    }
  }, [expedienteId]);

  useEffect(() => {
    if (open && expedienteId) {
      loadExpediente();
    }
  }, [open, expedienteId, loadExpediente]);

  const handleDownloadFile = async () => {
    try {
      const response = await expedienteService.downloadFile(expedienteId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = expediente.nombre_archivo_escaneado || 'expediente.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError(error.message || 'Error al descargar el archivo');
    }
  };

  const handleDownloadComprobante = async () => {
    try {
      console.log('Downloading comprobante for expediente:', expedienteId);
      const response = await expedienteService.downloadComprobante(expedienteId);
      console.log('Comprobante download response:', response);
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprobante-${expediente.numero_expediente.replace(/\//g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('Comprobante downloaded successfully');
    } catch (error) {
      console.error('Error downloading comprobante:', error);
      setError(error.message || 'Error al descargar el comprobante');
    }
  };

  const formatDate = (dateString) => {
    console.log('Formatting date:', dateString);
    if (!dateString) {
      console.log('No date string provided');
      return 'No especificada';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', dateString);
        return 'Fecha inválida';
      }
      const formatted = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      console.log('Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };

  const handleClose = () => {
    setExpediente(null);
    setError(null);
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Error</Typography>
            <Button onClick={handleClose} startIcon={<CloseIcon />}>
              Cerrar
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error">{error}</Alert>
        </DialogContent>
      </Dialog>
    );
  }

  if (!expediente) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {expediente.numero_expediente}
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Editar">
              <IconButton onClick={() => onEdit(expediente)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton color="error" onClick={() => onDelete(expediente)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Button onClick={handleClose} startIcon={<CloseIcon />}>
              Cerrar
            </Button>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
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
                      Tipo
                    </Typography>
                    <Chip
                      label={expediente.tipo_expediente ? 'Expediente' : 'Actuación'}
                      color={expediente.tipo_expediente ? 'primary' : 'secondary'}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Área
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {expediente.area}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Solicitante
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {expediente.nombre_solicitante}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      DNI
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {expediente.dni}
                    </Typography>
                  </Grid>

                  {expediente.descripcion && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Descripción
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {expediente.descripcion}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Decretos Vinculados */}
            {expediente.decretos_vinculados && expediente.decretos_vinculados.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Decretos/Resoluciones Vinculados
                  </Typography>
                  
                  {expediente.decretos_vinculados.map((decreto) => (
                    <Box key={decreto.id} display="flex" alignItems="center" gap={2} mb={2}>
                      <LinkIcon color="primary" />
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {decreto.numero_decreto}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {decreto.titulo}
                        </Typography>
                        <Chip
                          label={decreto.tipo_documento}
                          size="small"
                          color={decreto.tipo_documento === 'decreto' ? 'primary' : 'secondary'}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Dates */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fechas
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de Carga
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(expediente.fecha_carga)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Creado
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(expediente.createdAt)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Última Modificación
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(expediente.updatedAt)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Files */}
            {(expediente.ruta_archivo_escaneado || expediente.ruta_comprobante_pdf) && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Archivos Disponibles
                  </Typography>
                  
                  {expediente.ruta_archivo_escaneado && (
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <DescriptionIcon color="primary" />
                      <Box flex={1}>
                        <Typography variant="body1" fontWeight="medium">
                          Archivo Escaneado
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {expediente.nombre_archivo_escaneado}
                        </Typography>
                      </Box>
                      <Tooltip title="Descargar">
                        <IconButton onClick={handleDownloadFile}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}

                  {expediente.ruta_comprobante_pdf && (
                    <Box display="flex" alignItems="center" gap={2}>
                      <DescriptionIcon color="secondary" />
                      <Box flex={1}>
                        <Typography variant="body1" fontWeight="medium">
                          Comprobante PDF
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Comprobante de carga
                        </Typography>
                      </Box>
                      <Tooltip title="Descargar">
                        <IconButton onClick={handleDownloadComprobante}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* User Info */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Usuario Creador
                </Typography>
                
                <Typography variant="body1">
                  {expediente.usuario_creador?.nombre} {expediente.usuario_creador?.apellido}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {expediente.usuario_creador?.email}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ExpedienteDetailModal;

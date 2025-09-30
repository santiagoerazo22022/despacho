import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  GetApp as GetAppIcon,
  Description as DescriptionIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { expedienteService } from '../services/expedienteService';
import { useAuth } from '../contexts/AuthContext';

const ExpedienteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expediente, setExpediente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpediente = async () => {
    try {
      setLoading(true);
      const response = await expedienteService.getExpedienteById(id);
      setExpediente(response.data.expediente);
    } catch (error) {
      setError('Error al cargar el expediente');
      toast.error('Error al cargar el expediente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpediente();
  }, [id]);

  const handleDownloadFile = async () => {
    try {
      const response = await expedienteService.downloadFile(id);
      expedienteService.downloadFileHelper(
        response.data,
        expediente.nombre_archivo_escaneado
      );
      toast.success('Archivo descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el archivo');
    }
  };

  const handleDownloadComprobante = async () => {
    try {
      const response = await expedienteService.downloadComprobante(id);
      expedienteService.downloadFileHelper(
        response.data,
        `comprobante-${expediente.numero_expediente}.pdf`
      );
      toast.success('Comprobante descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el comprobante');
    }
  };

  const handlePrintComprobante = async () => {
    try {
      const response = await expedienteService.downloadComprobante(id);
      
      // Create blob URL for the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open PDF in new window for printing
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        // Wait for the PDF to load and then trigger print dialog
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 1000);
        };
        
        toast.success('Comprobante abierto para imprimir');
      } else {
        toast.error('No se pudo abrir la ventana de impresión. Verifique que las ventanas emergentes estén habilitadas.');
      }
      
      // Clean up the blob URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
      
    } catch (error) {
      toast.error('Error al abrir el comprobante para imprimir');
    }
  };

  const handleEditExpediente = () => {
    navigate(`/expedientes/${id}/editar`);
  };

  const handleDeleteExpediente = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este expediente?')) {
      return;
    }

    try {
      await expedienteService.deleteExpediente(id);
      toast.success('Expediente eliminado exitosamente');
      navigate('/expedientes');
    } catch (error) {
      toast.error('Error al eliminar el expediente');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !expediente) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/expedientes')}
          sx={{ mb: 2 }}
        >
          Volver a Expedientes
        </Button>
        <Alert severity="error">
          {error || 'Expediente no encontrado'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/expedientes')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4">
          {expediente.tipo_expediente === true || expediente.tipo_expediente === 1 ? 'Expediente' : 'Actuación'} {expediente.numero_expediente}
        </Typography>
        {/* Show edit/delete buttons for admin and administrativo users */}
        {(user?.rol === 'admin' || user?.rol === 'administrativo') && (
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditExpediente}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteExpediente}
            >
              Eliminar
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Información del Solicitante */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Datos del Solicitante
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Nombre
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {expediente.nombre_solicitante}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  DNI
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {expediente.dni}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Información del Expediente */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Datos del Expediente
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Área
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {expediente.area}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Tipo
                </Typography>
        <Typography variant="body1" fontWeight="bold" color={expediente.tipo_expediente === true || expediente.tipo_expediente === 1 ? 'primary' : 'secondary'}>
          {expediente.tipo_expediente === true || expediente.tipo_expediente === 1 ? 'Expediente' : 'Actuación'}
        </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Fecha de Carga
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatDate(expediente.fecha_carga)}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Usuario Creador
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {expediente.usuario_creador
                    ? `${expediente.usuario_creador.nombre} ${expediente.usuario_creador.apellido}`
                    : 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Descripción */}
        {expediente.descripcion && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Descripción
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {expediente.descripcion}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Archivos y Descargas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Archivos y Descargas
              </Typography>
              
              <Grid container spacing={2}>
                {/* Archivo Escaneado */}
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Archivo Escaneado
                    </Typography>
                    {expediente.nombre_archivo_escaneado ? (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {expediente.nombre_archivo_escaneado}
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={handleDownloadFile}
                          fullWidth
                        >
                          Descargar Archivo
                        </Button>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hay archivo escaneado
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Comprobante PDF */}
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <GetAppIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Comprobante PDF
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Comprobante mejorado generado automáticamente
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PrintIcon />}
                        onClick={handlePrintComprobante}
                        fullWidth
                      >
                        Imprimir Comprobante
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<GetAppIcon />}
                        onClick={handleDownloadComprobante}
                        fullWidth
                      >
                        Descargar PDF
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExpedienteDetailPage;

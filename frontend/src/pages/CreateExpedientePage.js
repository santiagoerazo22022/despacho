import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';

import { expedienteService } from '../services/expedienteService';

const schema = yup.object({
  nombre_solicitante: yup
    .string()
    .required('El nombre del solicitante es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  area: yup
    .string()
    .max(100, 'El área no puede exceder 100 caracteres'),
  descripcion: yup
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  tipo_expediente: yup
    .boolean()
    .required('El tipo es requerido'),
});

const CreateExpedientePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      toast.success(`Archivo "${file.name}" seleccionado correctamente`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error('El archivo es demasiado grande. Máximo 10MB.');
      } else if (error.code === 'file-invalid-type') {
        toast.error('Tipo de archivo no válido. Solo se permiten PDF e imágenes.');
      } else {
        toast.error('Error al subir el archivo.');
      }
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('nombre_solicitante', data.nombre_solicitante);
      formData.append('area', data.area);
      formData.append('tipo_expediente', data.tipo_expediente === 'true' || data.tipo_expediente === true);
      if (data.descripcion) {
        formData.append('descripcion', data.descripcion);
      }
      if (uploadedFile) {
        formData.append('archivo_escaneado', uploadedFile);
      }

      const response = await expedienteService.createExpediente(formData);
      console.log('Create expediente response:', response);
      const expedienteId = response.data.expediente.id;
      
      toast.success('¡Expediente creado exitosamente!');

      // Automatically download and open the receipt for printing
      try {
        console.log('Attempting to download comprobante for expediente:', expedienteId);
        const comprobanteResponse = await expedienteService.downloadComprobante(expedienteId);
        console.log('Comprobante response received:', comprobanteResponse);
        
        // Create blob URL for the PDF
        const blob = new Blob([comprobanteResponse.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        console.log('Blob URL created:', url);
        
        // Open PDF in new window for printing
        const printWindow = window.open(url, '_blank');
        console.log('Print window opened:', printWindow);
        
        if (printWindow) {
          // Wait for the PDF to load and then trigger print dialog
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 1000);
          };
          
          toast.success('Comprobante generado. Se abrirá automáticamente para imprimir.');
        } else {
          // Fallback: download the file if popup is blocked
          const link = document.createElement('a');
          link.href = url;
          link.download = `comprobante-${response.data.expediente.numero_expediente.replace(/\//g, '-')}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.info('Comprobante descargado. Ábralo para imprimir.');
        }
        
        // Clean up the blob URL after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 10000);
        
      } catch (comprobanteError) {
        console.error('Error downloading comprobante:', comprobanteError);
        toast.warning('Expediente creado, pero hubo un problema al generar el comprobante. Puede descargarlo desde la página de detalles.');
      }

      navigate(`/expedientes/${expedienteId}`);
    } catch (error) {
      console.error('Error creating expediente:', error);
      toast.error('Error al crear el expediente');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    toast.info('Archivo removido');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Nuevo Expediente
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete los datos del expediente. Los campos marcados con * son obligatorios.
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Datos del Solicitante */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Datos del Solicitante
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Solicitante *"
                    {...register('nombre_solicitante')}
                    error={!!errors.nombre_solicitante}
                    helperText={errors.nombre_solicitante?.message}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Área"
                    {...register('area')}
                    error={!!errors.area}
                    helperText={errors.area?.message}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Datos del Expediente */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Datos del Expediente
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Área"
                    {...register('area')}
                    error={!!errors.area}
                    helperText={errors.area?.message}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.tipo_expediente}>
                    <InputLabel>Tipo *</InputLabel>
                    <Select
                      {...register('tipo_expediente')}
                      defaultValue={true}
                      label="Tipo *"
                      disabled={loading}
                    >
                      <MenuItem value={true}>Expediente</MenuItem>
                      <MenuItem value={false}>Actuación</MenuItem>
                    </Select>
                    {errors.tipo_expediente && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {errors.tipo_expediente.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Descripción"
                    {...register('descripcion')}
                    error={!!errors.descripcion}
                    helperText={errors.descripcion?.message}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Archivo Escaneado */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Archivo Escaneado (Opcional)
              </Typography>
              
              {!uploadedFile ? (
                <Card
                  {...getRootProps()}
                  sx={{
                    border: 2,
                    borderStyle: 'dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    backgroundColor: isDragActive ? 'primary.light' : 'grey.50',
                    cursor: 'pointer',
                    p: 4,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.light',
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUploadIcon
                    sx={{
                      fontSize: 48,
                      color: 'primary.main',
                      mb: 2,
                    }}
                  />
                  <Typography variant="h6" gutterBottom>
                    {isDragActive
                      ? 'Suelte el archivo aquí...'
                      : 'Arrastre un archivo aquí o haga clic para seleccionar'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Se permiten archivos PDF e imágenes (PNG, JPG, JPEG, GIF)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tamaño máximo: 10MB
                  </Typography>
                </Card>
              ) : (
                <Card sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DescriptionIcon color="primary" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {uploadedFile.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(uploadedFile.size)}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={removeFile}
                      disabled={loading}
                    >
                      Remover
                    </Button>
                  </Box>
                </Card>
              )}
            </Paper>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/expedientes')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Expediente'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Información:</strong> Al crear el expediente se generará automáticamente un 
          comprobante en PDF mejorado que se abrirá directamente para imprimir. También podrá 
          descargarlo posteriormente desde la página de detalles del expediente.
        </Typography>
      </Alert>
    </Box>
  );
};

export default CreateExpedientePage;

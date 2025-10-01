import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { expedienteService } from '../../services/expedienteService';

const ExpedienteModal = ({ open, onClose, expediente = null, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre_solicitante: '',
    area: '',
    descripcion: '',
    tipo_expediente: true, // true = Expediente, false = Actuación
    archivo_escaneado: null
  });

  const isEdit = Boolean(expediente);

  useEffect(() => {
    if (open) {
      if (isEdit && expediente) {
        setFormData({
          nombre_solicitante: expediente.nombre_solicitante || '',
          area: expediente.area || '',
          descripcion: expediente.descripcion || '',
          tipo_expediente: expediente.tipo_expediente !== false,
          archivo_escaneado: null
        });
      } else {
        setFormData({
          nombre_solicitante: '',
          area: '',
          descripcion: '',
          tipo_expediente: true,
          archivo_escaneado: null
        });
      }
      setError(null);
    }
  }, [open, expediente, isEdit]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, archivo_escaneado: file }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const submitData = { ...formData };
      
      if (isEdit) {
        await expedienteService.updateExpediente(expediente.id, submitData);
      } else {
        await expedienteService.createExpediente(submitData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving expediente:', error);
      setError(error.message || 'Error al guardar el expediente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

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
            {isEdit ? 'Editar Expediente/Actuación' : 'Nuevo Expediente/Actuación'}
          </Typography>
          <Button
            onClick={handleClose}
            startIcon={<CloseIcon />}
            variant="outlined"
            size="small"
          >
            Cerrar
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información Básica
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Solicitante"
                value={formData.nombre_solicitante}
                onChange={(e) => handleInputChange('nombre_solicitante', e.target.value)}
                required
                helperText="Nombre completo del solicitante"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Área"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                helperText="Área o dependencia correspondiente"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.tipo_expediente}
                    onChange={(e) => handleInputChange('tipo_expediente', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">
                      Tipo: 
                    </Typography>
                    <Chip
                      label={formData.tipo_expediente ? 'Expediente' : 'Actuación'}
                      color={formData.tipo_expediente ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </Box>
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                multiline
                rows={4}
                helperText="Descripción detallada del expediente o actuación"
              />
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Archivo Escaneado
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ mb: 2 }}
              >
                {formData.archivo_escaneado ? formData.archivo_escaneado.name : 'Seleccionar Archivo'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </Button>
              <Typography variant="caption" display="block" color="text.secondary">
                Formatos permitidos: PDF, DOC, DOCX, JPG, PNG
              </Typography>
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : (isEdit ? 'Actualizar' : 'Crear')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpedienteModal;

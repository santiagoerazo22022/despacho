import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import decretoService from '../services/decretoService';

const CreateEditDecretoPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expedientes, setExpedientes] = useState([]);

  const [formData, setFormData] = useState({
    numero_decreto: '',
    tipo_documento: 'decreto',
    titulo: '',
    descripcion: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vigencia: '',
    estado: 'vigente',
    autoridad_emisora: '',
    secretaria: '',
    numero_expediente_vinculado: '',
    tipo_expediente_vinculado: 'expediente',
    expediente_simple_id: null,
    notas: '',
    archivo: null
  });

  const [selectedExpediente, setSelectedExpediente] = useState(null);

  useEffect(() => {
    loadExpedientes();
    if (isEdit) {
      loadDecreto();
    }
  }, [id, isEdit]);

  const loadExpedientes = async () => {
    try {
      const response = await decretoService.getExpedientesForLink();
      if (response.success) {
        setExpedientes(response.data);
      }
    } catch (error) {
      console.error('Error loading expedientes:', error);
    }
  };

  const loadDecreto = async () => {
    try {
      setLoading(true);
      const response = await decretoService.getDecretoById(id);
      if (response.success) {
        const decreto = response.data;
        setFormData({
          numero_decreto: decreto.numero_decreto || '',
          tipo_documento: decreto.tipo_documento || 'decreto',
          titulo: decreto.titulo || '',
          descripcion: decreto.descripcion || '',
          fecha_emision: decreto.fecha_emision || new Date().toISOString().split('T')[0],
          fecha_vigencia: decreto.fecha_vigencia || '',
          estado: decreto.estado || 'vigente',
          autoridad_emisora: decreto.autoridad_emisora || '',
          secretaria: decreto.secretaria || '',
          numero_expediente_vinculado: decreto.numero_expediente_vinculado || '',
          tipo_expediente_vinculado: decreto.tipo_expediente_vinculado || 'expediente',
          expediente_simple_id: decreto.expediente_simple_id || null,
          notas: decreto.notas || '',
          archivo: null
        });

        if (decreto.expediente_vinculado) {
          setSelectedExpediente(decreto.expediente_vinculado);
        }
      }
    } catch (error) {
      console.error('Error loading decreto:', error);
      setError(error.message || 'Error al cargar el decreto');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExpedienteChange = (expediente) => {
    setSelectedExpediente(expediente);
    if (expediente) {
      setFormData(prev => ({
        ...prev,
        expediente_simple_id: expediente.id,
        numero_expediente_vinculado: expediente.numero_expediente,
        tipo_expediente_vinculado: expediente.tipo_expediente ? 'expediente' : 'actuacion'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        expediente_simple_id: null,
        numero_expediente_vinculado: '',
        tipo_expediente_vinculado: 'expediente'
      }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, archivo: file }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const submitData = { ...formData };
      
      if (isEdit) {
        await decretoService.updateDecreto(id, submitData);
      } else {
        await decretoService.createDecreto(submitData);
      }

      navigate('/decretos');
    } catch (error) {
      console.error('Error saving decreto:', error);
      setError(error.message || 'Error al guardar el decreto');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/decretos')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Editar Decreto/Resolución' : 'Nuevo Decreto/Resolución'}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardContent>
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
                  label="Número de Decreto/Resolución"
                  value={formData.numero_decreto}
                  onChange={(e) => handleInputChange('numero_decreto', e.target.value)}
                  required
                  helperText="Ej: DEC-2024-001, RES-2024-015"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Documento</InputLabel>
                  <Select
                    value={formData.tipo_documento}
                    onChange={(e) => handleInputChange('tipo_documento', e.target.value)}
                    label="Tipo de Documento"
                  >
                    <MenuItem value="decreto">Decreto</MenuItem>
                    <MenuItem value="resolucion">Resolución</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  required
                  multiline
                  rows={2}
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
                />
              </Grid>

              {/* Dates and Status */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Fechas y Estado
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Fecha de Emisión"
                  type="date"
                  value={formData.fecha_emision}
                  onChange={(e) => handleInputChange('fecha_emision', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Fecha de Vigencia"
                  type="date"
                  value={formData.fecha_vigencia}
                  onChange={(e) => handleInputChange('fecha_vigencia', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    label="Estado"
                  >
                    <MenuItem value="vigente">Vigente</MenuItem>
                    <MenuItem value="suspendido">Suspendido</MenuItem>
                    <MenuItem value="derogado">Derogado</MenuItem>
                    <MenuItem value="vencido">Vencido</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Authority */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Autoridad Emisora
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Autoridad Emisora"
                  value={formData.autoridad_emisora}
                  onChange={(e) => handleInputChange('autoridad_emisora', e.target.value)}
                  placeholder="Ej: Ministerio de Justicia, Tribunal Superior..."
                />
              </Grid>

              {formData.tipo_documento === 'resolucion' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Secretaría"
                    value={formData.secretaria}
                    onChange={(e) => handleInputChange('secretaria', e.target.value)}
                    placeholder="Ej: Secretaría de Gobierno, Secretaría de Hacienda..."
                    required
                  />
                </Grid>
              )}

              {/* Expediente Link */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Vinculación con Expediente
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <Autocomplete
                  options={expedientes}
                  getOptionLabel={(option) => `${option.numero_expediente} - ${option.nombre_solicitante} (${option.area})`}
                  value={selectedExpediente}
                  onChange={(event, newValue) => handleExpedienteChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Expediente/Actuación Vinculado"
                      placeholder="Buscar por número, nombre o área..."
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {option.numero_expediente}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.nombre_solicitante} - {option.area}
                        </Typography>
                        <Chip
                          label={option.tipo_expediente ? 'Expediente' : 'Actuación'}
                          size="small"
                          color={option.tipo_expediente ? 'primary' : 'secondary'}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Expediente</InputLabel>
                  <Select
                    value={formData.tipo_expediente_vinculado}
                    onChange={(e) => handleInputChange('tipo_expediente_vinculado', e.target.value)}
                    label="Tipo de Expediente"
                    disabled={!selectedExpediente}
                  >
                    <MenuItem value="expediente">Expediente</MenuItem>
                    <MenuItem value="actuacion">Actuación</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* File Upload */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Archivo del Decreto/Resolución
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                >
                  {formData.archivo ? formData.archivo.name : 'Seleccionar Archivo'}
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

              {/* Notes */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Notas Adicionales
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notas"
                  value={formData.notas}
                  onChange={(e) => handleInputChange('notas', e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Observaciones, comentarios o información adicional..."
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/decretos')}
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
                    {loading ? <CircularProgress size={20} /> : (isEdit ? 'Actualizar' : 'Crear')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateEditDecretoPage;

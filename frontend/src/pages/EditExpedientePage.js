import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';

import { expedienteService } from '../services/expedienteService';

const expedienteSchema = yup.object({
  numero_expediente: yup.string().required('El número de expediente es requerido'),
  nombre_solicitante: yup.string().required('El nombre del solicitante es requerido'),
  dni: yup.string().required('El DNI es requerido'),
  area: yup.string().required('El área es requerida'),
  descripcion: yup.string().required('La descripción es requerida'),
  tipo_expediente: yup.boolean().required('El tipo es requerido'),
});

const EditExpedientePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expediente, setExpediente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(expedienteSchema),
  });

  const fetchExpediente = async () => {
    try {
      setLoading(true);
      const response = await expedienteService.getExpedienteById(id);
      const expedienteData = response.data.expediente;
      setExpediente(expedienteData);
      
      console.log('Expediente cargado:', expedienteData); // Debug log
      
      // Set form values
      setValue('numero_expediente', expedienteData.numero_expediente);
      setValue('nombre_solicitante', expedienteData.nombre_solicitante);
      setValue('dni', expedienteData.dni);
      setValue('area', expedienteData.area);
      setValue('descripcion', expedienteData.descripcion);
      setValue('tipo_expediente', expedienteData.tipo_expediente);
      
      console.log('Valor tipo_expediente establecido:', expedienteData.tipo_expediente); // Debug log
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

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      // Convertir tipo_expediente a booleano si viene como string
      const processedData = {
        ...data,
        tipo_expediente: data.tipo_expediente === 'true' || data.tipo_expediente === true
      };
      console.log('Datos a enviar:', processedData); // Debug log
      await expedienteService.updateExpediente(id, processedData);
      toast.success('Expediente actualizado exitosamente');
      navigate(`/expedientes/${id}`);
    } catch (error) {
      toast.error('Error al actualizar el expediente');
    } finally {
      setSaving(false);
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
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/expedientes')}
          sx={{ mt: 2 }}
        >
          Volver a Expedientes
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/expedientes/${id}`)}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          Editar Expediente
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Información del Expediente
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número de Expediente"
                {...register('numero_expediente')}
                error={!!errors.numero_expediente}
                helperText={errors.numero_expediente?.message}
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Solicitante"
                {...register('nombre_solicitante')}
                error={!!errors.nombre_solicitante}
                helperText={errors.nombre_solicitante?.message}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="DNI"
                {...register('dni')}
                error={!!errors.dni}
                helperText={errors.dni?.message}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.area}>
                <InputLabel>Área</InputLabel>
                <Select
                  {...register('area')}
                  value={watch('area') || ''}
                >
                  <MenuItem value="civil">Civil</MenuItem>
                  <MenuItem value="penal">Penal</MenuItem>
                  <MenuItem value="laboral">Laboral</MenuItem>
                  <MenuItem value="comercial">Comercial</MenuItem>
                  <MenuItem value="administrativo">Administrativo</MenuItem>
                  <MenuItem value="familia">Familia</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </Select>
                {errors.area && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.area.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.tipo_expediente}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  {...register('tipo_expediente')}
                  label="Tipo"
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
              />
            </Grid>

          </Grid>

          <Box display="flex" justifyContent="flex-end" mt={4}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={saving}
              sx={{ minWidth: 150 }}
            >
              {saving ? <CircularProgress size={20} /> : 'Guardar Cambios'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditExpedientePage;

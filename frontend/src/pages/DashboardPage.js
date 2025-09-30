import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../contexts/AuthContext';
import { expedienteService } from '../services/expedienteService';
import { userService } from '../services/userService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentExpedientes, setRecentExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent expedientes
      const expedientesResponse = await expedienteService.getExpedientes({
        page: 1,
        limit: 5,
      });
      setRecentExpedientes(expedientesResponse.data.expedientes);

      // Fetch user stats if admin
      if (user?.rol === 'admin') {
        const statsResponse = await userService.getUserStats();
        setStats(statsResponse.data);
      }
    } catch (error) {
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido, {user?.nombre} {user?.apellido}
        </Typography>
      </Box>

      {/* Stats Cards - Solo para admin */}
      {user?.rol === 'admin' && stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {stats.expedientes?.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Expedientes
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="success.main">
                  {stats.expedientes?.active || 0} activos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="secondary">
                      {stats.users?.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Usuarios
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="success.main">
                  {stats.users?.active || 0} activos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="warning.main">
                      {stats.users?.admin || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Administradores
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stats.users?.administrative || 0} administrativos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <FolderIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="info.main">
                      {((stats.expedientes?.active / stats.expedientes?.total) * 100 || 0).toFixed(0)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expedientes Activos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones Rápidas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={() => navigate('/expedientes/nuevo')}
                >
                  Nuevo Expediente
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FolderIcon />}
                  fullWidth
                  onClick={() => navigate('/expedientes')}
                >
                  Ver Expedientes
                </Button>
                {user?.rol === 'admin' && (
                  <Button
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    fullWidth
                    onClick={() => navigate('/usuarios')}
                  >
                    Gestionar Usuarios
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Expedientes */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Expedientes Recientes
              </Typography>
              <IconButton onClick={fetchDashboardData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Box>
            
            {recentExpedientes.length > 0 ? (
              <List>
                {recentExpedientes.map((expediente) => (
                  <ListItem
                    key={expediente.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    onClick={() => navigate(`/expedientes/${expediente.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <AssignmentIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {expediente.numero_expediente}
                          </Typography>
            <Typography variant="caption" color={expediente.tipo_expediente === true || expediente.tipo_expediente === 1 ? 'primary' : 'secondary'}>
              ({expediente.tipo_expediente === true || expediente.tipo_expediente === 1 ? 'Expediente' : 'Actuación'})
            </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.primary">
                            {expediente.nombre_solicitante}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {expediente.area} • {formatDate(expediente.fecha_carga)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No hay expedientes recientes
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/expedientes/nuevo')}
                >
                  Crear Primer Expediente
                </Button>
              </Box>
            )}
            
            {recentExpedientes.length > 0 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="text"
                  onClick={() => navigate('/expedientes')}
                >
                  Ver todos los expedientes
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

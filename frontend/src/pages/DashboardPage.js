import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchDashboardData = useCallback(async () => {
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
  }, [user?.rol]);

  useEffect(() => {
    fetchDashboardData();
  }, [user, fetchDashboardData]);


  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Bienvenido, {user?.nombre} {user?.apellido}
        </Typography>
      </Box>

      {/* Stats Cards - Solo para admin */}
      {user?.rol === 'admin' && stats && (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
                    <AssignmentIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                      {stats.expedientes?.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Total Expedientes
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="success.main" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {stats.expedientes?.active || 0} activos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
                    <PeopleIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="secondary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                      {stats.users?.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Total Usuarios
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="success.main" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {stats.users?.active || 0} activos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
                    <TrendingUpIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="warning.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                      {stats.users?.admin || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Administradores
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Acciones Rápidas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={() => navigate('/expedientes')}
                  size="large"
                  sx={{ py: { xs: 1.5, sm: 2 } }}
                >
                  <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Nuevo Expediente
                  </Typography>
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FolderIcon />}
                  fullWidth
                  onClick={() => navigate('/expedientes')}
                  size="large"
                  sx={{ py: { xs: 1.5, sm: 2 } }}
                >
                  <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Ver Expedientes
                  </Typography>
                </Button>
                {user?.rol === 'admin' && (
                  <Button
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    fullWidth
                    onClick={() => navigate('/usuarios')}
                    size="large"
                    sx={{ py: { xs: 1.5, sm: 2 } }}
                  >
                    <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      Gestionar Usuarios
                    </Typography>
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Expedientes */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Expedientes Recientes
              </Typography>
              <IconButton onClick={fetchDashboardData} disabled={loading} size="small">
                <RefreshIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
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
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1, sm: 1.5 },
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    onClick={() => navigate(`/expedientes/${expediente.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
                        <AssignmentIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {expediente.numero_expediente}
                          </Typography>
                          <Typography variant="caption" color={expediente.tipo_expediente === true || expediente.tipo_expediente === 1 ? 'primary' : 'secondary'} sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            ({expediente.tipo_expediente === true || expediente.tipo_expediente === 1 ? 'Expediente' : 'Actuación'})
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.primary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {expediente.nombre_solicitante}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
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

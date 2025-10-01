const { Decreto, ExpedienteSimple, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;

// Get all decretos with pagination and filters
const getDecretos = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      tipo_documento, 
      estado, 
      search,
      expediente_vinculado 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (tipo_documento) {
      whereClause.tipo_documento = tipo_documento;
    }

    if (estado) {
      whereClause.estado = estado;
    }

    if (expediente_vinculado) {
      whereClause.numero_expediente_vinculado = expediente_vinculado;
    }

    if (search) {
      whereClause[Op.or] = [
        { numero_decreto: { [Op.like]: `%${search}%` } },
        { titulo: { [Op.like]: `%${search}%` } },
        { autoridad_emisora: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: decretos } = await Decreto.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'usuario_creador',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: ExpedienteSimple,
          as: 'expediente_vinculado',
          attributes: ['id', 'numero_expediente', 'nombre_solicitante', 'area', 'tipo_expediente']
        }
      ],
      attributes: ['id', 'numero_decreto', 'tipo_documento', 'titulo', 'descripcion', 'fecha_emision', 'fecha_vigencia', 'estado', 'autoridad_emisora', 'secretaria', 'numero_expediente_vinculado', 'tipo_expediente_vinculado', 'nombre_archivo', 'ruta_archivo', 'notas', 'createdAt', 'updatedAt'],
      order: [['fecha_emision', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        decretos,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting decretos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get decreto by ID
const getDecretoById = async (req, res) => {
  try {
    const { id } = req.params;

    const decreto = await Decreto.findByPk(id, {
      include: [
        {
          model: User,
          as: 'usuario_creador',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: ExpedienteSimple,
          as: 'expediente_vinculado',
          attributes: ['id', 'numero_expediente', 'nombre_solicitante', 'area', 'tipo_expediente', 'ruta_archivo_escaneado']
        }
      ],
      attributes: ['id', 'numero_decreto', 'tipo_documento', 'titulo', 'descripcion', 'fecha_emision', 'fecha_vigencia', 'estado', 'autoridad_emisora', 'secretaria', 'numero_expediente_vinculado', 'tipo_expediente_vinculado', 'nombre_archivo', 'ruta_archivo', 'notas', 'createdAt', 'updatedAt']
    });

    if (!decreto) {
      return res.status(404).json({
        success: false,
        message: 'Decreto no encontrado'
      });
    }

    res.json({
      success: true,
      data: decreto
    });

  } catch (error) {
    console.error('Error getting decreto by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new decreto
const createDecreto = async (req, res) => {
  try {
    const {
      numero_decreto,
      tipo_documento,
      titulo,
      descripcion,
      fecha_emision,
      fecha_vigencia,
      estado,
      autoridad_emisora,
      secretaria,
      numero_expediente_vinculado,
      tipo_expediente_vinculado,
      expediente_simple_id,
      notas
    } = req.body;

    // Check if numero_decreto already exists
    const existingDecreto = await Decreto.findOne({
      where: { numero_decreto }
    });

    if (existingDecreto) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un decreto con este número'
      });
    }

    // If expediente_simple_id is provided, verify it exists
    if (expediente_simple_id) {
      const expediente = await ExpedienteSimple.findByPk(expediente_simple_id);
      if (!expediente) {
        return res.status(400).json({
          success: false,
          message: 'El expediente vinculado no existe'
        });
      }
    }

    const decretoData = {
      numero_decreto,
      tipo_documento,
      titulo,
      descripcion,
      fecha_emision,
      fecha_vigencia,
      estado: estado || 'vigente',
      autoridad_emisora,
      numero_expediente_vinculado,
      tipo_expediente_vinculado,
      expediente_simple_id,
      notas,
      usuario_creador_id: req.user.id
    };

    // Handle file upload if present
    if (req.file) {
      decretoData.nombre_archivo = req.file.originalname;
      decretoData.ruta_archivo = req.file.path;
    }

    const decreto = await Decreto.create(decretoData);

    // Fetch the created decreto with associations
    const createdDecreto = await Decreto.findByPk(decreto.id, {
      include: [
        {
          model: User,
          as: 'usuario_creador',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: ExpedienteSimple,
          as: 'expediente_vinculado',
          attributes: ['id', 'numero_expediente', 'nombre_solicitante', 'area', 'tipo_expediente']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Decreto creado exitosamente',
      data: createdDecreto
    });

  } catch (error) {
    console.error('Error creating decreto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update decreto
const updateDecreto = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const decreto = await Decreto.findByPk(id);

    if (!decreto) {
      return res.status(404).json({
        success: false,
        message: 'Decreto no encontrado'
      });
    }

    // Check if numero_decreto is being changed and if it already exists
    if (updateData.numero_decreto && updateData.numero_decreto !== decreto.numero_decreto) {
      const existingDecreto = await Decreto.findOne({
        where: { 
          numero_decreto: updateData.numero_decreto,
          id: { [Op.ne]: id }
        }
      });

      if (existingDecreto) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro decreto con este número'
        });
      }
    }

    // If expediente_simple_id is being changed, verify it exists
    if (updateData.expediente_simple_id) {
      const expediente = await ExpedienteSimple.findByPk(updateData.expediente_simple_id);
      if (!expediente) {
        return res.status(400).json({
          success: false,
          message: 'El expediente vinculado no existe'
        });
      }
    }

    // Handle file upload if present
    if (req.file) {
      // Delete old file if exists
      if (decreto.ruta_archivo) {
        try {
          await fs.unlink(decreto.ruta_archivo);
        } catch (error) {
          console.warn('Could not delete old file:', error.message);
        }
      }
      
      updateData.nombre_archivo = req.file.originalname;
      updateData.ruta_archivo = req.file.path;
    }

    await decreto.update(updateData);

    // Fetch updated decreto with associations
    const updatedDecreto = await Decreto.findByPk(id, {
      include: [
        {
          model: User,
          as: 'usuario_creador',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: ExpedienteSimple,
          as: 'expediente_vinculado',
          attributes: ['id', 'numero_expediente', 'nombre_solicitante', 'area', 'tipo_expediente']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Decreto actualizado exitosamente',
      data: updatedDecreto
    });

  } catch (error) {
    console.error('Error updating decreto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete decreto
const deleteDecreto = async (req, res) => {
  try {
    const { id } = req.params;

    const decreto = await Decreto.findByPk(id);

    if (!decreto) {
      return res.status(404).json({
        success: false,
        message: 'Decreto no encontrado'
      });
    }

    // Delete associated file if exists
    if (decreto.ruta_archivo) {
      try {
        await fs.unlink(decreto.ruta_archivo);
      } catch (error) {
        console.warn('Could not delete file:', error.message);
      }
    }

    await decreto.destroy();

    res.json({
      success: true,
      message: 'Decreto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting decreto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Download decreto file
const downloadDecretoFile = async (req, res) => {
  try {
    const { id } = req.params;

    const decreto = await Decreto.findByPk(id);

    if (!decreto) {
      return res.status(404).json({
        success: false,
        message: 'Decreto no encontrado'
      });
    }

    if (!decreto.ruta_archivo) {
      return res.status(404).json({
        success: false,
        message: 'No hay archivo asociado a este decreto'
      });
    }

    const filePath = path.resolve(decreto.ruta_archivo);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'El archivo no existe en el servidor'
      });
    }

    res.download(filePath, decreto.nombre_archivo || 'decreto.pdf');

  } catch (error) {
    console.error('Error downloading decreto file:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get expedientes that can be linked to decretos
const getExpedientesForLink = async (req, res) => {
  try {
    const expedientes = await ExpedienteSimple.findAll({
      attributes: ['id', 'numero_expediente', 'nombre_solicitante', 'area', 'tipo_expediente', 'fecha_carga'],
      order: [['fecha_carga', 'DESC']]
    });

    res.json({
      success: true,
      data: expedientes
    });

  } catch (error) {
    console.error('Error getting expedientes for link:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get expedientes vinculados to a decreto
const getExpedientesVinculados = async (req, res) => {
  try {
    const { id } = req.params;

    const decreto = await Decreto.findByPk(id, {
      include: [
        {
          model: ExpedienteSimple,
          as: 'expediente_vinculado',
          attributes: ['id', 'numero_expediente', 'nombre_solicitante', 'dni', 'area', 'descripcion', 'tipo_expediente', 'fecha_carga', 'ruta_archivo_escaneado', 'nombre_archivo_escaneado'],
          include: [
            {
              model: User,
              as: 'usuario_creador',
              attributes: ['id', 'nombre', 'apellido', 'email']
            }
          ]
        }
      ]
    });

    if (!decreto) {
      return res.status(404).json({
        success: false,
        message: 'Decreto no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        decreto: {
          id: decreto.id,
          numero_decreto: decreto.numero_decreto,
          tipo_documento: decreto.tipo_documento,
          titulo: decreto.titulo,
          estado: decreto.estado
        },
        expediente: decreto.expediente_vinculado
      }
    });
  } catch (error) {
    console.error('Error getting expedientes vinculados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Download expediente file from vinculated expediente
const downloadExpedienteFileFromDecreto = async (req, res) => {
  try {
    const { id } = req.params;

    const decreto = await Decreto.findByPk(id, {
      include: [
        {
          model: ExpedienteSimple,
          as: 'expediente_vinculado',
          attributes: ['id', 'numero_expediente', 'ruta_archivo_escaneado', 'nombre_archivo_escaneado']
        }
      ]
    });

    if (!decreto) {
      return res.status(404).json({
        success: false,
        message: 'Decreto no encontrado'
      });
    }

    if (!decreto.expediente_vinculado) {
      return res.status(404).json({
        success: false,
        message: 'No hay expediente vinculado a este decreto'
      });
    }

    const expediente = decreto.expediente_vinculado;

    if (!expediente.ruta_archivo_escaneado) {
      return res.status(404).json({
        success: false,
        message: 'No hay archivo asociado al expediente vinculado'
      });
    }

    const filePath = path.resolve(expediente.ruta_archivo_escaneado);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'El archivo del expediente no existe en el servidor'
      });
    }

    res.download(filePath, expediente.nombre_archivo_escaneado || 'expediente.pdf');

  } catch (error) {
    console.error('Error downloading expediente file from decreto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDecretos,
  getDecretoById,
  createDecreto,
  updateDecreto,
  deleteDecreto,
  downloadDecretoFile,
  getExpedientesForLink,
  getExpedientesVinculados,
  downloadExpedienteFileFromDecreto
};

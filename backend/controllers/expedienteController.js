const { Expediente, Cliente, User, Documento, Pago } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Generate unique expediente number
 */
const generateExpedienteNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Expediente.count({
    where: {
      numero_expediente: {
        [Op.like]: `${year}-%`
      }
    }
  });
  
  const number = String(count + 1).padStart(4, '0');
  return `${year}-${number}`;
};

/**
 * Get all expedientes with pagination and filters
 */
const getExpedientes = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      estado = '', 
      tipo_caso = '',
      abogado_id = '',
      cliente_id = ''
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { numero_expediente: { [Op.like]: `%${search}%` } },
        { titulo: { [Op.like]: `%${search}%` } },
        { descripcion: { [Op.like]: `%${search}%` } }
      ];
    }

    if (estado) {
      whereClause.estado = estado;
    }

    if (tipo_caso) {
      whereClause.tipo_caso = tipo_caso;
    }

    if (abogado_id) {
      whereClause.abogado_responsable_id = abogado_id;
    }

    if (cliente_id) {
      whereClause.cliente_id = cliente_id;
    }

    // If user is not admin, only show their expedientes
    if (req.user.rol !== 'admin') {
      whereClause.abogado_responsable_id = req.user.id;
    }

    const { count, rows: expedientes } = await Expediente.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        },
        {
          model: User,
          as: 'abogado_responsable',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        expedientes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get expedientes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get expediente by ID
 */
const getExpedienteById = async (req, res) => {
  try {
    const { id } = req.params;

    const whereClause = { id };
    
    // If user is not admin, only show their expedientes
    if (req.user.rol !== 'admin') {
      whereClause.abogado_responsable_id = req.user.id;
    }

    const expediente = await Expediente.findOne({
      where: whereClause,
      include: [
        {
          model: Cliente,
          as: 'cliente'
        },
        {
          model: User,
          as: 'abogado_responsable',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Documento,
          as: 'documentos',
          include: [
            {
              model: User,
              as: 'usuario_subio',
              attributes: ['id', 'nombre', 'apellido']
            }
          ]
        },
        {
          model: Pago,
          as: 'pagos',
          include: [
            {
              model: User,
              as: 'usuario_recibio',
              attributes: ['id', 'nombre', 'apellido']
            }
          ]
        }
      ]
    });

    if (!expediente) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado'
      });
    }

    res.json({
      success: true,
      data: { expediente }
    });
  } catch (error) {
    console.error('Get expediente by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new expediente
 */
const createExpediente = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    // Generate unique expediente number
    const numero_expediente = await generateExpedienteNumber();
    
    const expedienteData = {
      ...req.body,
      numero_expediente
    };

    const expediente = await Expediente.create(expedienteData);

    // Fetch created expediente with associations
    const createdExpediente = await Expediente.findByPk(expediente.id, {
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: User,
          as: 'abogado_responsable',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Expediente creado exitosamente',
      data: { expediente: createdExpediente }
    });
  } catch (error) {
    console.error('Create expediente error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update expediente
 */
const updateExpediente = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const whereClause = { id };
    
    // If user is not admin, only allow updating their expedientes
    if (req.user.rol !== 'admin') {
      whereClause.abogado_responsable_id = req.user.id;
    }

    const expediente = await Expediente.findOne({ where: whereClause });
    if (!expediente) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado o no tienes permisos para editarlo'
      });
    }

    await expediente.update(updateData);

    // Fetch updated expediente with associations
    const updatedExpediente = await Expediente.findByPk(id, {
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: User,
          as: 'abogado_responsable',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Expediente actualizado exitosamente',
      data: { expediente: updatedExpediente }
    });
  } catch (error) {
    console.error('Update expediente error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete expediente (soft delete by changing status)
 */
const deleteExpediente = async (req, res) => {
  try {
    const { id } = req.params;

    const whereClause = { id };
    
    // If user is not admin, only allow deleting their expedientes
    if (req.user.rol !== 'admin') {
      whereClause.abogado_responsable_id = req.user.id;
    }

    const expediente = await Expediente.findOne({ where: whereClause });
    if (!expediente) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado o no tienes permisos para eliminarlo'
      });
    }

    await expediente.update({ estado: 'archivado' });

    res.json({
      success: true,
      message: 'Expediente archivado exitosamente'
    });
  } catch (error) {
    console.error('Delete expediente error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getExpedientes,
  getExpedienteById,
  createExpediente,
  updateExpediente,
  deleteExpediente
};

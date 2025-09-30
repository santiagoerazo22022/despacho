const { Cliente, Expediente, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Get all clients with pagination and search
 */
const getClientes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tipo_cliente = '' } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {
      activo: true
    };

    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { apellido: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { dni: { [Op.like]: `%${search}%` } },
        { rfc: { [Op.like]: `%${search}%` } }
      ];
    }

    if (tipo_cliente) {
      whereClause.tipo_cliente = tipo_cliente;
    }

    const { count, rows: clientes } = await Cliente.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Expediente,
          as: 'expedientes',
          attributes: ['id', 'numero_expediente', 'titulo', 'estado'],
          limit: 5,
          separate: true,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    res.json({
      success: true,
      data: {
        clientes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get clientes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get client by ID
 */
const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id, {
      include: [
        {
          model: Expediente,
          as: 'expedientes',
          include: [
            {
              model: User,
              as: 'abogado_responsable',
              attributes: ['id', 'nombre', 'apellido', 'email']
            }
          ]
        }
      ]
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: { cliente }
    });
  } catch (error) {
    console.error('Get cliente by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new client
 */
const createCliente = async (req, res) => {
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

    const clienteData = req.body;
    const cliente = await Cliente.create(clienteData);

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: { cliente }
    });
  } catch (error) {
    console.error('Create cliente error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update client
 */
const updateCliente = async (req, res) => {
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

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    await cliente.update(updateData);

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: { cliente }
    });
  } catch (error) {
    console.error('Update cliente error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete client (soft delete)
 */
const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Check if client has active expedientes
    const activeExpedientes = await Expediente.count({
      where: {
        cliente_id: id,
        estado: { [Op.not]: 'archivado' }
      }
    });

    if (activeExpedientes > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el cliente porque tiene expedientes activos'
      });
    }

    await cliente.update({ activo: false });

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Delete cliente error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
};

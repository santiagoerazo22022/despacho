const ExpedienteSimple = require('../models/ExpedienteSimple');
const { User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { generatePaymentReceipt, generateUniqueFilename, ensureComprobantesDir } = require('../utils/pdfGenerator');
const path = require('path');

/**
 * Generate unique expediente number
 */
const generateExpedienteNumber = async () => {
  const year = new Date().getFullYear();
  const count = await ExpedienteSimple.count({
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
 * Generate expediente receipt PDF using improved generator
 */
const generateExpedienteComprobante = async (expedienteData, usuario) => {
  try {
    const { generateExpedienteSimpleReceipt, ensureComprobantesDir, generateUniqueFilename } = require('../utils/pdfGenerator');
    
    const comprobantesDir = ensureComprobantesDir();
    const filename = generateUniqueFilename(`comprobante-exp-${expedienteData.numero_expediente}`, 'pdf');
    const outputPath = path.join(comprobantesDir, filename);

    // Use the improved PDF generator
    await generateExpedienteSimpleReceipt(expedienteData, usuario, outputPath);
    
    return outputPath;
  } catch (error) {
    throw error;
  }
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
      area = '',
      tipo = '',
      usuario_id = ''
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { numero_expediente: { [Op.like]: `%${search}%` } },
        { nombre_solicitante: { [Op.like]: `%${search}%` } },
        { dni: { [Op.like]: `%${search}%` } },
        { descripcion: { [Op.like]: `%${search}%` } }
      ];
    }

    if (area) {
      whereClause.area = area;
    }

    if (tipo !== '') {
      whereClause.tipo_expediente = tipo === 'true';
    }

    if (usuario_id) {
      whereClause.usuario_creador_id = usuario_id;
    }

    // If user is not admin, only show their expedientes
    if (req.user.rol !== 'admin') {
      whereClause.usuario_creador_id = req.user.id;
    }

    const { count, rows: expedientes } = await ExpedienteSimple.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_carga', 'DESC']],
      include: [
        {
          model: User,
          as: 'usuario_creador',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    console.log('Expedientes devueltos:', expedientes.map(e => ({ 
      id: e.id, 
      numero_expediente: e.numero_expediente, 
      tipo_expediente: e.tipo_expediente 
    }))); // Debug log

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
      whereClause.usuario_creador_id = req.user.id;
    }

    const expediente = await ExpedienteSimple.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'usuario_creador',
          attributes: ['id', 'nombre', 'apellido', 'email']
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
 * Create new expediente with file upload and PDF generation
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

    const { 
      numero_expediente,
      nombre_solicitante, 
      dni, 
      area, 
      descripcion 
    } = req.body;

    // Generate expediente number if not provided
    const numeroExpediente = numero_expediente || await generateExpedienteNumber();

    // Handle file upload if present
    let nombreArchivoEscaneado = null;
    let rutaArchivoEscaneado = null;

    if (req.file) {
      nombreArchivoEscaneado = req.file.originalname;
      rutaArchivoEscaneado = req.file.path;
    }

    // Create expediente
    const expedienteData = {
      numero_expediente: numeroExpediente,
      nombre_solicitante,
      dni,
      area,
      descripcion,
      nombre_archivo_escaneado: nombreArchivoEscaneado,
      ruta_archivo_escaneado: rutaArchivoEscaneado,
      usuario_creador_id: req.user.id
    };

    const expediente = await ExpedienteSimple.create(expedienteData);

    // Generate PDF receipt automatically
    try {
      const pdfPath = await generateExpedienteComprobante(expediente, req.user);
      await expediente.update({ ruta_comprobante_pdf: pdfPath });
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      // Continue without PDF - don't fail the whole operation
    }

    // Fetch created expediente with user info
    const createdExpediente = await ExpedienteSimple.findByPk(expediente.id, {
      include: [
        {
          model: User,
          as: 'usuario_creador',
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
    // Delete uploaded file on error
    if (req.file) {
      const fs = require('fs');
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    
    console.error('Create expediente error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update expediente (admin can edit all, administrativo can edit their own)
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
    
    console.log('Datos recibidos para actualizar:', updateData); // Debug log

    const whereClause = { id };
    
    // If user is not admin, only allow updating their own expedientes
    if (req.user.rol !== 'admin') {
      whereClause.usuario_creador_id = req.user.id;
    }

    const expediente = await ExpedienteSimple.findOne({ where: whereClause });
    if (!expediente) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado o no tienes permisos para editarlo'
      });
    }

    await expediente.update(updateData);

    // Fetch updated expediente with user info
    const updatedExpediente = await ExpedienteSimple.findByPk(id, {
      include: [
        {
          model: User,
          as: 'usuario_creador',
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
 * Delete expediente (admin can delete all, administrativo can delete their own)
 */
const deleteExpediente = async (req, res) => {
  try {
    const { id } = req.params;

    const whereClause = { id };
    
    // If user is not admin, only allow deleting their own expedientes
    if (req.user.rol !== 'admin') {
      whereClause.usuario_creador_id = req.user.id;
    }

    const expediente = await ExpedienteSimple.findOne({ where: whereClause });
    if (!expediente) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado o no tienes permisos para eliminarlo'
      });
    }

    // Physical delete - remove from database completely
    await expediente.destroy();

    res.json({
      success: true,
      message: 'Expediente eliminado exitosamente'
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

/**
 * Download expediente file
 */
const downloadExpedienteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const whereClause = { id };
    
    // If user is not admin, only allow downloading their expedientes
    if (req.user.rol !== 'admin') {
      whereClause.usuario_creador_id = req.user.id;
    }

    const expediente = await ExpedienteSimple.findOne({ where: whereClause });

    if (!expediente) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado'
      });
    }

    if (!expediente.ruta_archivo_escaneado) {
      return res.status(404).json({
        success: false,
        message: 'No hay archivo escaneado para este expediente'
      });
    }

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(expediente.ruta_archivo_escaneado)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el servidor'
      });
    }

    // Send file
    res.download(expediente.ruta_archivo_escaneado, expediente.nombre_archivo_escaneado);
  } catch (error) {
    console.error('Download expediente file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Download expediente PDF receipt
 */
const downloadComprobantePDF = async (req, res) => {
  try {
    const { id } = req.params;

    const whereClause = { id };
    
    // If user is not admin, only allow downloading their expedientes
    if (req.user.rol !== 'admin') {
      whereClause.usuario_creador_id = req.user.id;
    }

    const expediente = await ExpedienteSimple.findOne({ where: whereClause });

    if (!expediente) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado'
      });
    }

    if (!expediente.ruta_comprobante_pdf) {
      return res.status(404).json({
        success: false,
        message: 'No hay comprobante PDF para este expediente'
      });
    }

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(expediente.ruta_comprobante_pdf)) {
      return res.status(404).json({
        success: false,
        message: 'Comprobante PDF no encontrado en el servidor'
      });
    }

    // Send file
    const filename = `comprobante-${expediente.numero_expediente}.pdf`;
    res.download(expediente.ruta_comprobante_pdf, filename);
  } catch (error) {
    console.error('Download comprobante PDF error:', error);
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
  deleteExpediente,
  downloadExpedienteFile,
  downloadComprobantePDF
};


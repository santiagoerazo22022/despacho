const Actuacion = require('../models/Actuacion');
const { User, Decreto, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { generateExpedienteSimpleReceipt, generateUniqueFilename, ensureComprobantesDir } = require('../utils/pdfGenerator');
const path = require('path');

/**
 * Generate unique actuacion number
 */
const generateActuacionNumber = async () => {
  const year = new Date().getFullYear().toString().slice(-2); // Obtener últimos 2 dígitos del año
  
  // Buscar el número más alto existente para este año usando ordenamiento numérico
  const lastActuacion = await Actuacion.findOne({
    where: {
      numero_actuacion: {
        [Op.like]: `%/${year}`
      }
    },
    order: [
      [sequelize.literal('CAST(SUBSTRING_INDEX(numero_actuacion, "/", 1) AS UNSIGNED)'), 'DESC']
    ]
  });
  
  let nextNumber = 1;
  if (lastActuacion) {
    // Extraer el número del formato "número/año"
    const match = lastActuacion.numero_actuacion.match(/^(\d+)\/\d+$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  const generatedNumber = `${nextNumber}/${year}`;
  console.log(`Generated actuacion number: ${generatedNumber}`);
  return generatedNumber;
};

/**
 * Generate actuacion receipt PDF using improved generator
 */
const generateActuacionComprobante = async (actuacionData, usuario) => {
  try {
    console.log('Starting PDF generation for actuacion...');
    console.log('Actuacion data:', {
      id: actuacionData.id,
      numero_actuacion: actuacionData.numero_actuacion,
      nombre_solicitante: actuacionData.nombre_solicitante
    });
    console.log('Usuario data:', {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido
    });
    
    const comprobantesDir = ensureComprobantesDir();
    console.log('Comprobantes directory:', comprobantesDir);
    
    const safeNumeroActuacion = actuacionData.numero_actuacion.replace(/\//g, '-');
    const filename = generateUniqueFilename(`comprobante-act-${safeNumeroActuacion}`, 'pdf');
    const outputPath = path.join(comprobantesDir, filename);
    
    console.log('Output path:', outputPath);

    // Use the improved PDF generator
    await generateExpedienteSimpleReceipt(actuacionData, usuario, outputPath);
    console.log('PDF generation completed successfully');
    
    return outputPath;
  } catch (error) {
    console.error('Error in generateActuacionComprobante:', error);
    throw error;
  }
};

/**
 * Get all actuaciones with pagination and filters
 */
const getActuaciones = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, area } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    // If user is not admin, only show their actuaciones
    if (req.user.rol !== 'admin') {
      whereClause.usuario_creador_id = req.user.id;
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { numero_actuacion: { [Op.like]: `%${search}%` } },
        { nombre_solicitante: { [Op.like]: `%${search}%` } },
        { descripcion: { [Op.like]: `%${search}%` } }
      ];
    }

    // Area filter
    if (area) {
      whereClause.area = { [Op.like]: `%${area}%` };
    }

    const { count, rows: actuaciones } = await Actuacion.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'usuario_creador',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        actuaciones,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get actuaciones error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get actuacion by ID
 */
const getActuacionById = async (req, res) => {
  try {
    const { id } = req.params;

    const whereClause = { id };
    
    // If user is not admin, only show their actuaciones
    if (req.user.rol !== 'admin') {
      whereClause.usuario_creador_id = req.user.id;
    }

    const actuacion = await Actuacion.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'usuario_creador',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });
    
    console.log('Actuacion found:', {
      id: actuacion?.id,
      numero_actuacion: actuacion?.numero_actuacion,
      nombre_solicitante: actuacion?.nombre_solicitante,
      ruta_comprobante_pdf: actuacion?.ruta_comprobante_pdf,
      usuario_creador: actuacion?.usuario_creador?.nombre
    });

    if (!actuacion) {
      return res.status(404).json({
        success: false,
        message: 'Actuación no encontrada'
      });
    }

    res.json({
      success: true,
      data: { actuacion }
    });
  } catch (error) {
    console.error('Get actuacion by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new actuacion with file upload and PDF generation
 */
const createActuacion = async (req, res) => {
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
      nombre_solicitante, 
      area, 
      descripcion
    } = req.body;

    // Generate actuacion number automatically
    const numeroActuacion = await generateActuacionNumber();
    console.log('Generated actuacion number:', numeroActuacion);

    // Handle file upload if present
    let nombreArchivoEscaneado = null;
    let rutaArchivoEscaneado = null;

    if (req.file) {
      nombreArchivoEscaneado = req.file.originalname;
      rutaArchivoEscaneado = req.file.path;
    }

    // Create actuacion
    const actuacionData = {
      numero_actuacion: numeroActuacion,
      nombre_solicitante,
      area,
      descripcion,
      nombre_archivo_escaneado: nombreArchivoEscaneado,
      ruta_archivo_escaneado: rutaArchivoEscaneado,
      usuario_creador_id: req.user.id
    };

    console.log('Creating actuacion with data:', actuacionData);
    const actuacion = await Actuacion.create(actuacionData);
    console.log('Actuacion created successfully:', actuacion.id);

    // Generate PDF receipt automatically
    try {
      console.log('Generating PDF for actuacion:', actuacion.numero_actuacion);
      const pdfPath = await generateActuacionComprobante(actuacion, req.user);
      console.log('PDF generated successfully at:', pdfPath);
      await actuacion.update({ ruta_comprobante_pdf: pdfPath });
      console.log('PDF path saved to database');
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      console.error('PDF Error details:', pdfError.message);
      // Continue without PDF - don't fail the whole operation
    }

    // Fetch created actuacion with user info
    const createdActuacion = await Actuacion.findByPk(actuacion.id, {
      include: [
        {
          model: User,
          as: 'usuario_creador',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ],
      attributes: {
        include: ['ruta_comprobante_pdf', 'nombre_archivo_escaneado', 'ruta_archivo_escaneado']
      }
    });

    console.log('Created actuacion data:', {
      id: createdActuacion.id,
      numero_actuacion: createdActuacion.numero_actuacion,
      ruta_comprobante_pdf: createdActuacion.ruta_comprobante_pdf,
      usuario_creador: createdActuacion.usuario_creador?.nombre
    });

    res.status(201).json({
      success: true,
      message: 'Actuación creada exitosamente',
      data: { actuacion: createdActuacion }
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file) {
      const fs = require('fs');
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    console.error('Create actuacion error:', error);
    
    // Handle specific error cases
    if (error.name === 'SequelizeUniqueConstraintError' && error.errors[0].path === 'numero_actuacion') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una actuación con este número. Por favor, intente nuevamente.',
        error: 'DUPLICATE_NUMBER'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Download actuacion PDF receipt
 */
const downloadComprobantePDF = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Downloading comprobante PDF for actuacion:', id);

    const whereClause = { id };
    
    // If user is not admin, only allow downloading their actuaciones
    if (req.user.rol !== 'admin') {
      whereClause.usuario_creador_id = req.user.id;
    }

    const actuacion = await Actuacion.findOne({ where: whereClause });
    console.log('Actuacion found:', {
      id: actuacion?.id,
      numero_actuacion: actuacion?.numero_actuacion,
      ruta_comprobante_pdf: actuacion?.ruta_comprobante_pdf
    });

    if (!actuacion) {
      console.log('Actuacion not found');
      return res.status(404).json({
        success: false,
        message: 'Actuación no encontrada'
      });
    }

    if (!actuacion.ruta_comprobante_pdf) {
      console.log('No PDF path found for actuacion');
      return res.status(404).json({
        success: false,
        message: 'No hay comprobante PDF para esta actuación'
      });
    }

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(actuacion.ruta_comprobante_pdf)) {
      return res.status(404).json({
        success: false,
        message: 'Comprobante PDF no encontrado en el servidor'
      });
    }

    // Send file
    const safeNumeroActuacion = actuacion.numero_actuacion.replace(/\//g, '-');
    const filename = `comprobante-${safeNumeroActuacion}.pdf`;
    res.download(actuacion.ruta_comprobante_pdf, filename);
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
  getActuaciones,
  getActuacionById,
  createActuacion,
  downloadComprobantePDF
};

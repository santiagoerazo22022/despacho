const ExpedienteSimple = require('../models/ExpedienteSimple');
const { User, Decreto } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { generateExpedienteSimpleReceipt, generateUniqueFilename, ensureComprobantesDir } = require('../utils/pdfGenerator');
const path = require('path');

/**
 * Generate unique expediente number based on type
 */
const generateExpedienteNumber = async (tipoExpediente = true) => {
  const year = new Date().getFullYear().toString().slice(-2); // Obtener últimos 2 dígitos del año
  
  // Buscar el número más alto existente para este año y tipo
  const lastExpediente = await ExpedienteSimple.findOne({
    where: {
      numero_expediente: {
        [Op.like]: `%/${year}`
      },
      tipo_expediente: tipoExpediente
    },
    order: [['numero_expediente', 'DESC']]
  });
  
  let nextNumber = 1;
  if (lastExpediente) {
    // Extraer el número del formato "número/año"
    const match = lastExpediente.numero_expediente.match(/^(\d+)\/\d+$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  const generatedNumber = `${nextNumber}/${year}`;
  console.log(`Generated expediente number: ${generatedNumber} for tipo: ${tipoExpediente}`);
  return generatedNumber;
};

/**
 * Generate expediente receipt PDF using improved generator
 */
const generateExpedienteComprobante = async (expedienteData, usuario) => {
  try {
    console.log('Starting PDF generation...');
    console.log('Expediente data:', {
      id: expedienteData.id,
      numero_expediente: expedienteData.numero_expediente,
      nombre_solicitante: expedienteData.nombre_solicitante
    });
    console.log('Usuario data:', {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido
    });
    
    const comprobantesDir = ensureComprobantesDir();
    console.log('Comprobantes directory:', comprobantesDir);
    
    const safeNumeroExpediente = expedienteData.numero_expediente.replace(/\//g, '-');
    const filename = generateUniqueFilename(`comprobante-exp-${safeNumeroExpediente}`, 'pdf');
    const outputPath = path.join(comprobantesDir, filename);
    
    console.log('Output path:', outputPath);

    // Use the improved PDF generator
    await generateExpedienteSimpleReceipt(expedienteData, usuario, outputPath);
    console.log('PDF generation completed successfully');
    
    return outputPath;
  } catch (error) {
    console.error('Error in generateExpedienteComprobante:', error);
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
    
    console.log('Expediente found:', {
      id: expediente?.id,
      numero_expediente: expediente?.numero_expediente,
      nombre_solicitante: expediente?.nombre_solicitante,
      ruta_comprobante_pdf: expediente?.ruta_comprobante_pdf,
      usuario_creador: expediente?.usuario_creador?.nombre
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
      nombre_solicitante, 
      area, 
      descripcion,
      tipo_expediente = true
    } = req.body;

    // Generate expediente number automatically
    const numeroExpediente = await generateExpedienteNumber(tipo_expediente);
    console.log('Generated expediente number:', numeroExpediente);

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
      area,
      descripcion,
      tipo_expediente,
      nombre_archivo_escaneado: nombreArchivoEscaneado,
      ruta_archivo_escaneado: rutaArchivoEscaneado,
      usuario_creador_id: req.user.id
    };

    console.log('Creating expediente with data:', expedienteData);
    const expediente = await ExpedienteSimple.create(expedienteData);
    console.log('Expediente created successfully:', expediente.id);

    // Generate PDF receipt automatically
    try {
      console.log('Generating PDF for expediente:', expediente.numero_expediente);
      const pdfPath = await generateExpedienteComprobante(expediente, req.user);
      console.log('PDF generated successfully at:', pdfPath);
      await expediente.update({ ruta_comprobante_pdf: pdfPath });
      console.log('PDF path saved to database');
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      console.error('PDF Error details:', pdfError.message);
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
      ],
      attributes: {
        include: ['ruta_comprobante_pdf', 'nombre_archivo_escaneado', 'ruta_archivo_escaneado']
      }
    });

    console.log('Created expediente data:', {
      id: createdExpediente.id,
      numero_expediente: createdExpediente.numero_expediente,
      ruta_comprobante_pdf: createdExpediente.ruta_comprobante_pdf,
      usuario_creador: createdExpediente.usuario_creador?.nombre
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
    
    // Handle specific error cases
    if (error.message === 'No se pudo generar un número de expediente único después de varios intentos') {
      return res.status(409).json({
        success: false,
        message: 'Error al generar número de expediente único. Por favor, intente nuevamente.',
        error: 'CONFLICT_NUMBER_GENERATION'
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError' && error.errors[0].path === 'numero_expediente') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un expediente con este número. Por favor, intente nuevamente.',
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
    console.log('Downloading comprobante PDF for expediente:', id);

    const whereClause = { id };
    
    // If user is not admin, only allow downloading their expedientes
    if (req.user.rol !== 'admin') {
      whereClause.usuario_creador_id = req.user.id;
    }

    const expediente = await ExpedienteSimple.findOne({ where: whereClause });
    console.log('Expediente found:', {
      id: expediente?.id,
      numero_expediente: expediente?.numero_expediente,
      ruta_comprobante_pdf: expediente?.ruta_comprobante_pdf
    });

    if (!expediente) {
      console.log('Expediente not found');
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado'
      });
    }

    if (!expediente.ruta_comprobante_pdf) {
      console.log('No PDF path found for expediente');
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
    const safeNumeroExpediente = expediente.numero_expediente.replace(/\//g, '-');
    const filename = `comprobante-${safeNumeroExpediente}.pdf`;
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

/**
 * Get decretos vinculados to an expediente
 */
const getDecretosVinculados = async (req, res) => {
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
          model: Decreto,
          as: 'decretos_vinculados',
          attributes: ['id', 'numero_decreto', 'tipo_documento', 'titulo', 'estado', 'fecha_emision', 'fecha_vigencia', 'autoridad_emisora', 'ruta_archivo', 'nombre_archivo', 'createdAt'],
          include: [
            {
              model: User,
              as: 'usuario_creador',
              attributes: ['id', 'nombre', 'apellido', 'email']
            }
          ],
          order: [['fecha_emision', 'DESC']]
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
      data: {
        expediente: {
          id: expediente.id,
          numero_expediente: expediente.numero_expediente,
          nombre_solicitante: expediente.nombre_solicitante,
          area: expediente.area,
          tipo_expediente: expediente.tipo_expediente
        },
        decretos: expediente.decretos_vinculados
      }
    });
  } catch (error) {
    console.error('Get decretos vinculados error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Download decreto file from vinculated decreto
const downloadDecretoFileFromExpediente = async (req, res) => {
  try {
    const { id, decretoId } = req.params;

    const whereClause = { id };
    
    // If user is not admin, only show their expedientes
    if (req.user.rol !== 'admin') {
      whereClause.usuario_creador_id = req.user.id;
    }

    const expediente = await ExpedienteSimple.findOne({
      where: whereClause,
      include: [
        {
          model: Decreto,
          as: 'decretos_vinculados',
          where: { id: decretoId },
          attributes: ['id', 'numero_decreto', 'ruta_archivo', 'nombre_archivo']
        }
      ]
    });

    if (!expediente) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado'
      });
    }

    const decreto = expediente.decretos_vinculados[0];

    if (!decreto) {
      return res.status(404).json({
        success: false,
        message: 'Decreto no encontrado o no vinculado a este expediente'
      });
    }

    if (!decreto.ruta_archivo) {
      return res.status(404).json({
        success: false,
        message: 'No hay archivo asociado al decreto vinculado'
      });
    }

    const filePath = path.resolve(decreto.ruta_archivo);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'El archivo del decreto no existe en el servidor'
      });
    }

    res.download(filePath, decreto.nombre_archivo || 'decreto.pdf');

  } catch (error) {
    console.error('Download decreto file from expediente error:', error);
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
  downloadComprobantePDF,
  getDecretosVinculados,
  downloadDecretoFileFromExpediente
};


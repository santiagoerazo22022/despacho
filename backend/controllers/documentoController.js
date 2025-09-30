const { Documento, Expediente, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { getFileInfo, deleteFile } = require('../middlewares/upload');
const path = require('path');

/**
 * Get documents by expediente ID
 */
const getDocumentosByExpediente = async (req, res) => {
  try {
    const { expedienteId } = req.params;
    const { page = 1, limit = 10, tipo_documento = '' } = req.query;
    const offset = (page - 1) * limit;

    // Check if user has access to this expediente
    const whereExpediente = { id: expedienteId };
    if (req.user.rol !== 'admin') {
      whereExpediente.abogado_responsable_id = req.user.id;
    }

    const expediente = await Expediente.findOne({ where: whereExpediente });
    if (!expediente) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado o no tienes permisos para verlo'
      });
    }

    // Build where clause for documents
    const whereClause = { expediente_id: expedienteId };
    if (tipo_documento) {
      whereClause.tipo_documento = tipo_documento;
    }

    const { count, rows: documentos } = await Documento.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'usuario_subio',
          attributes: ['id', 'nombre', 'apellido']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        documentos,
        expediente: {
          id: expediente.id,
          numero_expediente: expediente.numero_expediente,
          titulo: expediente.titulo
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get documentos by expediente error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Upload document to expediente
 */
const uploadDocumento = async (req, res) => {
  try {
    const { expedienteId } = req.params;
    const { nombre, descripcion, tipo_documento, fecha_documento, es_confidencial } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Archivo requerido'
      });
    }

    // Check if user has access to this expediente
    const whereExpediente = { id: expedienteId };
    if (req.user.rol !== 'admin') {
      whereExpediente.abogado_responsable_id = req.user.id;
    }

    const expediente = await Expediente.findOne({ where: whereExpediente });
    if (!expediente) {
      // Delete uploaded file if expediente not found
      deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado o no tienes permisos para subir documentos'
      });
    }

    const fileInfo = getFileInfo(req.file);

    const documento = await Documento.create({
      nombre: nombre || fileInfo.originalName,
      descripcion,
      tipo_documento,
      nombre_archivo: fileInfo.filename,
      ruta_archivo: fileInfo.path,
      tamaño_archivo: fileInfo.size,
      tipo_mime: fileInfo.mimetype,
      fecha_documento: fecha_documento || new Date(),
      es_confidencial: es_confidencial === 'true',
      expediente_id: expedienteId,
      subido_por: req.user.id
    });

    // Fetch created document with user info
    const createdDocumento = await Documento.findByPk(documento.id, {
      include: [
        {
          model: User,
          as: 'usuario_subio',
          attributes: ['id', 'nombre', 'apellido']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Documento subido exitosamente',
      data: { documento: createdDocumento }
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    console.error('Upload documento error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Download document
 */
const downloadDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findByPk(id, {
      include: [
        {
          model: Expediente,
          as: 'expediente',
          attributes: ['id', 'abogado_responsable_id']
        }
      ]
    });

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Check if user has access to this document
    if (req.user.rol !== 'admin' && documento.expediente.abogado_responsable_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para descargar este documento'
      });
    }

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(documento.ruta_archivo)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el servidor'
      });
    }

    // Set headers for download
    res.setHeader('Content-Type', documento.tipo_mime);
    res.setHeader('Content-Disposition', `attachment; filename="${documento.nombre_archivo}"`);
    
    // Send file
    res.sendFile(path.resolve(documento.ruta_archivo));
  } catch (error) {
    console.error('Download documento error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update document metadata
 */
const updateDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, tipo_documento, fecha_documento, es_confidencial, estado } = req.body;

    const documento = await Documento.findByPk(id, {
      include: [
        {
          model: Expediente,
          as: 'expediente',
          attributes: ['id', 'abogado_responsable_id']
        }
      ]
    });

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Check if user has access to this document
    if (req.user.rol !== 'admin' && documento.expediente.abogado_responsable_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este documento'
      });
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (tipo_documento) updateData.tipo_documento = tipo_documento;
    if (fecha_documento) updateData.fecha_documento = fecha_documento;
    if (es_confidencial !== undefined) updateData.es_confidencial = es_confidencial;
    if (estado) updateData.estado = estado;

    await documento.update(updateData);

    // Fetch updated document
    const updatedDocumento = await Documento.findByPk(id, {
      include: [
        {
          model: User,
          as: 'usuario_subio',
          attributes: ['id', 'nombre', 'apellido']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Documento actualizado exitosamente',
      data: { documento: updatedDocumento }
    });
  } catch (error) {
    console.error('Update documento error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete document
 */
const deleteDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findByPk(id, {
      include: [
        {
          model: Expediente,
          as: 'expediente',
          attributes: ['id', 'abogado_responsable_id']
        }
      ]
    });

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Check if user has access to this document
    if (req.user.rol !== 'admin' && documento.expediente.abogado_responsable_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este documento'
      });
    }

    // Delete physical file
    deleteFile(documento.ruta_archivo);

    // Delete database record
    await documento.destroy();

    res.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Delete documento error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDocumentosByExpediente,
  uploadDocumento,
  downloadDocumento,
  updateDocumento,
  deleteDocumento
};

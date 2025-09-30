const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate payment receipt PDF
 * @param {Object} pagoData - Payment data
 * @param {String} outputPath - Output file path
 * @returns {Promise<String>} Generated PDF path
 */
const generatePaymentReceipt = (pagoData, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50,
        info: {
          Title: `Recibo de Pago - ${pagoData.numero_recibo}`,
          Author: 'Despacho Jurídico',
          Subject: 'Comprobante de Pago',
          Keywords: 'recibo, pago, honorarios'
        }
      });

      // Create write stream
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('RECIBO DE PAGO', 50, 50, { align: 'center' });

      // Receipt number and date
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Recibo No: ${pagoData.numero_recibo}`, 50, 100)
         .text(`Fecha: ${new Date(pagoData.fecha_pago).toLocaleDateString('es-MX')}`, 400, 100);

      // Client information
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('DATOS DEL CLIENTE', 50, 140);

      doc.fontSize(11)
         .font('Helvetica')
         .text(`Cliente: ${pagoData.cliente.nombre} ${pagoData.cliente.apellido}`, 50, 165)
         .text(`Email: ${pagoData.cliente.email || 'N/A'}`, 50, 180)
         .text(`Teléfono: ${pagoData.cliente.telefono || 'N/A'}`, 50, 195);

      // Expediente information
      if (pagoData.expediente) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('DATOS DEL EXPEDIENTE', 50, 225);

        doc.fontSize(11)
           .font('Helvetica')
           .text(`Expediente: ${pagoData.expediente.numero_expediente}`, 50, 250)
           .text(`Asunto: ${pagoData.expediente.titulo}`, 50, 265)
           .text(`Tipo: ${pagoData.expediente.tipo_caso}`, 50, 280);
      }

      // Payment details
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('DETALLES DEL PAGO', 50, 320);

      // Payment table
      const tableTop = 350;
      const tableLeft = 50;
      
      // Table headers
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('Concepto', tableLeft, tableTop)
         .text('Método de Pago', tableLeft + 200, tableTop)
         .text('Monto', tableLeft + 350, tableTop);

      // Table line
      doc.moveTo(tableLeft, tableTop + 15)
         .lineTo(tableLeft + 450, tableTop + 15)
         .stroke();

      // Payment data
      doc.fontSize(11)
         .font('Helvetica')
         .text(pagoData.concepto, tableLeft, tableTop + 25, { width: 180 })
         .text(pagoData.metodo_pago.toUpperCase(), tableLeft + 200, tableTop + 25)
         .text(`$${parseFloat(pagoData.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, tableLeft + 350, tableTop + 25);

      // Reference if exists
      if (pagoData.referencia_pago) {
        doc.text(`Referencia: ${pagoData.referencia_pago}`, tableLeft, tableTop + 50);
      }

      // Notes if exists
      if (pagoData.notas) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('NOTAS', 50, tableTop + 80);
        
        doc.fontSize(11)
           .font('Helvetica')
           .text(pagoData.notas, 50, tableTop + 105, { width: 500 });
      }

      // Footer
      const footerTop = 700;
      doc.fontSize(10)
         .font('Helvetica')
         .text('Este documento es un comprobante de pago válido.', 50, footerTop)
         .text(`Recibido por: ${pagoData.usuario_recibio.nombre} ${pagoData.usuario_recibio.apellido}`, 50, footerTop + 15)
         .text(`Generado el: ${new Date().toLocaleString('es-MX')}`, 50, footerTop + 30);

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate expediente report PDF
 * @param {Object} expedienteData - Expediente data with related models
 * @param {String} outputPath - Output file path
 * @returns {Promise<String>} Generated PDF path
 */
const generateExpedienteReport = (expedienteData, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50,
        info: {
          Title: `Reporte de Expediente - ${expedienteData.numero_expediente}`,
          Author: 'Despacho Jurídico',
          Subject: 'Reporte de Expediente',
          Keywords: 'expediente, reporte, caso'
        }
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('REPORTE DE EXPEDIENTE', 50, 50, { align: 'center' });

      // Expediente basic info
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Expediente: ${expedienteData.numero_expediente}`, 50, 100)
         .text(`Estado: ${expedienteData.estado.toUpperCase()}`, 400, 100);

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(expedienteData.titulo, 50, 130);

      // Client and lawyer info
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('INFORMACIÓN GENERAL', 50, 160);

      doc.fontSize(11)
         .font('Helvetica')
         .text(`Cliente: ${expedienteData.cliente.nombre} ${expedienteData.cliente.apellido}`, 50, 180)
         .text(`Abogado Responsable: ${expedienteData.abogado_responsable.nombre} ${expedienteData.abogado_responsable.apellido}`, 50, 195)
         .text(`Tipo de Caso: ${expedienteData.tipo_caso}`, 50, 210)
         .text(`Prioridad: ${expedienteData.prioridad}`, 50, 225)
         .text(`Fecha de Inicio: ${new Date(expedienteData.fecha_inicio).toLocaleDateString('es-MX')}`, 50, 240);

      if (expedienteData.fecha_cierre) {
        doc.text(`Fecha de Cierre: ${new Date(expedienteData.fecha_cierre).toLocaleDateString('es-MX')}`, 50, 255);
      }

      // Financial info
      let currentY = 280;
      if (expedienteData.honorarios_estimados || expedienteData.honorarios_pagados) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('INFORMACIÓN FINANCIERA', 50, currentY);
        
        currentY += 20;
        
        if (expedienteData.honorarios_estimados) {
          doc.fontSize(11)
             .font('Helvetica')
             .text(`Honorarios Estimados: $${parseFloat(expedienteData.honorarios_estimados).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 50, currentY);
          currentY += 15;
        }
        
        if (expedienteData.honorarios_pagados) {
          doc.text(`Honorarios Pagados: $${parseFloat(expedienteData.honorarios_pagados).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 50, currentY);
          currentY += 15;
        }
      }

      // Documents summary
      if (expedienteData.documentos && expedienteData.documentos.length > 0) {
        currentY += 20;
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('DOCUMENTOS', 50, currentY);
        
        currentY += 20;
        doc.fontSize(11)
           .font('Helvetica')
           .text(`Total de documentos: ${expedienteData.documentos.length}`, 50, currentY);
        
        currentY += 15;
        expedienteData.documentos.slice(0, 10).forEach((doc_item, index) => {
          if (currentY > 650) return; // Avoid page overflow
          doc.text(`${index + 1}. ${doc_item.nombre} (${doc_item.tipo_documento})`, 60, currentY);
          currentY += 12;
        });
        
        if (expedienteData.documentos.length > 10) {
          doc.text(`... y ${expedienteData.documentos.length - 10} documentos más`, 60, currentY);
          currentY += 15;
        }
      }

      // Notes
      if (expedienteData.notas) {
        currentY += 20;
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('NOTAS', 50, currentY);
        
        currentY += 20;
        doc.fontSize(11)
           .font('Helvetica')
           .text(expedienteData.notas, 50, currentY, { width: 500 });
      }

      // Footer
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Reporte generado el: ${new Date().toLocaleString('es-MX')}`, 50, 750, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate unique filename for PDF
 * @param {String} prefix - Filename prefix
 * @param {String} extension - File extension (default: 'pdf')
 * @returns {String} Unique filename
 */
const generateUniqueFilename = (prefix = 'document', extension = 'pdf') => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  return `${prefix}-${timestamp}-${random}.${extension}`;
};

/**
 * Generate expediente simple receipt PDF with improved design
 * @param {Object} expedienteData - Expediente data
 * @param {Object} usuario - User who created the expediente
 * @param {String} outputPath - Output file path
 * @returns {Promise<String>} Generated PDF path
 */
const generateExpedienteSimpleReceipt = (expedienteData, usuario, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 40,
        info: {
          Title: `Comprobante de Expediente - ${expedienteData.numero_expediente}`,
          Author: 'Sistema de Expedientes Jurídicos',
          Subject: 'Comprobante de Carga de Expediente',
          Keywords: 'expediente, comprobante, jurídico'
        }
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Colors
      const primaryColor = '#1976d2';
      const secondaryColor = '#f5f5f5';
      const textColor = '#333333';
      const lightGray = '#e0e0e0';

      // Header with logo area and title
      doc.rect(40, 40, 515, 80)
         .fillAndStroke(primaryColor, primaryColor);

      doc.fillColor('white')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('COMPROBANTE DE EXPEDIENTE', 60, 65, { align: 'center', width: 475 });

      doc.fontSize(12)
         .font('Helvetica')
         .text('Sistema de Gestión de Expedientes Jurídicos', 60, 95, { align: 'center', width: 475 });

      // Document info section
      doc.fillColor(textColor)
         .fontSize(10)
         .font('Helvetica')
         .text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES', { 
           year: 'numeric', 
           month: 'long', 
           day: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
         })}`, 400, 140);

      // Main content area
      let currentY = 170;

      // Expediente number - highlighted box
      doc.rect(40, currentY, 515, 35)
         .fillAndStroke(secondaryColor, lightGray);

      doc.fillColor(primaryColor)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('NÚMERO DE EXPEDIENTE', 60, currentY + 8);

      doc.fillColor(textColor)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text(expedienteData.numero_expediente, 60, currentY + 25);

      currentY += 60;

      // Solicitante information section
      doc.fillColor(primaryColor)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('DATOS DEL SOLICITANTE', 40, currentY);

      currentY += 25;

      // Create a nice table-like structure for solicitante data
      const drawInfoRow = (label, value, y) => {
        doc.rect(40, y, 515, 25)
           .fillAndStroke(y % 50 === 0 ? 'white' : secondaryColor, lightGray);
        
        doc.fillColor(textColor)
           .fontSize(11)
           .font('Helvetica-Bold')
           .text(label + ':', 60, y + 8);
        
        doc.font('Helvetica')
           .text(value, 200, y + 8, { width: 340 });
      };

      drawInfoRow('Nombre completo', expedienteData.nombre_solicitante, currentY);
      currentY += 25;
      drawInfoRow('Documento de identidad', expedienteData.dni, currentY);
      currentY += 25;
      drawInfoRow('Área de consulta', expedienteData.area, currentY);
      currentY += 25;
      drawInfoRow('Fecha de carga', new Date(expedienteData.fecha_carga).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }), currentY);

      currentY += 50;

      // Description section if exists
      if (expedienteData.descripcion) {
        doc.fillColor(primaryColor)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('DESCRIPCIÓN DEL CASO', 40, currentY);

        currentY += 25;

        doc.rect(40, currentY, 515, Math.max(60, expedienteData.descripcion.length / 8))
           .fillAndStroke(secondaryColor, lightGray);

        doc.fillColor(textColor)
           .fontSize(11)
           .font('Helvetica')
           .text(expedienteData.descripcion, 60, currentY + 15, { 
             width: 475, 
             align: 'justify',
             lineGap: 2
           });

        currentY += Math.max(80, expedienteData.descripcion.length / 6);
      }

      // File information if exists
      if (expedienteData.nombre_archivo_escaneado) {
        doc.fillColor(primaryColor)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('ARCHIVO ADJUNTO', 40, currentY);

        currentY += 25;

        doc.rect(40, currentY, 515, 25)
           .fillAndStroke(secondaryColor, lightGray);

        doc.fillColor(textColor)
           .fontSize(11)
           .font('Helvetica')
           .text('📎 ' + expedienteData.nombre_archivo_escaneado, 60, currentY + 8);

        currentY += 50;
      }

      // User information section
      doc.fillColor(primaryColor)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('INFORMACIÓN DEL REGISTRO', 40, currentY);

      currentY += 25;

      drawInfoRow('Registrado por', `${usuario.nombre} ${usuario.apellido}`, currentY);
      currentY += 25;
      drawInfoRow('Estado del expediente', 'ACTIVO', currentY);

      // Footer section
      const footerY = 720;
      
      // Footer line
      doc.moveTo(40, footerY)
         .lineTo(555, footerY)
         .strokeColor(lightGray)
         .stroke();

      doc.fillColor('#666666')
         .fontSize(9)
         .font('Helvetica')
         .text('Este documento es un comprobante oficial de la carga del expediente en el sistema.', 40, footerY + 10)
         .text('Conserve este comprobante para futuras referencias y trámites relacionados.', 40, footerY + 22)
         .text(`Generado automáticamente el ${new Date().toLocaleString('es-ES')}`, 40, footerY + 34);

      // QR Code placeholder (you can implement actual QR generation later)
      doc.rect(480, footerY + 10, 60, 60)
         .fillAndStroke('#f0f0f0', lightGray);
      
      doc.fillColor('#999999')
         .fontSize(8)
         .text('QR CODE', 495, footerY + 35);

      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Ensure comprobantes directory exists
 */
const ensureComprobantesDir = () => {
  const dir = './uploads/comprobantes';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

module.exports = {
  generatePaymentReceipt,
  generateExpedienteReport,
  generateExpedienteSimpleReceipt,
  generateUniqueFilename,
  ensureComprobantesDir
};

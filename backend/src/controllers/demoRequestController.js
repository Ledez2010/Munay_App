const { DemoRequest } = require('../models');
const emailService = require('../services/emailService');

class DemoRequestController {
  // Enviar solicitud de demo
  async submitDemoRequest(req, res) {
    try {
      const { name, email, phone, school } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y email son requeridos'
        });
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      const requestId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const demoRequest = await DemoRequest.create({
        id: requestId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        school: school?.trim() || null,
        status: 'pending'
      });

      // Enviar correo a contacto@somosmunay.com
      try {
        const emailSent = await emailService.sendDemoRequestEmail({
          name: name.trim(),
          email: email.trim(),
          phone: phone?.trim() || null,
          school: school?.trim() || null
        });

        if (emailSent) {
          console.log('✅ Correo de solicitud de demo enviado exitosamente a contacto@somosmunay.com');
        } else {
          console.error('❌ ERROR: No se pudo enviar el correo a contacto@somosmunay.com');
          console.error('❌ Verifica la configuración de email en las variables de entorno');
          console.error('❌ Revisa EMAIL_CONFIG.md para más información');
        }
      } catch (emailError) {
        console.error('❌ ERROR al enviar correo:', emailError.message);
        console.error('❌ La solicitud se guardó en la base de datos pero el correo no se envió');
        console.error('❌ Verifica la configuración de email en las variables de entorno');
      }

      res.status(201).json({
        success: true,
        data: demoRequest,
        message: 'Solicitud de demo enviada correctamente'
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una solicitud con este email'
        });
      }
      console.error('Error al procesar solicitud de demo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al enviar solicitud'
      });
    }
  }

  // Obtener solicitudes (solo admin/desarrollo)
  async getDemoRequests(req, res) {
    try {
      // En producción, esto debería requerir rol admin
      const { status } = req.query;
      const where = {};
      if (status) where.status = status;

      const requests = await DemoRequest.findAll({
        where,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitudes'
      });
    }
  }
}

module.exports = new DemoRequestController();


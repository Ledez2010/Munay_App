const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configurar transporter según variables de entorno
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Si hay configuración SMTP, usarla; si no, usar Gmail
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      // Configuración Gmail
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      console.warn('⚠️ No hay configuración de correo. Los correos no se enviarán.');
      this.transporter = null;
    }
  }

  async sendDemoRequestEmail(demoData) {
    if (!this.transporter) {
      console.error('❌ ERROR: No hay transporter configurado. No se puede enviar correo.');
      console.error('❌ Verifica que las variables de entorno EMAIL_USER y EMAIL_PASSWORD estén configuradas');
      console.error('❌ O configura SMTP_HOST, SMTP_PORT, SMTP_USER y SMTP_PASSWORD');
      return false;
    }

    const { name, email, phone, school } = demoData;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@somosmunay.com',
      to: 'contacto@somosmunay.com',
      subject: `Nueva Solicitud de Demo - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Nunito', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #7BA680 0%, #5a8a65 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .info-box {
              background: white;
              padding: 20px;
              margin: 15px 0;
              border-radius: 8px;
              border-left: 4px solid #7BA680;
            }
            .label {
              font-weight: 600;
              color: #1a2332;
              margin-bottom: 5px;
            }
            .value {
              color: #5a6c7d;
              margin-bottom: 15px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #888;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🎓 Nueva Solicitud de Demo</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Plataforma Munay</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; color: #1a2332; margin-bottom: 25px;">
              Has recibido una nueva solicitud de demo de la plataforma Munay.
            </p>
            
            <div class="info-box">
              <div class="label">👤 Nombre completo</div>
              <div class="value">${name}</div>
              
              <div class="label">📧 Email</div>
              <div class="value">
                <a href="mailto:${email}" style="color: #7BA680; text-decoration: none;">${email}</a>
              </div>
              
              <div class="label">📞 Teléfono</div>
              <div class="value">${phone || 'No proporcionado'}</div>
              
              <div class="label">🏫 Centro educativo</div>
              <div class="value">${school || 'No proporcionado'}</div>
            </div>
            
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #2e7d32; font-weight: 600;">
                ⏰ Fecha de solicitud: ${new Date().toLocaleString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>Este correo fue generado automáticamente por la plataforma Munay.</p>
            <p style="margin: 5px 0;">
              <a href="https://somosmunay.com" style="color: #7BA680; text-decoration: none;">somosmunay.com</a>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Nueva Solicitud de Demo - Plataforma Munay

Nombre: ${name}
Email: ${email}
Teléfono: ${phone || 'No proporcionado'}
Centro educativo: ${school || 'No proporcionado'}

Fecha: ${new Date().toLocaleString('es-ES')}
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Correo enviado exitosamente a contacto@somosmunay.com');
      console.log('📧 Message ID:', info.messageId);
      console.log('📧 De:', mailOptions.from);
      console.log('📧 Para:', mailOptions.to);
      return true;
    } catch (error) {
      console.error('❌ ERROR al enviar correo a contacto@somosmunay.com');
      console.error('❌ Error detallado:', error.message);
      if (error.response) {
        console.error('❌ Respuesta del servidor:', error.response);
      }
      if (error.code) {
        console.error('❌ Código de error:', error.code);
      }
      return false;
    }
  }

  // Verificar conexión SMTP
  async verifyConnection() {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Servidor de correo listo');
      return true;
    } catch (error) {
      console.error('❌ Error al verificar servidor de correo:', error);
      return false;
    }
  }
}

module.exports = new EmailService();




<?php
/**
 * Script PHP simple para enviar correos desde el formulario de demo
 * 
 * Uso: Sube este archivo a Hostalia y apunta el formulario a este script
 */

// Configuración
$to = 'contacto@somosmunay.com';
$from = 'noreply@somosmunay.com'; // Email de envío (puede necesitar configuración en el servidor)
$fromName = 'Munay - Solicitud de Demo';

// Obtener datos del formulario
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$school = isset($_POST['school']) ? trim($_POST['school']) : '';

// Validar campos requeridos
if (empty($name) || empty($email)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Nombre y email son requeridos'
    ]);
    exit;
}

// Validar email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email inválido'
    ]);
    exit;
}

// Preparar el correo
$subject = "Nueva Solicitud de Demo - $name";

$message = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7BA680 0%, #5a8a65 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #7BA680; }
        .label { font-weight: 600; color: #1a2332; margin-bottom: 5px; }
        .value { color: #5a6c7d; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='margin: 0; font-size: 24px;'>🎓 Nueva Solicitud de Demo</h1>
            <p style='margin: 10px 0 0 0; opacity: 0.9;'>Plataforma Munay</p>
        </div>
        
        <div class='content'>
            <p style='font-size: 16px; color: #1a2332; margin-bottom: 25px;'>
                Has recibido una nueva solicitud de demo de la plataforma Munay.
            </p>
            
            <div class='info-box'>
                <div class='label'>👤 Nombre completo</div>
                <div class='value'>" . htmlspecialchars($name) . "</div>
                
                <div class='label'>📧 Email</div>
                <div class='value'>
                    <a href='mailto:" . htmlspecialchars($email) . "' style='color: #7BA680; text-decoration: none;'>" . htmlspecialchars($email) . "</a>
                </div>
                
                <div class='label'>📞 Teléfono</div>
                <div class='value'>" . ($phone ? htmlspecialchars($phone) : 'No proporcionado') . "</div>
                
                <div class='label'>🏫 Centro educativo</div>
                <div class='value'>" . ($school ? htmlspecialchars($school) : 'No proporcionado') . "</div>
            </div>
            
            <div style='background: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 20px;'>
                <p style='margin: 0; color: #2e7d32; font-weight: 600;'>
                    ⏰ Fecha de solicitud: " . date('d/m/Y H:i') . "
                </p>
            </div>
        </div>
    </div>
</body>
</html>
";

// Headers del correo
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: $fromName <$from>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "X-Priority: 1\r\n"; // Alta prioridad
$headers .= "Return-Path: $from\r\n";

// Intentar enviar el correo
$mailSent = mail($to, $subject, $message, $headers);

if ($mailSent) {
    // Respuesta exitosa
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Solicitud de demo enviada correctamente'
    ]);
} else {
    // Error al enviar
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Error al enviar la solicitud. Por favor, intenta de nuevo.'
    ]);
}
?>




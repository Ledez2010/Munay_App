// ========== CONFIGURACIÓN DE PRODUCCIÓN ==========
// Este archivo permite configurar la URL de la API según el entorno

(function() {
    // Detectar si estamos en producción o desarrollo
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1' &&
                         !window.location.hostname.startsWith('192.168.');
    
    // Configurar URL de API
    if (isProduction) {
    // En producción, usar el mismo dominio (backend en el mismo servidor)
    // El backend debe estar configurado para responder en /api
    // Si el backend está en una subcarpeta: https://www.somosmunay.com/api
    // Si el backend está en subdominio: https://api.somosmunay.com
    window.API_URL = window.API_URL || 'https://www.somosmunay.com/api';
    } else {
        // En desarrollo, usar localhost
        window.API_URL = window.API_URL || 'http://localhost:3000/api';
    }
    
    console.log('🌍 Entorno:', isProduction ? 'PRODUCCIÓN' : 'DESARROLLO');
    console.log('🔗 API URL:', window.API_URL);
})();


/**
 * Configuración de API - Backend
 * Solo funciona con backend - sin fallback a localStorage
 */

// Configuración del backend - Declarar solo una vez en window para evitar conflictos
if (typeof window !== 'undefined' && !window.API_CONFIG) {
  // Detectar si estamos en producción
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' &&
                       !window.location.hostname.startsWith('192.168.');
  
  // URL del backend según el entorno
  const BASE_URL = isProduction 
    ? `${window.location.protocol}//${window.location.hostname}/api`
    : 'http://localhost:3000/api';
  
  window.API_CONFIG = {
    // URL del backend (detecta automáticamente producción/desarrollo)
    BASE_URL: BASE_URL,
    
    // Timeout para las peticiones (en milisegundos)
    TIMEOUT: 10000,
    
    // Habilitar/deshabilitar el uso del backend
    ENABLED: true // Backend habilitado - solo funciona con backend
  };
}

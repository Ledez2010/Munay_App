/**
 * Sistema de Integración Backend
 * Solo funciona con backend - sin fallback a localStorage
 */

// Usar API_CONFIG de config-api.js (ya cargado antes)
function getAPIConfig() {
  if (typeof window !== 'undefined' && window.API_CONFIG) {
    return window.API_CONFIG;
  }
  return {
    BASE_URL: 'http://localhost:3000/api',
    ENABLED: true,
    TIMEOUT: 10000
  };
}

/**
 * Verificar si el backend está disponible
 */
async function checkBackendAvailability() {
  const config = getAPIConfig();
  if (!config.ENABLED) {
    return false;
  }

  // Intentar primero /api/health (a través del proxy)
  try {
    const response = await fetch(`${config.BASE_URL}/health`, {
      method: 'GET',
      mode: 'cors',
      signal: AbortSignal.timeout(3000)
    });
    if (response.ok) {
      return true;
    }
  } catch (error) {
    // Si falla, intentar /health directamente (acceso directo al servidor)
    try {
      const baseUrl = config.BASE_URL.replace('/api', '');
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        return true;
      }
    } catch (error2) {
      console.error('❌ Backend no disponible:', error2.message);
      return false;
    }
  }
  
  return false;
}

/**
 * Función genérica para hacer peticiones al backend
 */
async function apiRequest(endpoint, options = {}) {
  const config = getAPIConfig();
  
  if (!config.ENABLED) {
    throw new Error('Backend no está habilitado');
  }

  try {
    const url = `${config.BASE_URL}${endpoint}`;
    const defaultOptions = {
      method: options.method || 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: AbortSignal.timeout(config.TIMEOUT || 10000)
    };

    // Agregar token si existe
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error en petición API:', error);
    throw error;
  }
}

/**
 * Servicio de Autenticación - Solo Backend
 */
const AuthService = {
  /**
   * Login - Solo backend
   */
  async login(email, password, role = null) {
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
      });

      if (result && result.success) {
        const data = result.data || result;
        const token = data.token;
        const user = data.user || data;
        
        if (token) {
          localStorage.setItem('authToken', token);
        }
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        
        return {
          success: true,
          user: user,
          token: token
        };
      }
      
      return {
        success: false,
        message: result.message || 'Error al iniciar sesión'
      };
    } catch (error) {
      console.error('❌ Error en login:', error);
      return {
        success: false,
        message: error.message || 'Error al conectar con el servidor'
      };
    }
  },

  /**
   * Register - Solo backend
   */
  async register(userData) {
    try {
      const result = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (result && result.success) {
        const data = result.data || result;
        const token = data.token;
        const user = data.user || data;
        
        if (token) {
          localStorage.setItem('authToken', token);
        }
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        
        return {
          success: true,
          user: user,
          token: token
        };
      }
      
      return {
        success: false,
        message: result.message || 'Error al registrar usuario'
      };
    } catch (error) {
      console.error('❌ Error en registro:', error);
      return {
        success: false,
        message: error.message || 'Error al conectar con el servidor'
      };
    }
  },

  /**
   * Logout
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  /**
   * Obtener usuario actual - Solo desde localStorage (se guarda después del login)
   * Si no hay usuario, debe obtenerse del backend usando /auth/me
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error al parsear usuario:', e);
        localStorage.removeItem('currentUser');
        return null;
      }
    }
    return null;
  }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.AuthService = AuthService;
  window.apiRequest = apiRequest;
  window.checkBackendAvailability = checkBackendAvailability;
}

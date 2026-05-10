// Configuración de la aplicación
// La URL del backend se obtiene de la variable de entorno VITE_API_URL
// Si no está definida, usa localhost como fallback para desarrollo local
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

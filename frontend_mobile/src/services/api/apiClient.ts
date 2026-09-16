// Este es el puente entre front y bak


import { apiClient, BASE_URL } from '../../config/api';
// apiClient HTTP peticiones 
// BASE_URL direccion bak

// Para que asi se importe desde AuthContext
export { apiClient, BASE_URL };

// Exporta sin necesidad de llaves
export default apiClient;
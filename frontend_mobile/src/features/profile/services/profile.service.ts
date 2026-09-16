// Importa el cliente HTTP configurado (apiClient) que maneja las peticiones al backend
// Este cliente ya tiene configurada la base URL, interceptores y el token JWT automático
import { apiClient } from '../../../services/api/apiClient';

// Importa los modelos de datos para tipar las respuestas y peticiones
// UserProfile: estructura del perfil del usuario que se recibe del backend
// UpdateProfilePayload: estructura de los datos que se envían al actualizar
import { UserProfile, UpdateProfilePayload } from '../models/profile.models';

// Define y exporta el objeto profileFeatureService con tres métodos
// Es un servicio que agrupa todas las operaciones relacionadas con el perfil
export const profileFeatureService = {
  
  /**
   * getProfile: Obtiene los datos actualizados del perfil del usuario autenticado
   * @returns Promise<UserProfile> - Retorna una promesa con los datos del perfil
   * 
   * 🛣️ RUTA: GET /users/profile
   * 📍 DÓNDE VA EN EL BACKEND: 
   *    → routes/user.routes.ts
   *    → controllers/user.controller.ts (getProfile)
   *    → services/user.service.ts
   *    → models/User.model.ts (SELECT * FROM users WHERE id = ?)
   * 🗄️ TABLA: users
   */
  async getProfile(): Promise<UserProfile> {
    // Realiza una petición GET al endpoint /users/profile
    // apiClient automáticamente añade:
    // - La base URL (ej: http://localhost:3000/api)
    // - El token JWT en el header (Authorization: Bearer <token>)
    const res = await apiClient.get('/users/profile');
    
    // El backend responde con: { success: true, data: { UserProfile } }
    // Retorna solo el objeto data que contiene el perfil del usuario
    return res.data.data;
  },

  /**
   * updateProfile: Actualiza los datos del perfil del usuario autenticado
   * @param payload: UpdateProfilePayload - Datos a actualizar (nombre, teléfono, localidad, etc.)
   * @returns Promise<UserProfile> - Retorna una promesa con los datos actualizados
   * 
   * 🛣️ RUTA: PUT /users/profile
   * 📍 DÓNDE VA EN EL BACKEND: 
   *    → routes/user.routes.ts
   *    → middlewares/auth.middleware.ts (valida token y extrae user_id)
   *    → controllers/user.controller.ts (updateProfile)
   *    → services/user.service.ts (actualiza campos)
   *    → models/User.model.ts (UPDATE users SET ... WHERE id = ?)
   * 🗄️ TABLA: users
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    // Realiza una petición PUT al endpoint /users/profile
    // Envía en el body los datos a actualizar (payload)
    // apiClient automáticamente añade el token JWT en el header
    const res = await apiClient.put('/users/profile', payload);
    
    // El backend responde con: { success: true, data: { UserProfile actualizado } }
    // Retorna solo el objeto data con el perfil actualizado
    return res.data.data;
  },

  /**
   * deleteAccount: Elimina la cuenta de un usuario por su ID
   * @param id: number - ID del usuario a eliminar
   * @returns Promise<boolean> - Retorna true si la eliminación fue exitosa
   * 
   * 🛣️ RUTA: DELETE /users/:id
   * 📍 DÓNDE VA EN EL BACKEND: 
   *    → routes/user.routes.ts (DELETE /users/:id)
   *    → middlewares/auth.middleware.ts (valida token)
   *    → middlewares/role.middleware.ts (solo Admin o el propio usuario)
   *    → controllers/user.controller.ts (deleteUser)
   *    → services/user.service.ts (elimina usuario)
   *    → models/User.model.ts (DELETE FROM users WHERE id = ?)
   * 🗄️ TABLA: users (y cascada a eventos, donaciones, etc.)
   */
  async deleteAccount(id: number): Promise<boolean> {
    // Realiza una petición DELETE al endpoint /users/:id
    // El :id se reemplaza con el número proporcionado
    // apiClient añade el token JWT automáticamente
    const res = await apiClient.delete(`/users/${id}`);
    
    // El backend responde con: { success: true, message: "Usuario eliminado" }
    // Retorna solo el booleano success
    return res.data.success;
  },
};

// Exporta el servicio por defecto
export default profileFeatureService;
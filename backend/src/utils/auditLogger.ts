import { AuditModel } from '../models/auditModel';
import { UsuarioModel } from '../models/usuarioModel';

export async function logAudit(userId: number, action: string) {
  try {
    const user = await UsuarioModel.getById(userId);
    const nombre = user ? `${user.nombre1} ${user.apellido1}` : 'Usuario Desconocido';
    const rol = user ? user.rol : 'General';
    
    await AuditModel.create({
      fecha: new Date().toISOString(),
      accion: action,
      id_usuario: userId,
      nombre_usuario: nombre,
      rol_usuario: rol
    });
  } catch (err) {
    console.error('Error logging audit action:', err);
  }
}

import { UsuarioModel, UsuarioDB } from '../models/usuarioModel';
import { OrganizacionModel } from '../models/organizacionModel';
import { comparePasswords, hashPassword, generateJWT } from '../utils/auth';
import { AuditLogger } from '../utils/auditLogger';

export class AuthService {
  static async login(correo: string, passwordPlain: string) {
    const user = await UsuarioModel.getByEmail(correo.trim());
    if (!user) {
      // También intentar buscar en organizaciones si tiene cuenta allí
      const org = await OrganizacionModel.getByEmail(correo.trim());
      if (!org || !org.password) {
        return { success: false, message: 'Usuario u organización no encontrada con este correo.' };
      }

      const isMatch = await comparePasswords(passwordPlain, org.password);
      if (!isMatch) {
        return { success: false, message: 'Credenciales inválidas.' };
      }

      const token = generateJWT({
        id: org.id_organizacion,
        rol: 'Organizacion',
        correo: org.correo,
        nombre: org.nombre,
      });

      return {
        success: true,
        token,
        usuario: {
          id_usuario: org.id_organizacion,
          rol: 'Organizacion',
          nombre1: org.nombre,
          apellido1: '',
          correo: org.correo,
          telefono: org.telefono,
          direccion: org.direccion,
          verificada: org.verificada,
          estado: org.estado,
        },
      };
    }

    if (!user.password) {
      return { success: false, message: 'La cuenta no tiene clave configurada.' };
    }

    const isMatch = await comparePasswords(passwordPlain, user.password);
    if (!isMatch) {
      return { success: false, message: 'Credenciales inválidas.' };
    }

    const token = generateJWT({
      id: user.id_usuario,
      rol: user.rol,
      correo: user.correo,
      nombre: `${user.nombre1} ${user.apellido1}`,
    });

    await AuditLogger.log(user.id_usuario, `${user.nombre1} ${user.apellido1}`, user.rol, 'Inicio de sesión exitoso');

    const { password, ...usuarioSinPass } = user;
    return {
      success: true,
      token,
      usuario: usuarioSinPass,
    };
  }

  static async register(userData: Partial<UsuarioDB>, passwordPlain: string) {
    const existing = await UsuarioModel.getByEmail(userData.correo || '');
    if (existing) {
      return { success: false, message: 'El correo electrónico ya se encuentra registrado.' };
    }

    const hashedPassword = await hashPassword(passwordPlain);
    const newUserId = await UsuarioModel.create({
      ...userData,
      password: hashedPassword,
      estado: 1,
    });

    const createdUser = await UsuarioModel.getById(newUserId);
    if (!createdUser) {
      return { success: false, message: 'No se pudo crear la cuenta de usuario.' };
    }

    const token = generateJWT({
      id: createdUser.id_usuario,
      rol: createdUser.rol,
      correo: createdUser.correo,
      nombre: `${createdUser.nombre1} ${createdUser.apellido1}`,
    });

    await AuditLogger.log(
      createdUser.id_usuario,
      `${createdUser.nombre1} ${createdUser.apellido1}`,
      createdUser.rol,
      `Registro de nueva cuenta rol ${createdUser.rol}`
    );

    const { password, ...usuarioSinPass } = createdUser;
    return {
      success: true,
      token,
      usuario: usuarioSinPass,
    };
  }
}

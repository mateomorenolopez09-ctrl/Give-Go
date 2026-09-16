import { Router } from 'express';
import { UserController } from '../controllers/userController';//conecta con controller
import { validateLogin, validateRegister } from '../validators/userValidator';//conecta con validators
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';// conecta con Middlewares

const router = Router();

// Rutas de autenticación pública
//Ruta login.La peticion POST llega aqui 
router.post('/login', validateLogin, UserController.login);// Va a validators  y depues a controollers
router.post('/register', validateRegister, UserController.register);
router.post('/forgot-password', UserController.forgotPassword);

// Rutas de perfil autenticado
router.get('/profile', authenticateJWT, UserController.getProfile);
router.put('/profile', authenticateJWT, UserController.updateProfile);

// Rutas de consultas por Email y Perfil Público
router.get('/public/:id', UserController.getPublicProfile);
router.get('/by-email/:email', UserController.getByEmail);
router.get('/stats/volunteers-count', UserController.getVolunteersCount);

// CRUD de Usuarios Administrativos (Admin)
router.get('/', authenticateJWT, authorizeRoles('Admin'), UserController.getAll);
router.get('/:id', authenticateJWT, UserController.getById);
router.post('/', authenticateJWT, authorizeRoles('Admin'), UserController.create);
router.put('/:id', authenticateJWT, UserController.update);
router.delete('/:id', authenticateJWT, UserController.delete);

export default router;

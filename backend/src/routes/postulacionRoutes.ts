import { Router } from 'express';
import { postulacionController } from '../controllers/postulacionController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', postulacionController.getAllPostulaciones);
router.get('/usuario/:usuarioId', postulacionController.getUserPostulaciones);
router.get('/evento/:eventoId', postulacionController.getEventPostulaciones);
router.get('/organizacion/:organizacionId', postulacionController.getOrgPostulaciones);

router.post('/', authenticateJWT, postulacionController.createPostulacion);
router.put('/:id/estado', authenticateJWT, postulacionController.updateStatus);
router.delete('/:id', authenticateJWT, postulacionController.deletePostulacion);

export default router;

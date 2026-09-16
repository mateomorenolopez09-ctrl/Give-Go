import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', authenticateJWT, authorizeRoles('Admin'), CategoryController.create);
router.put('/:id', authenticateJWT, authorizeRoles('Admin'), CategoryController.update);
router.delete('/:id', authenticateJWT, authorizeRoles('Admin'), CategoryController.delete);

export default router;

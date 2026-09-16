import { Router } from 'express';
import { OrganizationController } from '../controllers/organizationController';
import { validateOrgRegister } from '../validators/userValidator';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', OrganizationController.getAll);
router.get('/:id', OrganizationController.getById);
router.post('/', validateOrgRegister, OrganizationController.create);
router.put('/:id', authenticateJWT, OrganizationController.update);
router.delete('/:id', authenticateJWT, authorizeRoles('Admin'), OrganizationController.delete);

export default router;

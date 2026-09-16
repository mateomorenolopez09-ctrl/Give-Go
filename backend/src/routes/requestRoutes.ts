import { Router } from 'express';
import { RequestController } from '../controllers/requestController';
import { validateRequest } from '../validators/requestValidator';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', RequestController.getAll);
router.get('/me', authenticateJWT, RequestController.getMyRequests);
router.get('/:id', RequestController.getById);
router.get('/beneficiary/:beneficiarioId', RequestController.getByBeneficiary);
router.post('/', authenticateJWT, validateRequest, RequestController.create);
router.put('/:id', authenticateJWT, RequestController.update);
router.delete('/:id', authenticateJWT, RequestController.delete);

export default router;

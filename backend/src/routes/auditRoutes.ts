import { Router } from 'express';
import { AuditController } from '../controllers/auditController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, AuditController.getAll);

export default router;

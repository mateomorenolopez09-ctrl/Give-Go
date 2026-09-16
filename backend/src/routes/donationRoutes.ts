import { Router } from 'express';
import { DonationController } from '../controllers/donationController';
import { validateMonetaryDonation, validateObjectDonation } from '../validators/donationValidator';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', DonationController.getAll);
router.get('/user/me', authenticateJWT, DonationController.getMyDonations);
router.get('/me', authenticateJWT, DonationController.getMyDonations);
router.get('/:id', DonationController.getById);
router.get('/volunteer/:usuarioId', DonationController.getByVolunteer);
router.get('/organization/:organizacionId', DonationController.getByOrganization);

// Rutas para registrar donaciones - unificada y específicas
router.post('/', authenticateJWT, DonationController.create);
router.post('/monetary', authenticateJWT, authorizeRoles('admin', 'voluntario', 'organizacion'), validateMonetaryDonation, DonationController.createMonetary);
router.post('/object', authenticateJWT, authorizeRoles('admin', 'voluntario', 'organizacion'), validateObjectDonation, DonationController.createObject);

// Eliminar donaciones
router.delete('/:id', authenticateJWT, DonationController.delete);

export default router;

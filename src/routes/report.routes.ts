import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, reportController.generateWorkoutReport);

export default router;
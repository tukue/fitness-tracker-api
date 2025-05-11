import { Router } from 'express';
import * as scheduleController from '../controllers/schedule.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, scheduleController.scheduleWorkout);
router.get('/', authenticate, scheduleController.getScheduledWorkouts);
router.post('/complete', authenticate, scheduleController.completeWorkout);
router.get('/completed', authenticate, scheduleController.getCompletedWorkouts);

export default router;
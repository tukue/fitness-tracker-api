import { Router } from 'express';
import authRoutes from './auth.routes';
import exerciseRoutes from './exercise.routes';
import workoutRoutes from './workout.routes';
import scheduleRoutes from './schedule.routes';
import reportRoutes from './report.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/workouts', workoutRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/reports', reportRoutes);

export default router;
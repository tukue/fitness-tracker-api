import { Router } from 'express';
import * as workoutController from '../controllers/workout.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, workoutController.createWorkoutPlan);
router.get('/', authenticate, workoutController.getWorkoutPlans);
router.get('/:id', authenticate, workoutController.getWorkoutPlanById);
router.put('/:id', authenticate, workoutController.updateWorkoutPlan);
router.delete('/:id', authenticate, workoutController.deleteWorkoutPlan);

export default router;
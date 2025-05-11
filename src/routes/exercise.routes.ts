import { Router } from 'express';
import * as exerciseController from '../controllers/exercise.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, exerciseController.getAllExercises);
router.get('/categories', authenticate, exerciseController.getExerciseCategories);
router.get('/muscle-groups', authenticate, exerciseController.getMuscleGroups);
router.get('/:id', authenticate, exerciseController.getExerciseById);

export default router;
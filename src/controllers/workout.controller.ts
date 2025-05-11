import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest, CreateWorkoutPlanDto } from '../utils/types';

export const createWorkoutPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, description, exercises } = req.body as CreateWorkoutPlanDto;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Create workout plan with exercises in a transaction
    const workoutPlan = await prisma.$transaction(async (tx) => {
      // Create the workout plan
      const plan = await tx.workoutPlan.create({
        data: {
          name,
          description,
          userId
        }
      });
      
      // Add exercises to the workout plan
      if (exercises && exercises.length > 0) {
        await Promise.all(
          exercises.map(exercise => 
            tx.workoutExercise.create({
              data: {
                workoutPlanId: plan.id,
                exerciseId: exercise.exerciseId,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
                duration: exercise.duration,
                notes: exercise.notes
              }
            })
          )
        );
      }
      
      return plan;
    });
    
    // Fetch the complete workout plan with exercises
    const completeWorkoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: workoutPlan.id },
      include: {
        workoutExercises: {
          include: {
            exercise: true
          }
        }
      }
    });
    
    return res.status(201).json(completeWorkoutPlan);
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getWorkoutPlans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const workoutPlans = await prisma.workoutPlan.findMany({
      where: { userId },
      include: {
        workoutExercises: {
          include: {
            exercise: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.status(200).json(workoutPlans);
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getWorkoutPlanById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { 
        id,
        userId // Ensure the workout plan belongs to the user
      },
      include: {
        workoutExercises: {
          include: {
            exercise: true
          }
        }
      }
    });
    
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }
    
    return res.status(200).json(workoutPlan);
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateWorkoutPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, description, exercises } = req.body as CreateWorkoutPlanDto;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if workout plan exists and belongs to the user
    const existingPlan = await prisma.workoutPlan.findUnique({
      where: { 
        id,
        userId
      }
    });
    
    if (!existingPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }
    
    // Update workout plan with exercises in a transaction
    await prisma.$transaction(async (tx) => {
      // Update the workout plan
      await tx.workoutPlan.update({
        where: { id },
        data: {
          name,
          description
        }
      });
      
      // Delete existing exercises
      await tx.workoutExercise.deleteMany({
        where: { workoutPlanId: id }
      });
      
      // Add new exercises
      if (exercises && exercises.length > 0) {
        await Promise.all(
          exercises.map(exercise => 
            tx.workoutExercise.create({
              data: {
                workoutPlanId: id,
                exerciseId: exercise.exerciseId,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
                duration: exercise.duration,
                notes: exercise.notes
              }
            })
          )
        );
      }
    });
    
    // Fetch the updated workout plan
    const updatedWorkoutPlan = await prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        workoutExercises: {
          include: {
            exercise: true
          }
        }
      }
    });
    
    return res.status(200).json(updatedWorkoutPlan);
  } catch (error) {
    console.error('Error updating workout plan:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteWorkoutPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if workout plan exists and belongs to the user
    const existingPlan = await prisma.workoutPlan.findUnique({
      where: { 
        id,
        userId
      }
    });
    
    if (!existingPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }
    
    // Delete the workout plan (cascade will delete related workout exercises)
    await prisma.workoutPlan.delete({
      where: { id }
    });
    
    return res.status(200).json({ message: 'Workout plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest, ScheduleWorkoutDto, CompleteWorkoutDto } from '../utils/types';

export const scheduleWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { workoutPlanId, scheduledFor } = req.body as ScheduleWorkoutDto;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if workout plan exists and belongs to the user
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { 
        id: workoutPlanId,
        userId
      }
    });
    
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }
    
    // Create scheduled workout
    const scheduledWorkout = await prisma.scheduledWorkout.create({
      data: {
        workoutPlanId,
        userId,
        scheduledFor: new Date(scheduledFor)
      },
      include: {
        workoutPlan: {
          include: {
            workoutExercises: {
              include: {
                exercise: true
              }
            }
          }
        }
      }
    });
    
    return res.status(201).json(scheduledWorkout);
  } catch (error) {
    console.error('Error scheduling workout:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getScheduledWorkouts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { completed } = req.query;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const isCompleted = completed === 'true';
    
    const scheduledWorkouts = await prisma.scheduledWorkout.findMany({
      where: { 
        userId,
        completed: isCompleted
      },
      include: {
        workoutPlan: {
          include: {
            workoutExercises: {
              include: {
                exercise: true
              }
            }
          }
        },
        completedWorkout: isCompleted
      },
      orderBy: { scheduledFor: 'asc' }
    });
    
    return res.status(200).json(scheduledWorkouts);
  } catch (error) {
    console.error('Error fetching scheduled workouts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const completeWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { scheduledWorkoutId, notes, rating, duration, exerciseResults } = req.body as CompleteWorkoutDto;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if scheduled workout exists and belongs to the user
    const scheduledWorkout = await prisma.scheduledWorkout.findUnique({
      where: { 
        id: scheduledWorkoutId,
        userId
      }
    });
    
    if (!scheduledWorkout) {
      return res.status(404).json({ message: 'Scheduled workout not found' });
    }
    
    if (scheduledWorkout.completed) {
      return res.status(400).json({ message: 'Workout is already marked as completed' });
    }
    
    // Complete workout in a transaction
    const completedWorkout = await prisma.$transaction(async (tx) => {
      // Mark scheduled workout as completed
      await tx.scheduledWorkout.update({
        where: { id: scheduledWorkoutId },
        data: { completed: true }
      });
      
      // Create completed workout record
      const completed = await tx.completedWorkout.create({
        data: {
          scheduledWorkoutId,
          userId,
          notes,
          rating,
          duration,
          exerciseResults: {
            create: exerciseResults.map(result => ({
              exerciseId: result.exerciseId,
              sets: result.sets,
              reps: result.reps,
              weight: result.weight,
              duration: result.duration,
              notes: result.notes
            }))
          }
        },
        include: {
          exerciseResults: true
        }
      });
      
      return completed;
    });
    
    return res.status(200).json(completedWorkout);
  } catch (error) {
    console.error('Error completing workout:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCompletedWorkouts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const completedWorkouts = await prisma.completedWorkout.findMany({
      where: { userId },
      include: {
        scheduledWorkout: {
          include: {
            workoutPlan: true
          }
        },
        exerciseResults: true
      },
      orderBy: { completedAt: 'desc' }
    });
    
    return res.status(200).json(completedWorkouts);
  } catch (error) {
    console.error('Error fetching completed workouts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
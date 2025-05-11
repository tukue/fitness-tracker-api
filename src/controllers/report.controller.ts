import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest, WorkoutReportParams } from '../utils/types';

export const generateWorkoutReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate, category, muscleGroup } = req.query as unknown as WorkoutReportParams;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }
    
    // Get completed workouts
    const completedWorkouts = await prisma.completedWorkout.findMany({
      where: {
        userId,
        ...(Object.keys(dateFilter).length > 0 && { completedAt: dateFilter })
      },
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
    
    // Calculate statistics
    const totalWorkouts = completedWorkouts.length;
    const totalDuration = completedWorkouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
    const averageRating = completedWorkouts.reduce((sum, workout) => sum + (workout.rating || 0), 0) / 
      (completedWorkouts.filter(w => w.rating !== null).length || 1);
    
    // Get exercise statistics
    const exerciseResults = await prisma.exerciseResult.findMany({
      where: {
        completedWorkout: {
          userId,
          ...(Object.keys(dateFilter).length > 0 && { completedAt: dateFilter })
        }
      },
      include: {
        completedWorkout: true
      }
    });
    
    // Group by exercise
    const exerciseStats: Record<string, {
      totalSets: number;
      totalReps: number;
      totalWeight: number;
      totalDuration: number;
      count: number;
    }> = {};
    
    for (const result of exerciseResults) {
      if (!exerciseStats[result.exerciseId]) {
        exerciseStats[result.exerciseId] = {
          totalSets: 0,
          totalReps: 0,
          totalWeight: 0,
          totalDuration: 0,
          count: 0
        };
      }
      
      exerciseStats[result.exerciseId].totalSets += result.sets;
      exerciseStats[result.exerciseId].totalReps += result.reps;
      exerciseStats[result.exerciseId].totalWeight += result.weight || 0;
      exerciseStats[result.exerciseId].totalDuration += result.duration || 0;
      exerciseStats[result.exerciseId].count += 1;
    }
    
    // Get exercise details
    const exerciseIds = Object.keys(exerciseStats);
    const exercises = await prisma.exercise.findMany({
      where: {
        id: { in: exerciseIds },
        ...(category && { category }),
        ...(muscleGroup && { muscleGroup })
      }
    });
    
    // Combine exercise details with stats
    const exerciseDetails = exercises.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      muscleGroup: exercise.muscleGroup,
      stats: exerciseStats[exercise.id]
    }));
    
    // Generate report
    const report = {
      summary: {
        totalWorkouts,
        totalDuration,
        averageRating,
        startDate: dateFilter.gte || null,
        endDate: dateFilter.lte || null
      },
      workouts: completedWorkouts.map(workout => ({
        id: workout.id,
        completedAt: workout.completedAt,
        duration: workout.duration,
        rating: workout.rating,
        workoutPlanName: workout.scheduledWorkout.workoutPlan.name,
        exerciseCount: workout.exerciseResults.length
      })),
      exerciseDetails
    };
    
    return res.status(200).json(report);
  } catch (error) {
    console.error('Error generating workout report:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
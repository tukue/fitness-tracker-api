import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface CreateWorkoutPlanDto {
  name: string;
  description?: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    notes?: string;
  }[];
}

export interface ScheduleWorkoutDto {
  workoutPlanId: string;
  scheduledFor: Date;
}

export interface CompleteWorkoutDto {
  scheduledWorkoutId: string;
  notes?: string;
  rating?: number;
  duration?: number;
  exerciseResults: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    notes?: string;
  }[];
}

export interface WorkoutReportParams {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  muscleGroup?: string;
}
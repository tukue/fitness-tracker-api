import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAllExercises = async (req: Request, res: Response) => {
  try {
    const { category, muscleGroup } = req.query;
    
    const filters: any = {};
    
    if (category) {
      filters.category = category as string;
    }
    
    if (muscleGroup) {
      filters.muscleGroup = muscleGroup as string;
    }
    
    const exercises = await prisma.exercise.findMany({
      where: filters,
      orderBy: { name: 'asc' }
    });
    
    return res.status(200).json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getExerciseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const exercise = await prisma.exercise.findUnique({
      where: { id }
    });
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    return res.status(200).json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getExerciseCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.exercise.groupBy({
      by: ['category'],
      orderBy: {
        category: 'asc'
      }
    });
    
    return res.status(200).json(categories.map(c => c.category));
  } catch (error) {
    console.error('Error fetching exercise categories:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMuscleGroups = async (_req: Request, res: Response) => {
  try {
    const muscleGroups = await prisma.exercise.groupBy({
      by: ['muscleGroup'],
      where: {
        muscleGroup: {
          not: null
        }
      },
      orderBy: {
        muscleGroup: 'asc'
      }
    });
    
    return res.status(200).json(muscleGroups.map(m => m.muscleGroup));
  } catch (error) {
    console.error('Error fetching muscle groups:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
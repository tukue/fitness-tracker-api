import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function createSampleData() {
  try {
    console.log('Creating sample data...');
    
    // Create sample user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        password: hashedPassword,
        name: 'Sample User'
      }
    });
    
    console.log(`Created sample user: ${user.email}`);
    
    // Create sample workout plan
    const workoutPlan = await prisma.workoutPlan.create({
      data: {
        name: 'Full Body Workout',
        description: 'A complete full body workout targeting all major muscle groups',
        userId: user.id
      }
    });
    
    console.log(`Created sample workout plan: ${workoutPlan.name}`);
    
    // Get some exercises
    const exercises = await prisma.exercise.findMany({
      take: 5
    });
    
    // Add exercises to workout plan
    for (const exercise of exercises) {
      await prisma.workoutExercise.create({
        data: {
          workoutPlanId: workoutPlan.id,
          exerciseId: exercise.id,
          sets: 3,
          reps: 12,
          weight: exercise.category === 'Strength' ? 50 : null,
          duration: exercise.category === 'Cardio' ? 300 : null,
          notes: `Sample exercise: ${exercise.name}`
        }
      });
    }
    
    console.log(`Added ${exercises.length} exercises to workout plan`);
    
    // Create scheduled workout
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const scheduledWorkout = await prisma.scheduledWorkout.create({
      data: {
        workoutPlanId: workoutPlan.id,
        userId: user.id,
        scheduledFor: tomorrow
      }
    });
    
    console.log(`Created scheduled workout for: ${scheduledWorkout.scheduledFor}`);
    
    // Create completed workout
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const completedScheduledWorkout = await prisma.scheduledWorkout.create({
      data: {
        workoutPlanId: workoutPlan.id,
        userId: user.id,
        scheduledFor: yesterday,
        completed: true
      }
    });
    
    const completedWorkout = await prisma.completedWorkout.create({
      data: {
        scheduledWorkoutId: completedScheduledWorkout.id,
        userId: user.id,
        notes: 'Great workout!',
        rating: 5,
        duration: 45
      }
    });
    
    console.log(`Created completed workout: ${completedWorkout.id}`);
    
    // Add exercise results
    for (const exercise of exercises) {
      await prisma.exerciseResult.create({
        data: {
          completedWorkoutId: completedWorkout.id,
          exerciseId: exercise.id,
          sets: 3,
          reps: 12,
          weight: exercise.category === 'Strength' ? 50 : null,
          duration: exercise.category === 'Cardio' ? 300 : null
        }
      });
    }
    
    console.log(`Added ${exercises.length} exercise results to completed workout`);
    
    console.log('Sample data created successfully!');
    return {
      user: {
        email: user.email,
        password: 'password123'
      }
    };
  } catch (error) {
    console.error('Error creating sample data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createSampleData()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
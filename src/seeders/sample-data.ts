import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { exercises } from './exercises';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding with sample data...');
  
  // Create sample users
  console.log('Creating sample users...');
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      password: hashedPassword,
      name: 'John Doe'
    }
  });
  
  const user2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      password: hashedPassword,
      name: 'Jane Smith'
    }
  });
  
  console.log(`Created users: ${user1.name}, ${user2.name}`);
  
  // Seed exercises
  console.log(`Seeding ${exercises.length} exercises...`);
  
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: exercise,
      create: exercise
    });
  }
  
  // Create sample workout plans
  console.log('Creating sample workout plans...');
  
  const strengthPlan = await prisma.workoutPlan.create({
    data: {
      name: 'Full Body Strength',
      description: 'A comprehensive strength training program targeting all major muscle groups',
      userId: user1.id
    }
  });
  
  const cardioFitnessPlan = await prisma.workoutPlan.create({
    data: {
      name: 'Cardio Fitness',
      description: 'A cardio-focused workout plan to improve endurance and burn calories',
      userId: user1.id
    }
  });
  
  const upperBodyPlan = await prisma.workoutPlan.create({
    data: {
      name: 'Upper Body Focus',
      description: 'A workout plan focusing on chest, back, shoulders, and arms',
      userId: user2.id
    }
  });
  
  // Add exercises to workout plans
  console.log('Adding exercises to workout plans...');
  
  // Get exercise IDs
  const benchPress = await prisma.exercise.findUnique({ where: { name: 'Bench Press' } });
  const squat = await prisma.exercise.findUnique({ where: { name: 'Squat' } });
  const deadlift = await prisma.exercise.findUnique({ where: { name: 'Deadlift' } });
  const overheadPress = await prisma.exercise.findUnique({ where: { name: 'Overhead Press' } });
  const running = await prisma.exercise.findUnique({ where: { name: 'Running' } });
  const cycling = await prisma.exercise.findUnique({ where: { name: 'Cycling' } });
  const pullUp = await prisma.exercise.findUnique({ where: { name: 'Pull-Up' } });
  const bicepCurl = await prisma.exercise.findUnique({ where: { name: 'Bicep Curl' } });
  
  if (!benchPress || !squat || !deadlift || !overheadPress || !running || !cycling || !pullUp || !bicepCurl) {
    throw new Error('Failed to find one or more exercises');
  }
  
  // Add exercises to Full Body Strength plan
  await prisma.workoutExercise.createMany({
    data: [
      {
        workoutPlanId: strengthPlan.id,
        exerciseId: benchPress.id,
        sets: 3,
        reps: 10,
        weight: 135
      },
      {
        workoutPlanId: strengthPlan.id,
        exerciseId: squat.id,
        sets: 3,
        reps: 8,
        weight: 185
      },
      {
        workoutPlanId: strengthPlan.id,
        exerciseId: deadlift.id,
        sets: 3,
        reps: 5,
        weight: 225
      },
      {
        workoutPlanId: strengthPlan.id,
        exerciseId: overheadPress.id,
        sets: 3,
        reps: 8,
        weight: 95
      }
    ]
  });
  
  // Add exercises to Cardio Fitness plan
  await prisma.workoutExercise.createMany({
    data: [
      {
        workoutPlanId: cardioFitnessPlan.id,
        exerciseId: running.id,
        sets: 1,
        reps: 1,
        duration: 1800 // 30 minutes in seconds
      },
      {
        workoutPlanId: cardioFitnessPlan.id,
        exerciseId: cycling.id,
        sets: 1,
        reps: 1,
        duration: 1200 // 20 minutes in seconds
      }
    ]
  });
  
  // Add exercises to Upper Body Focus plan
  await prisma.workoutExercise.createMany({
    data: [
      {
        workoutPlanId: upperBodyPlan.id,
        exerciseId: benchPress.id,
        sets: 4,
        reps: 8,
        weight: 155
      },
      {
        workoutPlanId: upperBodyPlan.id,
        exerciseId: pullUp.id,
        sets: 3,
        reps: 8
      },
      {
        workoutPlanId: upperBodyPlan.id,
        exerciseId: overheadPress.id,
        sets: 3,
        reps: 10,
        weight: 85
      },
      {
        workoutPlanId: upperBodyPlan.id,
        exerciseId: bicepCurl.id,
        sets: 3,
        reps: 12,
        weight: 30
      }
    ]
  });
  
  // Create scheduled workouts
  console.log('Creating scheduled workouts...');
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  await prisma.scheduledWorkout.create({
    data: {
      workoutPlanId: strengthPlan.id,
      userId: user1.id,
      scheduledFor: tomorrow,
      completed: false
    }
  });
  
  await prisma.scheduledWorkout.create({
    data: {
      workoutPlanId: cardioFitnessPlan.id,
      userId: user1.id,
      scheduledFor: nextWeek,
      completed: false
    }
  });
  
  const yesterdayWorkout = await prisma.scheduledWorkout.create({
    data: {
      workoutPlanId: upperBodyPlan.id,
      userId: user2.id,
      scheduledFor: new Date(today.setDate(today.getDate() - 1)),
      completed: true
    }
  });
  
  // Create completed workout
  console.log('Creating completed workout records...');
  
  const completedWorkout = await prisma.completedWorkout.create({
    data: {
      scheduledWorkoutId: yesterdayWorkout.id,
      userId: user2.id,
      notes: 'Felt great! Increased weight on bench press.',
      rating: 5,
      duration: 45, // 45 minutes
      exerciseResults: {
        create: [
          {
            exerciseId: benchPress.id,
            sets: 4,
            reps: 8,
            weight: 160,
            notes: 'Increased weight by 5 pounds'
          },
          {
            exerciseId: pullUp.id,
            sets: 3,
            reps: 10,
            notes: 'Added 2 extra reps on last set'
          },
          {
            exerciseId: overheadPress.id,
            sets: 3,
            reps: 10,
            weight: 85
          },
          {
            exerciseId: bicepCurl.id,
            sets: 3,
            reps: 12,
            weight: 30
          }
        ]
      }
    }
  });
  
  console.log('Database seeding with sample data completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
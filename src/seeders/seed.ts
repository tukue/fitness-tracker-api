import { PrismaClient } from '@prisma/client';
import { exercises } from './exercises';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');
  
  // Seed exercises
  console.log(`Seeding ${exercises.length} exercises...`);
  
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: exercise,
      create: exercise
    });
  }
  
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
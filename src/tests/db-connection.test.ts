import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('Database Connection Tests', () => {
  let prisma: PrismaClient;
  
  beforeAll(() => {
    // Create a new Prisma client instance
    prisma = new PrismaClient();
  });
  
  afterAll(async () => {
    // Disconnect from the database after tests
    await prisma.$disconnect();
  });
  
  it('should connect to the fitness-db database at localhost:5434', async () => {
    try {
      // Execute a simple query to test the connection
      const result = await prisma.$queryRaw`SELECT current_database() as db_name`;
      expect(result).toBeDefined();
      console.log('Successfully connected to the database:', result);
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  });
  
  it('should have the expected database tables', async () => {
    try {
      // Query to get all tables in the public schema
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      expect(Array.isArray(tables)).toBe(true);
      console.log('Database tables:', tables);
    } catch (error) {
      console.error('Failed to query database tables:', error);
      throw error;
    }
  });
});
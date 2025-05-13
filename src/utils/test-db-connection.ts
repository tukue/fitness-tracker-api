import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Simple utility to test database connection
 */
async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Attempting to connect to database...');
    console.log(`Connection string: ${process.env.DATABASE_URL}`);
    
    // Test connection with a simple query
    const result = await prisma.$queryRaw`SELECT current_database() as db_name`;
    console.log('Connection successful!');
    console.log('Connected to database:', result);
    
    // Get database tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Database tables:', tables);
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if this file is run directly
if (require.main === module) {
  testConnection()
    .then(success => {
      if (success) {
        console.log('Database connection test completed successfully');
      } else {
        console.error('Database connection test failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

export default testConnection;
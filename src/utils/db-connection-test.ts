import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Simple utility to test database connection to fitness-db
 */
async function testDatabaseConnection() {
  console.log('Testing connection to PostgreSQL database...');
  
  // Mask password in connection string for logging
  const connectionUrl = process.env.DATABASE_URL || '';
  const maskedUrl = connectionUrl.replace(/\/\/([^:]+):([^@]+)@/, '//\\1:****@');
  console.log(`Connection URL: ${maskedUrl}`);
  
  const prisma = new PrismaClient();
  
  try {
    // Test connection with a simple query
    const result = await prisma.$queryRaw`SELECT current_database() as db_name, current_user as user_name`;
    console.log('✅ Connection successful!');
    console.log('Database info:', result);
    
    // Get database tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('\nDatabase tables:');
    if (Array.isArray(tables) && tables.length > 0) {
      tables.forEach((table: any) => {
        console.log(`- ${table.table_name}`);
      });
    } else {
      console.log('No tables found in the public schema');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
    console.log('\nDatabase connection closed');
  }
}

// Execute if this file is run directly
if (require.main === module) {
  testDatabaseConnection()
    .then(success => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

export default testDatabaseConnection;
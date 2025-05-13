import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { setupSwagger } from './utils/swagger';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup Swagger
setupSwagger(app);

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root route with database data
app.get('/', async (_req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Define types for our database entities
    type Exercise = {
      id: string;
      name: string;
      description: string;
      category: string;
      muscleGroup: string | null;
    };
    
    type WorkoutPlan = {
      id: string;
      name: string;
      description: string | null;
      user: {
        name: string;
      };
    };
    
    // Fetch data from database
    const exercises = await prisma.exercise.findMany({ take: 10 }) as Exercise[];
    const workoutPlans = await prisma.workoutPlan.findMany({ 
      take: 5,
      include: { user: { select: { name: true } } }
    }) as WorkoutPlan[];
    const userCount = await prisma.user.count();
    
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Workout Tracker API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
          }
          h1, h2, h3 {
            color: #2c3e50;
          }
          h1 {
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
          }
          .card {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #3498db;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .data-section {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
          }
          .data-card {
            flex: 1;
            min-width: 300px;
            background-color: white;
            border-radius: 5px;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
          .stats {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
          }
          .stat-card {
            flex: 1;
            background-color: #3498db;
            color: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
          }
          a {
            color: #3498db;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <h1>Workout Tracker API Dashboard</h1>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">${userCount}</div>
            <div>Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${exercises.length}</div>
            <div>Exercises Shown</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${workoutPlans.length}</div>
            <div>Workout Plans Shown</div>
          </div>
        </div>
        
        <div class="card">
          <h2>API Documentation</h2>
          <p>Explore the API using the interactive Swagger documentation:</p>
          <p><a href="/api-docs" target="_blank">Open API Documentation</a></p>
        </div>
        
        <h2>Database Data Preview</h2>
        
        <div class="data-section">
          <div class="data-card">
            <h3>Exercises</h3>
            <table>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Muscle Group</th>
              </tr>
              ${exercises.map((ex: Exercise) => `
                <tr>
                  <td>${ex.name}</td>
                  <td>${ex.category}</td>
                  <td>${ex.muscleGroup || 'N/A'}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          <div class="data-card">
            <h3>Workout Plans</h3>
            <table>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created By</th>
              </tr>
              ${workoutPlans.map((plan: WorkoutPlan) => `
                <tr>
                  <td>${plan.name}</td>
                  <td>${plan.description || 'N/A'}</td>
                  <td>${plan.user.name}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        </div>
        
        <div class="card">
          <h3>Available API Endpoints</h3>
          <ul>
            <li><strong>/api/auth</strong> - Authentication endpoints</li>
            <li><strong>/api/exercises</strong> - Exercise management</li>
            <li><strong>/api/workouts</strong> - Workout plans</li>
            <li><strong>/api/schedule</strong> - Scheduled workouts</li>
            <li><strong>/api/reports</strong> - Workout reports and statistics</li>
          </ul>
        </div>
      </body>
      </html>
    `);
    
    await prisma.$disconnect();
  } catch (error: unknown) {
    console.error('Error fetching data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Error loading data</h1>
          <p>Could not load data from the database. Please check your database connection.</p>
          <p>Error details: ${errorMessage}</p>
        </body>
      </html>
    `);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});
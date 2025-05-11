# Workout Tracker API

A RESTful API for a workout tracker application that allows users to sign up, log in, create workout plans, and track their progress.

## Features

- User authentication with JWT
- Exercise management
- Workout plan creation and management
- Workout scheduling
- Workout completion tracking
- Progress reporting

## Tech Stack

- Node.js with Express
- TypeScript
- PostgreSQL database
- Prisma ORM
- JWT for authentication
- Jest for testing

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env` (if not already done)
   - Update the `DATABASE_URL` with your PostgreSQL connection string
   - Set a secure `JWT_SECRET`

4. Run the setup script to initialize the database and start the server:
   ```
   node setup-and-run.js
   ```

   This script will:
   - Create database migrations
   - Seed the database with exercise data
   - Build the TypeScript code
   - Start the server

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Exercises

- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/:id` - Get exercise by ID
- `GET /api/exercises/categories` - Get all exercise categories
- `GET /api/exercises/muscle-groups` - Get all muscle groups

### Workout Plans

- `POST /api/workouts` - Create a new workout plan
- `GET /api/workouts` - Get all workout plans for the authenticated user
- `GET /api/workouts/:id` - Get workout plan by ID
- `PUT /api/workouts/:id` - Update workout plan
- `DELETE /api/workouts/:id` - Delete workout plan

### Workout Scheduling

- `POST /api/schedule` - Schedule a workout
- `GET /api/schedule` - Get scheduled workouts
- `POST /api/schedule/complete` - Mark a workout as completed
- `GET /api/schedule/completed` - Get completed workouts

### Reports

- `GET /api/reports` - Generate workout reports

## Testing

Run tests with:

```
npm test
```

## API Documentation

API documentation is available using OpenAPI Specification. After starting the server, you can access the documentation at:

```
http://localhost:3000/api-docs
```

## License

This project is licensed under the MIT License.
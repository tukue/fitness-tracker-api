# Workout Tracker API Implementation Diagram

## System Architecture

```mermaid
graph TD
    Client[Client Application] <--> API[Express API Server]
    API <--> DB[(PostgreSQL Database)]
    
    subgraph "API Server Components"
        Routes[Routes Layer] --> Controllers[Controllers Layer]
        Controllers --> Prisma[Prisma Client]
        Prisma --> DB
        Middleware[Auth Middleware] --> Controllers
    end
```

## Workout Plan Management Flow

```mermaid
sequenceDiagram
    participant Client
    participant Router as Express Router
    participant Auth as Auth Middleware
    participant Controller as Workout Controller
    participant Prisma as Prisma Client
    participant DB as PostgreSQL

    %% Create Workout Plan
    Client->>Router: POST /api/workouts
    Router->>Auth: Authenticate request
    Auth->>Controller: Forward authenticated request
    Controller->>Prisma: Create workout plan transaction
    Prisma->>DB: Begin transaction
    Prisma->>DB: Create workout plan
    Prisma->>DB: Create workout exercises
    Prisma->>DB: Commit transaction
    Controller->>Prisma: Fetch complete workout plan
    Prisma->>DB: Query workout plan with exercises
    DB->>Prisma: Return workout plan data
    Prisma->>Controller: Return workout plan object
    Controller->>Client: Return 201 with workout plan

    %% Get Workout Plans
    Client->>Router: GET /api/workouts
    Router->>Auth: Authenticate request
    Auth->>Controller: Forward authenticated request
    Controller->>Prisma: Find user's workout plans
    Prisma->>DB: Query workout plans
    DB->>Prisma: Return workout plans data
    Prisma->>Controller: Return workout plans array
    Controller->>Client: Return 200 with workout plans

    %% Update Workout Plan
    Client->>Router: PUT /api/workouts/:id
    Router->>Auth: Authenticate request
    Auth->>Controller: Forward authenticated request
    Controller->>Prisma: Check if plan exists
    Prisma->>DB: Query workout plan
    DB->>Prisma: Return workout plan data
    Prisma->>Controller: Return workout plan object
    Controller->>Prisma: Update workout plan transaction
    Prisma->>DB: Begin transaction
    Prisma->>DB: Update workout plan
    Prisma->>DB: Delete existing exercises
    Prisma->>DB: Create new exercises
    Prisma->>DB: Commit transaction
    Controller->>Prisma: Fetch updated workout plan
    Prisma->>DB: Query updated workout plan
    DB->>Prisma: Return updated data
    Prisma->>Controller: Return updated object
    Controller->>Client: Return 200 with updated plan

    %% Delete Workout Plan
    Client->>Router: DELETE /api/workouts/:id
    Router->>Auth: Authenticate request
    Auth->>Controller: Forward authenticated request
    Controller->>Prisma: Check if plan exists
    Prisma->>DB: Query workout plan
    DB->>Prisma: Return workout plan data
    Prisma->>Controller: Return workout plan object
    Controller->>Prisma: Delete workout plan
    Prisma->>DB: Delete workout plan (cascade)
    Controller->>Client: Return 200 success message
```

## Data Model Relationships

```mermaid
erDiagram
    User {
        string id PK
        string email
        string password
        string name
        datetime createdAt
        datetime updatedAt
    }
    
    Exercise {
        string id PK
        string name
        string description
        string category
        string muscleGroup
        datetime createdAt
        datetime updatedAt
    }
    
    WorkoutPlan {
        string id PK
        string name
        string description
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    WorkoutExercise {
        string id PK
        string workoutPlanId FK
        string exerciseId FK
        int sets
        int reps
        float weight
        int duration
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    ScheduledWorkout {
        string id PK
        string workoutPlanId FK
        string userId FK
        datetime scheduledFor
        boolean completed
        datetime createdAt
        datetime updatedAt
    }
    
    CompletedWorkout {
        string id PK
        string scheduledWorkoutId FK
        string userId FK
        datetime completedAt
        string notes
        int rating
        int duration
        datetime createdAt
        datetime updatedAt
    }
    
    ExerciseResult {
        string id PK
        string completedWorkoutId FK
        string exerciseId
        int sets
        int reps
        float weight
        int duration
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    User ||--o{ WorkoutPlan : creates
    User ||--o{ ScheduledWorkout : schedules
    User ||--o{ CompletedWorkout : completes
    
    WorkoutPlan ||--o{ WorkoutExercise : contains
    WorkoutPlan ||--o{ ScheduledWorkout : scheduled
    
    Exercise ||--o{ WorkoutExercise : included_in
    
    ScheduledWorkout ||--o| CompletedWorkout : completed_as
    CompletedWorkout ||--o{ ExerciseResult : records
```

## Workout Controller Implementation

```mermaid
classDiagram
    class WorkoutController {
        +createWorkoutPlan(req: AuthRequest, res: Response)
        +getWorkoutPlans(req: AuthRequest, res: Response)
        +getWorkoutPlanById(req: AuthRequest, res: Response)
        +updateWorkoutPlan(req: AuthRequest, res: Response)
        +deleteWorkoutPlan(req: AuthRequest, res: Response)
    }
    
    class PrismaClient {
        +workoutPlan: WorkoutPlanDelegate
        +workoutExercise: WorkoutExerciseDelegate
        +$transaction(fn: Function)
    }
    
    class AuthRequest {
        +user?: {id: string, email: string}
        +body: any
        +params: any
    }
    
    class CreateWorkoutPlanDto {
        +name: string
        +description?: string
        +exercises: WorkoutExerciseDto[]
    }
    
    class WorkoutExerciseDto {
        +exerciseId: string
        +sets: number
        +reps: number
        +weight?: number
        +duration?: number
        +notes?: string
    }
    
    WorkoutController --> PrismaClient : uses
    WorkoutController --> AuthRequest : processes
    WorkoutController --> CreateWorkoutPlanDto : validates
```

## API Endpoints

| Method | Endpoint         | Description                | Authentication | Request Body            | Response                   |
|--------|------------------|----------------------------|----------------|-------------------------|----------------------------|
| POST   | /api/workouts    | Create a new workout plan  | Required       | CreateWorkoutPlanDto    | 201 Created + Workout Plan |
| GET    | /api/workouts    | Get all user workout plans | Required       | -                       | 200 OK + Workout Plans     |
| GET    | /api/workouts/:id| Get workout plan by ID     | Required       | -                       | 200 OK + Workout Plan      |
| PUT    | /api/workouts/:id| Update workout plan        | Required       | CreateWorkoutPlanDto    | 200 OK + Updated Plan      |
| DELETE | /api/workouts/:id| Delete workout plan        | Required       | -                       | 200 OK + Success message   |
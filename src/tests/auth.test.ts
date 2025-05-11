import request from 'supertest';
import express from 'express';
import routes from '../routes';
import prisma from '../utils/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api', routes);

// Mock Prisma client
jest.mock('../utils/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  },
  $disconnect: jest.fn()
}));

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock user not found (for uniqueness check)
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      
      // Mock user creation
      (prisma.user.create as jest.Mock).mockResolvedValueOnce({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', '1');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('name', 'Test User');
    });

    it('should return 400 if user already exists', async () => {
      // Mock user found (already exists)
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: 'existing@example.com',
        name: 'Existing User'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists with this email');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user and return a token', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: await bcrypt.hash('password123', 10),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock user found
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', '1');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('name', 'Test User');
    });

    it('should return 401 if user not found', async () => {
      // Mock user not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 401 if password is incorrect', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: await bcrypt.hash('correctpassword', 10),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock user found
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});
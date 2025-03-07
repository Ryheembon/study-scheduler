const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server'); // We'll need to modify server.js to export the app

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Task API', () => {
  test('POST /api/tasks - should create new task', async () => {
    const newTask = {
      title: 'Test Task',
      description: 'Test Description',
      dueDate: '2024-12-31',
      category: 'homework',
      priority: 'high'
    };

    const response = await request(app)
      .post('/api/tasks')
      .send(newTask)
      .expect(201);

    expect(response.body.title).toBe(newTask.title);
    expect(response.body.description).toBe(newTask.description);
  });

  test('GET /api/tasks - should return all tasks', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test('PUT /api/tasks/:id - should update task', async () => {
    // First create a task
    const newTask = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Update Test',
        description: 'To be updated',
        dueDate: '2024-12-31',
        category: 'homework',
        priority: 'low'
      });

    // Then update it
    const response = await request(app)
      .put(`/api/tasks/${newTask.body._id}`)
      .send({ status: 'completed' })
      .expect(200);

    expect(response.body.status).toBe('completed');
  });

  test('DELETE /api/tasks/:id - should delete task', async () => {
    // First create a task
    const newTask = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Delete Test',
        description: 'To be deleted',
        dueDate: '2024-12-31',
        category: 'homework',
        priority: 'low'
      });

    // Then delete it
    await request(app)
      .delete(`/api/tasks/${newTask.body._id}`)
      .expect(204);

    // Verify it's deleted
    const response = await request(app)
      .get(`/api/tasks/${newTask.body._id}`);
    expect(response.status).toBe(404);
  });
});

describe('Task API Error Handling', () => {
  test('POST /api/tasks - should handle invalid data', async () => {
    const invalidTask = {
      title: '',
      priority: 'invalid'
    };

    const response = await request(app)
      .post('/api/tasks')
      .send(invalidTask)
      .expect(400);

    expect(response.body.error).toBeDefined();
  });
}); 
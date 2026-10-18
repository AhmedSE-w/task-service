const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const Client = require('../src/dal/models/client.model');
const {hashApiKey} = require('../src/middlewares/auth.middleware');

const headers = {'x-api-key': 'test-key', 'x-user-id': 'sara'};

beforeAll(async () => {
  await Client.create({name: 'Test client', api_key_hash: hashApiKey('test-key')});
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /v1/tasks', () => {
  it('returns 401 without an api key', async () => {
    const res = await request(app).post('/v1/tasks').send({title: 'No key'});

    expect(res.status).toBe(401);
  });

  it('create a task', async () => {
    const res = await request(app)
    .post('/v1/tasks')
    .set(headers)
    .send({task_type: 'verify_poi', title: 'Test task', target_kind: 'item', item_type: 'poi', item_id: '1'});

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test task');
  });

  it('returns 400 when item_id is missing', async () => {
    const res = await request(app)
    .post('/v1/tasks')
    .set(headers)
    .send({task_type: 'verify_poi', title: 'Test task', target_kind: 'item', item_type: 'poi'});

    expect(res.status).toBe(400);
  });
});

describe('GET /v1/tasks/:id', () => {
  it('returns 404 for a task that dose not exist', async () => {
    const res = await request(app)
    .get('/v1/tasks/00000000-0000-0000-0000-000000000000')
    .set(headers);

    expect(res.status).toBe(404);

    
  });

it('returns a task by id', async () => {
      const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({task_type: 'verify_poi', title: 'Find me', target_kind: 'item', item_type: 'poi', item_id: '2'});

      const res = await request(app)
      .get(`/v1/tasks/${created.body.id}`)
      .set(headers);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Find me');
    });
});
describe('PATCH /v1/tasks/:id', () => {
  it('update the priority', async () => {
    const created = await request(app)
    .post('/v1/tasks')
    .set(headers)
    .send({task_type: 'verify_poi', title: 'Edit me', target_kind: 'item', item_type: 'poi', item_id: '3'});
    
    const res = await request(app)
    .patch(`/v1/tasks/${created.body.id}`)
    .set(headers)
    .send({priority: 'high'});
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe('high');
      });
    });

    it('record the events of a task', async () => {
      const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({task_type: 'verify_poi', title: 'History', target_kind: 'item', item_type: 'poi', item_id: '4'});

      await request(app)
      .patch(`/v1/tasks/${created.body.id}`)
      .set(headers)
      .send({priority: 'high'});

      const res = await request(app)
      .get(`/v1/tasks/${created.body.id}/events`)
      .set(headers);

      expect(res.status).toBe(200)
      expect(res.body.map((event) => event.type)).toEqual(['created', 'priority_changed']);
    });
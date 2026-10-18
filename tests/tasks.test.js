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
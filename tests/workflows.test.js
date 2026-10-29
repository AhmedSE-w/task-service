const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const Client = require('../src/dal/models/client.model');
const {hashApiKey} = require('../src/middlewares/auth.middleware');

const headers = {'x-api-key': 'workflow-test-key', 'x-user-id': 'ahmed', 'x-user-role': 'admin'};

beforeAll(async () => {
  await Client.create({name: 'Test client', api_key_hash: hashApiKey('workflow-test-key')});
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /v1/workflows', () => {
  it('creates a workflow', async () => {
    const res = await request(app)
      .post('/v1/workflows')
      .set(headers)
      .send({
        name: 'Review only',
        statuses: ['in_review', 'done'],
        transitions: [{from: 'in_review', to: 'done', by: ['reviewer']}],
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Review only');
  });

  it('refuses a manager', async () => {
    const res = await request(app)
      .post('/v1/workflows')
      .set({...headers, 'x-user-role': 'manager'})
      .send({
        name: 'Not allowed',
        statuses: ['in_review', 'done'],
        transitions: [{from: 'in_review', to: 'done', by: ['reviewer']}],
      });

    expect(res.status).toBe(403);
  });
});

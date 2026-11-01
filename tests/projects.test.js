const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const Client = require('../src/dal/models/client.model');
const {hashApiKey} = require('../src/middlewares/auth.middleware');

const headers = {'x-api-key': 'project-test-key', 'x-user-id': 'ahmed', 'x-user-role': 'manager'};

beforeAll(async () => {
  await Client.create({name: 'Test client', api_key_hash: hashApiKey('project-test-key')});
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /v1/projects', () => {
  it('lets a manager create a project', async () => {
    const res = await request(app)
      .post('/v1/projects')
      .set(headers)
      .send({name: 'Riyadh pharmacies'});

    expect(res.status).toBe(201);
    expect(res.body.owner_id).toBe('ahmed');
  });

  it('refuses a worker', async () => {
    const res = await request(app)
      .post('/v1/projects')
      .set({...headers, 'x-user-role': 'worker'})
      .send({name: 'Not allowed'});

    expect(res.status).toBe(403);
  });
});

describe('GET /v1/projects', () => {
  it('lists the projects of the client', async () => {
    const res = await request(app).get('/v1/projects').set(headers);

    expect(res.status).toBe(200);
    expect(res.body.map((project) => project.name)).toContain('Riyadh pharmacies');
  });
});

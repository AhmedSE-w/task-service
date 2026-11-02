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

describe('GET /v1/projects/:id', () => {
  it('returns the project with progress counts', async () => {
    const project = await request(app).post('/v1/projects').set(headers).send({
      name: 'Counted',
    });
    const task = {
      task_type: 'verify_poi',
      title: 'In project',
      target_kind: 'item',
      item_type: 'poi',
      project_id: project.body.id,
    };
    await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({...task, item_id: '1'});
    await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({...task, item_id: '2'});

    const res = await request(app).get(`/v1/projects/${project.body.id}`).set(headers);

    expect(res.status).toBe(200);
    expect(res.body.progress).toEqual({to_do: 2});
  });
});

describe('PATCH /v1/projects/:id', () => {
  it('lets a manager close a project', async () => {
    const project = await request(app).post('/v1/projects').set(headers).send({name: 'Close me'});

    const res = await request(app)
      .patch(`/v1/projects/${project.body.id}`)
      .set(headers)
      .send({status: 'closed'});

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('closed');
  });
});

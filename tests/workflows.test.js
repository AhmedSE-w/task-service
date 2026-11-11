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

describe('a task in a chosen workflow', () => {
  it('starts in the first status and follows its moves', async () => {
    const workflow = await request(app)
      .post('/v1/workflows')
      .set(headers)
      .send({
        name: 'Quick review',
        statuses: ['new', 'closed'],
        transitions: [{from: 'new', to: 'closed', by: ['assignee']}],
      });

    const task = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'quick_check',
        title: 'Check once',
        assignee_id: 'ahmed',
        workflow_id: workflow.body.id,
        target: {kind: 'item', items: [{type: 'place', id: '1'}]},
      });
    expect(task.body.status).toBe('new');

    const moved = await request(app)
      .post(`/v1/tasks/${task.body.id}/transition`)
      .set(headers)
      .send({to: 'closed'});
    expect(moved.body.status).toBe('closed');
  });
  it('refuses a workflow the client does not have', async () => {
    const res = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'quick_check',
        title: 'No such workflow',
        workflow_id: '00000000-0000-0000-0000-000000000000',
        target: {kind: 'item', items: [{type: 'place', id: '2'}]},
      });
    expect(res.status).toBe(400);
  });
});

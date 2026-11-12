const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const Client = require('../src/dal/models/client.model');
const {hashApiKey} = require('../src/middlewares/auth.middleware');

const headers = {'x-api-key': 'test-key', 'x-user-id': 'ahmed', 'x-user-role': 'manager'};

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

  it('refuses a worker creating a task', async () => {
    const res = await request(app)
      .post('/v1/tasks')
      .set({...headers, 'x-user-role': 'worker'})
      .send({
        task_type: 'verify_poi',
        title: 'Not allowed',
        target: {kind: 'item', items: [{type: 'poi', id: '1'}]},
      });

    expect(res.status).toBe(403);
  });

  it('returns 400 for an unknown role', async () => {
    const res = await request(app)
      .get('/v1/tasks')
      .set({...headers, 'x-user-role': 'apple'});

    expect(res.status).toBe(400);
  });

  it('creates a task', async () => {
    const res = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Test task',
        target: {kind: 'item', items: [{type: 'poi', id: '1'}]},
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test task');
    expect(res.body.workflow_id).toBeDefined();
    expect(res.body.item_id).toBe('1');
  });

  it('returns 400 for an item task with two items', async () => {
    const res = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Test task',
        target: {
          kind: 'item',
          items: [
            {type: 'poi', id: '1'},
            {type: 'poi', id: '2'},
          ],
        },
      });

    expect(res.status).toBe(400);
  });

  it('creates a batch task with its items', async () => {
    const res = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'cr_review',
        title: 'Review CRs from scrape run 812',
        target: {
          kind: 'batch',
          items: [
            {type: 'cr', id: '9876'},
            {type: 'cr', id: '9877'},
          ],
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.target_kind).toBe('batch');
    expect(res.body.items.map((item) => item.item_id)).toEqual(['9876', '9877']);
    expect(res.body.items.map((item) => item.decision)).toEqual(['pending', 'pending']);
  });
});

describe('GET /v1/tasks/:id', () => {
  it('returns 404 for a task that does not exist', async () => {
    const res = await request(app)
      .get('/v1/tasks/00000000-0000-0000-0000-000000000000')
      .set(headers);

    expect(res.status).toBe(404);
  });

  it('returns a task by id', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Find me',
        target: {kind: 'item', items: [{type: 'poi', id: '2'}]},
      });

    const res = await request(app).get(`/v1/tasks/${created.body.id}`).set(headers);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Find me');
  });

  it('returns a batch task with its items', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'cr_review',
        title: 'Show my items',
        target: {
          kind: 'batch',
          items: [
            {type: 'cr', id: 's1'},
            {type: 'cr', id: 's2'},
          ],
        },
      });

    const res = await request(app).get(`/v1/tasks/${created.body.id}`).set(headers);

    expect(res.status).toBe(200);
    expect(res.body.items.map((item) => item.item_id)).toEqual(['s1', 's2']);
  });

  it('returns 400 for an id that is not a uuid', async () => {
    const res = await request(app).get('/v1/tasks/not-a-uuid').set(headers);

    expect(res.status).toBe(400);
  });
  it("hides other people's tasks from a worker", async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Hisham only',
        target: {kind: 'item', items: [{type: 'poi', id: '40'}]},
        assignee_id: 'hisham',
      });
    const worker = {...headers, 'x-user-role': 'worker'};
    const url = `/v1/tasks/${created.body.id}`;

    expect((await request(app).get(url).set(worker)).status).toBe(404);
    expect((await request(app).get(`${url}/events`).set(worker)).status).toBe(404);
    expect((await request(app).get(`${url}/comments`).set(worker)).status).toBe(404);
  });
  it('shows a task to the worker who reviews it', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Review me',
        assignee_id: 'hisham',
        reviewer_id: 'sara',
        target: {kind: 'item', items: [{type: 'reviewer_test', id: '1'}]},
      });
    const sara = {...headers, 'x-user-id': 'sara', 'x-user-role': 'worker'};

    const one = await request(app).get(`/v1/tasks/${created.body.id}`).set(sara);
    const list = await request(app).get('/v1/tasks?item_type=reviewer_test').set(sara);

    expect(one.status).toBe(200);
    expect(list.body.map((t) => t.title)).toEqual(['Review me']);
  });
});
describe('PATCH /v1/tasks/:id', () => {
  it('updates the priority', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Edit me',
        target: {kind: 'item', items: [{type: 'poi', id: '3'}]},
      });

    const res = await request(app)
      .patch(`/v1/tasks/${created.body.id}`)
      .set(headers)
      .send({priority: 'high'});
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe('high');
  });
  it('refuses a worker editing a task', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Not yours to edit',
        assignee_id: 'ahmed',
        target: {kind: 'item', items: [{type: 'poi', id: '4'}]},
      });

    const res = await request(app)
      .patch(`/v1/tasks/${created.body.id}`)
      .set({...headers, 'x-user-role': 'worker'})
      .send({priority: 'high'});

    expect(res.status).toBe(403);
  });

  it('records the events of a task', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'History',
        target: {kind: 'item', items: [{type: 'poi', id: '4'}]},
      });

    await request(app).patch(`/v1/tasks/${created.body.id}`).set(headers).send({priority: 'high'});

    const res = await request(app).get(`/v1/tasks/${created.body.id}/events`).set(headers);

    expect(res.status).toBe(200);
    expect(res.body.map((event) => event.type)).toEqual(['task.created', 'task.priority_changed']);
  });
});

describe('POST /v1/tasks/:id/comments', () => {
  it('adds and lists comments', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Comments',
        target: {kind: 'item', items: [{type: 'poi', id: '5'}]},
      });

    await request(app)
      .post(`/v1/tasks/${created.body.id}/comments`)
      .set(headers)
      .send({body: 'Check the map'});

    const res = await request(app).get(`/v1/tasks/${created.body.id}/comments`).set(headers);

    expect(res.status).toBe(200);
    expect(res.body.map((comment) => comment.body)).toEqual(['Check the map']);
  });
});

describe('GET /v1/tasks', () => {
  it('filters tasks by item_id', async () => {
    await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Filter me',
        target: {kind: 'item', items: [{type: 'poi', id: '999'}]},
      });

    const res = await request(app).get('/v1/tasks?item_id=999').set(headers);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].item_id).toBe('999');
  });
  it('shows a worker only thier own tasks', async () => {
    const task = {
      task_type: 'verify_poi',
      title: 'Mine or not',
    };
    await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        ...task,
        target: {kind: 'item', items: [{type: 'worker_test', id: '1'}]},
        assignee_id: 'ahmed',
      });
    await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        ...task,
        target: {kind: 'item', items: [{type: 'worker_test', id: '2'}]},
        assignee_id: 'hisham',
      });

    const res = await request(app)
      .get('/v1/tasks?item_type=worker_test&assignee_id=hisham')
      .set({...headers, 'x-user-role': 'worker'});

    expect(res.status).toBe(200);
    expect(res.body.map((t) => t.assignee_id)).toEqual([]);
  });
});

describe('POST /v1/tasks/:id/transition', () => {
  it('lets the task assignee start a task', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Move me',
        target: {kind: 'item', items: [{type: 'poi', id: '10'}]},
        assignee_id: 'ahmed',
      });

    const res = await request(app)
      .post(`/v1/tasks/${created.body.id}/transition`)
      .set(headers)
      .send({to: 'in_progress'});

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_progress');
  });

  it('refuses a move the workflow does not allow', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Skip ahead',
        target: {kind: 'item', items: [{type: 'poi', id: '11'}]},
        assignee_id: 'ahmed',
      });

    const res = await request(app)
      .post(`/v1/tasks/${created.body.id}/transition`)
      .set(headers)
      .send({to: 'done'});

    expect(res.status).toBe(400);
  });

  it('refuses a user who is not the assignee', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Not mine',
        target: {kind: 'item', items: [{type: 'poi', id: '12'}]},
        assignee_id: 'hisham',
      });

    const res = await request(app)
      .post(`/v1/tasks/${created.body.id}/transition`)
      .set(headers)
      .send({to: 'in_progress'});

    expect(res.status).toBe(403);
  });

  it('refuses the assignee approving their own task', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Self review',
        target: {kind: 'item', items: [{type: 'poi', id: '30'}]},
        assignee_id: 'ahmed',
        reviewer_id: 'ahmed',
      });

    const url = `/v1/tasks/${created.body.id}/transition`;

    await request(app).post(url).set(headers).send({to: 'in_progress'});
    await request(app).post(url).set(headers).send({to: 'in_review'});
    const res = await request(app).post(url).set(headers).send({to: 'done'});

    expect(res.status).toBe(403);
  });

  it('lets a manager approve a task', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Manager approves',
        target: {kind: 'item', items: [{type: 'poi', id: '50'}]},
        assignee_id: 'hisham',
        reviewer_id: 'faisal',
      });
    const url = `/v1/tasks/${created.body.id}/transition`;
    const hisham = {...headers, 'x-user-id': 'hisham', 'x-user-role': 'worker'};

    await request(app).post(url).set(hisham).send({to: 'in_progress'});
    await request(app).post(url).set(hisham).send({to: 'in_review'});
    const res = await request(app).post(url).set(headers).send({to: 'done'});

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
  });

  it('requires a reason to reject a task', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Reject me',
        target: {kind: 'item', items: [{type: 'poi', id: '60'}]},
        assignee_id: 'hisham',
      });
    const url = `/v1/tasks/${created.body.id}`;
    const hisham = {...headers, 'x-user-id': 'hisham', 'x-user-role': 'worker'};

    await request(app).post(`${url}/transition`).set(hisham).send({to: 'in_progress'});
    await request(app).post(`${url}/transition`).set(hisham).send({to: 'in_review'});

    const noReason = await request(app)
      .post(`${url}/transition`)
      .set(headers)
      .send({to: 'in+progress'});
    expect(noReason.status).toBe(400);

    const withReason = await request(app)
      .post(`${url}/transition`)
      .set(headers)
      .send({to: 'in_progress', reason: 'The location is wrong'});
    expect(withReason.status).toBe(200);

    const comments = await request(app).get(`${url}/comments`).set(headers);
    expect(comments.body.map((c) => c.body)).toEqual(['The location is wrong']);
  });
});

describe('POST /v1/tasks/:id/assign', () => {
  it('lets a manager assign a task', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Assign me',
        target: {kind: 'item', items: [{type: 'poi', id: '20'}]},
      });
    const res = await request(app)
      .post(`/v1/tasks/${created.body.id}/assign`)
      .set(headers)
      .send({assignee_id: 'hisham'});

    expect(res.status).toBe(200);
    expect(res.body.assignee_id).toBe('hisham');
  });

  it('refuses a worker to assign', async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'verify_poi',
        title: 'Not my call',
        target: {kind: 'item', items: [{type: 'poi', id: '21'}]},
      });

    const res = await request(app)
      .post(`/v1/tasks/${created.body.id}/assign`)
      .set({...headers, 'x-user-role': 'worker'})
      .send({assignee_id: 'hisham'});

    expect(res.status).toBe(403);
  });
});

describe('POST /v1/tasks/:id/items/:itemId/decision', () => {
  const startBatch = async () => {
    const created = await request(app)
      .post('/v1/tasks')
      .set(headers)
      .send({
        task_type: 'cr_review',
        title: 'Batch to decide',
        target: {
          kind: 'batch',
          items: [
            {type: 'cr', id: 'a'},
            {type: 'cr', id: 'b'},
          ],
        },
        assignee_id: 'ahmed',
      });
    await request(app)
      .post(`/v1/tasks/${created.body.id}/transition`)
      .set(headers)
      .send({to: 'in_progress'});
    return created.body;
  };

  it('lets the assignee approve an item', async () => {
    const batch = await startBatch();

    const res = await request(app)
      .post(`/v1/tasks/${batch.id}/items/${batch.items[0].id}/decision`)
      .set(headers)
      .send({decision: 'approved', reason: 'Looks fine'});

    expect(res.status).toBe(200);
    const item = res.body.items.find((one) => one.id === batch.items[0].id);
    expect(res.body.id).toBe(batch.id);
    expect(item.decision).toBe('approved');
    expect(item.decided_by).toBe('ahmed');
    expect(item.reason).toBeNull();
  });

  it('refuses a rejection without a reason', async () => {
    const batch = await startBatch();

    const res = await request(app)
      .post(`/v1/tasks/${batch.id}/items/${batch.items[0].id}/decision`)
      .set(headers)
      .send({decision: 'rejected'});

    expect(res.status).toBe(400);
  });

  it('submits a batch only once every item is decided', async () => {
    const batch = await startBatch();
    const url = `/v1/tasks/${batch.id}`;

    const early = await request(app).post(`${url}/transition`).set(headers).send({to: 'in_review'});
    expect(early.status).toBe(400);

    await request(app)
      .post(`${url}/items/${batch.items[0].id}/decision`)
      .set(headers)
      .send({decision: 'approved'});
    await request(app)
      .post(`${url}/items/${batch.items[1].id}/decision`)
      .set(headers)
      .send({decision: 'rejected', reason: 'Duplicate'});

    const submitted = await request(app)
      .post(`${url}/transition`)
      .set(headers)
      .send({to: 'in_review'});
    expect(submitted.status).toBe(200);
    expect(submitted.body.status).toBe('in_review');
  });
});

describe('POST /v1/tasks/bulk', () => {
  const items = [1, 2, 3, 4, 5].map((n) => ({type: 'cr', id: `bulk-${n}`}));

  it('creates one per item', async () => {
    const res = await request(app)
      .post('/v1/tasks/bulk')
      .set(headers)
      .send({task: {task_type: 'cr_review', title: 'One each'}, items});

    expect(res.status).toBe(201);
    expect(res.body.length).toBe(5);
    expect(res.body.map((task) => task.target_kind)).toEqual([
      'item',
      'item',
      'item',
      'item',
      'item',
    ]);
  });

  it('creates one batch per group of N items', async () => {
    const res = await request(app)
      .post('/v1/tasks/bulk')
      .set(headers)
      .send({task: {task_type: 'cr_review', title: 'In batches'}, items, batch_size: 2});

    expect(res.status).toBe(201);
    expect(res.body.map((task) => task.items.length)).toEqual([2, 2, 1]);
  });

  it('refuses a worker', async () => {
    const res = await request(app)
      .post('/v1/tasks/bulk')
      .set({...headers, 'x-user-role': 'worker'})
      .send({task: {task_type: 'cr_review', title: 'No'}, items});

    expect(res.status).toBe(403);
  });
});

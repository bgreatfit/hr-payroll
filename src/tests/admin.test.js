const request = require('supertest');
const app = require('../app');
const { createProfile, createContract, createJob } = require('../factories');

const setupTestData = async () => {
  const contractor1 = await createProfile({ profession: 'Plumber', type: 'contractor' });
  const contractor2 = await createProfile({ profession: 'Electrician', type: 'contractor' });
  const client = await createProfile();

  const contract1 = await createContract(client.id, { ContractorId: contractor1.id });
  const contract2 = await createContract(client.id, { ContractorId: contractor2.id });

  await createJob(contract1.id, { price: 100, paid: true, paymentDate: '2028-05-01' });
  await createJob(contract1.id, { price: 200, paid: true, paymentDate: '2028-05-02' });
  await createJob(contract2.id, { price: 150, paid: true, paymentDate: '2028-05-03' });
};

describe('GET /admin/best-profession', () => {

  beforeAll(async () => {
    await setupTestData();
  });



  it('should return the profession with the highest earnings in the specified date range', async () => {
    const startDate = '2028-05-01';
    const endDate = '2028-05-31';

    const res = await request(app)
      .get(`/admin/best-profession?start=${startDate}&end=${endDate}`)
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.data.profession).toBe('Plumber');
    expect(res.body.data.totalEarnings).toBe(300);
  });

  it('should return an error when dates are missing', async () => {
    const res = await request(app)
      .get('/admin/best-profession')
      .expect(400);

    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Both start and end dates are required');
  });
});

describe('GET /admin/best-clients', () => {

  beforeAll(async () => {
    // create necessary data using your factories
    const client1 = await createProfile({ type: 'client' });
    const client2 = await createProfile({ type: 'client' });
    const client3 = await createProfile({ type: 'client' });
    const contractor = await createProfile({ type: 'contractor' });

    const contract1 = await createContract(client1.id, contractor.id);
    const contract2 = await createContract(client2.id, contractor.id);
    const contract3 = await createContract(client3.id, contractor.id);

    await createJob(contract1.id, { price: 200, paid: true, paymentDate: '2030-05-01' });
    await createJob(contract2.id, { price: 100, paid: true, paymentDate: '2030-05-02' });
    await createJob(contract3.id, { price: 500, paid: true, paymentDate: '2030-05-02' });
  });



  test('should return the clients who paid the most in the specified date range', async () => {
    const startDate = '2023-05-01';
    const endDate = '2023-05-31';
    const limit = 2;

    const res = await request(app)
      .get(`/admin/best-clients?start=${startDate}&end=${endDate}&limit=${limit}`)
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.data.length).toBe(2);
  });
});

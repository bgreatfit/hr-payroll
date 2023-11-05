const request = require('supertest');
const app = require('../app');
const { createProfile, createContract, createJob } = require("../factories");

describe('Job Endpoints', () => {
  let profile, contract, job;

  beforeEach(async () => {
    profile = await createProfile();
    contract = await createContract(profile.id);
    job = await createJob(contract.id);
  });

  describe('GET /jobs/unpaid', () => {
    it('should return a list of unpaid jobs for the authenticated profile', async () => {
      const res = await request(app)
        .get('/jobs/unpaid')
        .set('profile_id', profile.id);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(Array.isArray(res.body.data)).toBeTruthy();
      expect(res.body.data).not.toContainEqual(expect.objectContaining({ paid: true }));
    });
  });

  describe('POST /jobs/:job_id/pay', () => {
    let client;
    let contractor;
    let contract;
    let job;

    beforeEach(async () => {
      client = await createProfile({type:'client', balance: 500});
      contractor = await createProfile({type:'contractor', balance: 0});
      contract = await createContract(client.id,{ContractorId:contractor.id});
      job = await createJob(contract.id, {price: 100});

    });

    it('should successfully pay for a job and update balances', async () => {
        const res = await request(app)
            .post(`/jobs/${job.id}/pay`)
            .set('profile_id', client.id);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('success');
        expect(res.body.message).toEqual('Payment successful');

        // Reload client and contractor from the database to get updated balances
        await client.reload();
        await contractor.reload();

        // Check the updated balances
        expect(client.balance).toEqual(400);  // 500 - 100 = 400
        expect(contractor.balance).toEqual(100);  // 0 + 100 = 100
    });

    it('should return error if insufficient funds', async () => {
      client.balance = 50;  // insufficient
      await client.save();

      const res = await request(app)
        .post(`/jobs/${job.id}/pay`)
        .set('profile_id', client.id);

      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual('error');
      expect(res.body.message).toEqual('Insufficient funds');
    });

    it('should return error if job not found', async () => {
      const res = await request(app)
        .post(`/jobs/999/pay`)  // Nonexistent job id
        .set('profile_id', client.id);

      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual('error');
      expect(res.body.message).toEqual('Job not found');
    });
  });
});

const request = require('supertest');
const app = require('../app');  // assuming your Express app is exported from app.js
const { createProfile, createContract, createJob } = require("../factories");

describe('POST /balances/deposit/:userId', () => {
  let clientProfile, contract, job;

  beforeEach(async () => {
    clientProfile = await createProfile({ type: 'client', balance: 500 });
    contract = await createContract(clientProfile.id);
    job = await createJob( contract.id, { price: 100 });
  });


  it('should allow a client to deposit money up to 25% of their total unpaid job amount', async () => {
    const res = await request(app)
      .post(`/balances/deposit/${clientProfile.id}`)
      .send({ amount: 25 })  // 25% of 100
      .expect(200);

    expect(res.body.status).toEqual('success');
    expect(res.body.data.balance).toEqual(525);
    expect(res.body.message).toEqual('Deposit successful');
  });

  it('should return an error if the deposit amount exceeds 25% of the total unpaid job amount', async () => {
    const res = await request(app)
      .post(`/balances/deposit/${clientProfile.id}`)
      .send({ amount: 30 })  // more than 25% of 100
      .expect(400);

    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('Deposit amount exceeds 25% of total unpaid job amount');
  });

  it('should return an error if the user is not a client or does not exist', async () => {
    const res = await request(app)
      .post('/balances/deposit/999')  // non-existent user id
      .send({ amount: 25 })
      .expect(404);

    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('User not found or not a client');
  });
});

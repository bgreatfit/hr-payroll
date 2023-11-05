const { Profile, Contract, Job } = require('./models');

async function createProfile(overrides = {}) {
  return await Profile.create({
    firstName: 'John',
    lastName: 'Doe',
    profession: 'Developer',
    balance: 500.00,
    type: 'client',
    ...overrides
  });
}
async function createContract(ClientId, overrides = {}) {
  return await Contract.create({
    terms: 'Some terms',
    status: 'in_progress',
    ClientId,
    ...overrides
  });
}

async function createJob(contractId, overrides = {}) {
  return await Job.create({
    description: 'Some job description',
    price: 100.00,
    paid: false,
    ContractId: contractId,
    paymentDate: new Date(),
    ...overrides
  });
}

module.exports = {
  createProfile,
  createContract,
  createJob
};

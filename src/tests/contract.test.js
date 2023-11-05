const request = require('supertest');
const app = require('../app');
const {sequelize} = require("../database");

beforeAll(async () => {
    // Any setup required before running your tests
});

afterAll(async () => {
    await sequelize.close();
});

describe('GET /contracts/:id', () => {
    it('should return a contract if the profile is associated', async () => {
        const res = await request(app)
            .get('/contracts/1')
            .set('profile_id', '1');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('success');
        expect(res.body.data).toHaveProperty('id', 1);
    }, 5000);

    it('should return 404 if the contract is not found or not associated with the profile', async () => {
        const res = await request(app)
            .get('/contracts/999')
            .set('profile_id', '1');
        expect(res.statusCode).toEqual(404);
        expect(res.body.status).toEqual('error');
    }, 5000);
});

describe('GET /contracts', () => {
    it('should return a list of contracts for a profile', async () => {
        const res = await request(app)
            .get('/contracts')
            .set('profile_id', '1');  // Assuming 1 is a valid profile ID
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data)).toBeTruthy();
        expect(res.body.data).not.toContainEqual(expect.objectContaining({ status: 'terminated' }));
    });
});

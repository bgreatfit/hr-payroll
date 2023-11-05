// tests/getProfile.test.js

const request = require('supertest');
const express = require('express');
const { getProfile } = require('../middleware/getProfile');
const Profile = require("../models/Profile");
const {sequelize} = require("../database");

const app = express();
app.use(express.json());

// Mock route to test the middleware
app.get('/mock-middleware', getProfile, (req, res) => {
  res.json({ profile: req.profile });
});


afterAll(async () => {
  await sequelize.close();  // Close to sequelize connection after all tests are done
});

describe('getProfile Middleware', () => {
  it('should set req.profile if a valid profile_id is provided', async () => {
    const res = await request(app)
      .get('/mock-middleware')
      .set('profile_id', '1');

    expect(res.statusCode).toEqual(200);
    expect(res.body.profile).toBeDefined();
  });

  it('should return 401 if no profile_id is provided', async () => {
    const res = await request(app)
      .get('/mock-middleware');

    expect(res.statusCode).toEqual(401);
  });

  it('should return 401 if an invalid profile_id is provided', async () => {
    const res = await request(app)
      .get('/mock-middleware')
      .set('profile_id', '999');

    expect(res.statusCode).toEqual(401);
  });
});

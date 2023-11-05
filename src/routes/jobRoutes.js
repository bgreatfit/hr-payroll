const express = require('express');
const { getUnpaidJobs, payForJob} = require('../controllers/jobController');
const { getProfile } = require('../middleware/getProfile');

const router = express.Router();

router.get('/unpaid', getProfile, getUnpaidJobs);
router.post('/:job_id/pay', payForJob);

module.exports = router;

const express = require('express');
const router = express.Router();
const { depositBalance } = require('../controllers/balanceController');

router.post('/deposit/:userId', depositBalance);

module.exports = router;

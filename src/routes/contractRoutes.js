const express = require('express');
const router = express.Router();
const { getContract, getContracts} = require('../controllers/contractController');
const { getProfile } = require('../middleware/getProfile');

router.get('/:id', getProfile, getContract);
router.get('/', getProfile, getContracts);

module.exports = router;

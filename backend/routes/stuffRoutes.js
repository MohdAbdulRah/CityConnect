const express = require('express');

const {getAllStuff} = require('../controllers/stuffController');
const router = express.Router();
router.get('/', getAllStuff);
module.exports = router;

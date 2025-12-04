const express = require('express');
const { getProfile} = require('../controllers/profileController');
const router = express.Router();
router.get('/', getProfile);
// router.put('/', updateProfile);
module.exports = router;

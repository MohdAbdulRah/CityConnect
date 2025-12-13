const express = require('express');
const { getProfile,updateProfileImage,updateLocation,addNumber, addRating} = require('../controllers/profileController');

const router = express.Router();
router.get('/', getProfile);
router.patch("/profile/image",updateProfileImage);
router.post("/update-location", updateLocation);
router.post("/add-number", addNumber);
router.post("/add-rating", addRating);
module.exports = router;

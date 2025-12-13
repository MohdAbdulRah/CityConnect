const express = require("express");
const router = express.Router();
const { getMyLocation, getAllUsersLocations ,removeLocation} = require("../controllers/locationController");


// Logged-in user's location
router.get("/me",  getMyLocation);

// All users' coordinates for maps
router.get("/all",  getAllUsersLocations);
router.get("/remove",  removeLocation);

module.exports = router;

const express = require('express');

const {getAllStuff,createStuff,interestInStuff,getMyStuffs,getRecievedStuffs,myInterest, giveStufftoUser, getStuffByUser,getRecvStuffUser} = require('../controllers/stuffController');
const router = express.Router();
router.get('/', getAllStuff);
router.post('/add', createStuff);
router.post('/interested',interestInStuff)
router.get("/my-stuffs",getMyStuffs)
router.get("/my-recv-stuffs",getRecievedStuffs)
router.get("/my-int-stuffs",myInterest)
router.post("/giveStuff",giveStufftoUser)
router.get("/stuffByUser/:id",getStuffByUser)
router.get("/stuffRecvByUser/:userid",getRecvStuffUser)
module.exports = router;

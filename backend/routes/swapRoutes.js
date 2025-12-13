const express = require("express");
const router = express.Router();
const {setSetting,getSwapById,findAdjacentSwaps,findOneSwap,cancelSwap, receiveSwap} = require("../controllers/swapControllers")

router.post("/new",setSetting)
router.get("/swapById/:id",getSwapById)
router.get("/getSwaps/:id",findAdjacentSwaps)
router.get("/getOneSwap/:id",findOneSwap)
router.delete("/cancel/:id",cancelSwap)
router.post("/recieve-swap",receiveSwap)

module.exports = router;
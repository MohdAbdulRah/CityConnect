const express = require("express");
const router = express.Router();
const { createTask, getAllTasks ,applyTasks,myGivenTasks,myRecvTasks,myApplTasks, giveTasks,getGivenTaskByOwner,getRecievedTaskByOwner} = require("../controllers/taskController");

// @POST  /tasks  → Create a new task
router.post("/add", createTask);

// @GET   /tasks  → Show all tasks
router.get("/", getAllTasks);

router.post("/apply/:taskId",applyTasks);

router.get("/myGiven",myGivenTasks)
router.get("/myRecv",myRecvTasks)
router.get("/myApplTasks",myApplTasks)
router.post("/giveTasks",giveTasks)

router.get("/getGivenTaskByOwner/:id",getGivenTaskByOwner)
router.get("/getRecievedTaskByOwner/:id",getRecievedTaskByOwner)
module.exports = router;

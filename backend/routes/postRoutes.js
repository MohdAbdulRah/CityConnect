const express = require('express');

const {getAllPost,createPost,getMyPosts,getUserPosts} = require('../controllers/postController');
const router = express.Router();
router.get('/', getAllPost);
router.post('/add', createPost);
router.get("/myPosts",getMyPosts);
router.get("/userPosts/:id",getUserPosts);
module.exports = router;
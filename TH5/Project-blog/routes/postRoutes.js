const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.getAllPosts);
router.get('/blogposts/new', postController.renderCreateForm);
router.post('/blogposts/store', postController.storePost);
router.get('/blogposts/:id', postController.getPostDetail);
router.get('/blogposts/delete/:id', postController.deletePost); // Route xóa

module.exports = router;
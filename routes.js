const express = require('express');
const router = express.Router();

const Posts_Controller = require('./controllers/posts.js');

router.get('/users/all', Posts_Controller.users_get);
router.get('/users/:author/:size/:skip', Posts_Controller.posts_user_paged_get);

router.get('/all', Posts_Controller.posts_get);
router.get('/all/:size/:skip', Posts_Controller.posts_paged_get);
router.post('/add', Posts_Controller.posts_add_post);
router.post('/update', Posts_Controller.posts_update_post);
router.post('/delete', Posts_Controller.posts_delete_post);
router.post('/comments/add', Posts_Controller.comments_add_post);
router.post('/comments/delete', Posts_Controller.comments_delete_post);

router.get(/^(\/[A-Za-z0-9-]*)*$/, Posts_Controller.home_get);

module.exports = router;

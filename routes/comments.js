
const express = require('express');
const app = express();
var router = express.Router();
var comment_ctl = require('../controllers/comment_controller');

//Comment routes

/*
 GET AllCommentByThread
 */
router.get('/:threadId/all', comment_ctl.getAllByThreadId);
//router.get('/', comment_ctl.getAllByThreadId);

module.exports = router;
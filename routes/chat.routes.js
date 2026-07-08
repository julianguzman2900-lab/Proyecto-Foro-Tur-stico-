const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { requireLogin } = require('../middlewares/auth');

router.get('/chat', requireLogin, chatController.getChat);
router.get('/api/chat/messages', requireLogin, chatController.getMessages);
router.post('/api/chat/message', requireLogin, chatController.postMessage);
router.put('/api/chat/message/:id', requireLogin, chatController.updateMessage);
router.delete('/api/chat/message/:id', requireLogin, chatController.deleteMessage);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  resolveMessage,
  deleteMessage,
} = require('../controllers/messageController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public contact submission
router.post('/', sendMessage);

// Admin message inbox
router.get('/', protectAdmin, getMessages);
router.put('/:id/resolve', protectAdmin, resolveMessage);
router.delete('/:id', protectAdmin, deleteMessage);

module.exports = router;

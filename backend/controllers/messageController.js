const Message = require('../models/Message');

// @desc    Submit a contact form query
// @route   POST /api/messages
// @access  Public
const sendMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const newMessage = await Message.create({
      name,
      email,
      phone,
      subject: subject || 'General Query',
      message,
      isResolved: false,
    });

    res.status(201).json({
      message: 'Message sent successfully. We will get back to you shortly.',
      newMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all contact messages (Admin only)
// @route   GET /api/messages
// @access  Private (Admin)
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({});
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle or set message resolution status (Admin only)
// @route   PUT /api/messages/:id/resolve
// @access  Private (Admin)
const resolveMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { isResolved } = req.body;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const updatedMessage = await Message.findByIdAndUpdate(id, {
      isResolved: isResolved !== undefined ? isResolved : !message.isResolved,
    });

    res.json({ message: 'Message status updated successfully', message: updatedMessage });
  } catch (error) {
    console.error('Resolve message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a message (Admin only)
// @route   DELETE /api/messages/:id
// @access  Private (Admin)
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await Message.deleteOne({ _id: id });
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  resolveMessage,
  deleteMessage,
};

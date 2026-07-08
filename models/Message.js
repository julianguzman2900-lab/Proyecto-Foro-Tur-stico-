const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  user_name: { type: String, required: true },
  user_role: { type: String, required: true },
  message: { type: String, required: true },
  reply_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  reply_to_name: { type: String, default: null },
  mentions: [{ type: String }],
  is_edited: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);

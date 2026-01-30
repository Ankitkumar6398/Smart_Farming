const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  userName: {
    type: String,
    required: true,
  },
  reply: {
    type: String,
    required: [true, 'Please provide a reply'],
    trim: true,
  },
}, {
  timestamps: true,
});

const answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  userName: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: [true, 'Please provide an answer'],
    trim: true,
  },
  replies: [replySchema],
}, {
  timestamps: true,
});

const questionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Allow anonymous questions
  },
  userName: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
  },
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true,
  },
  answers: [answerSchema],
}, {
  timestamps: true,
});

// Index for better query performance
questionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Question', questionSchema);

const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { optionalAuth } = require('../middleware/auth');

// @route   POST /api/community/questions
// @desc    Post a new question
// @access  Public (optional auth - links to user if logged in)
router.post('/questions', optionalAuth, async (req, res) => {
  try {
    const { userName, question } = req.body;

    // Validation
    if (!userName || !question) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both name and question',
      });
    }

    // If user is logged in, use their ID, otherwise null
    const userId = req.user ? req.user._id : null;

    const newQuestion = new Question({
      user: userId,
      userName,
      question,
      answers: [],
    });

    const savedQuestion = await newQuestion.save();
    
    // Populate user if exists
    await savedQuestion.populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: savedQuestion,
    });
  } catch (error) {
    console.error('Error posting question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while posting question',
      error: error.message,
    });
  }
});

// @route   GET /api/community/questions
// @desc    Get all questions with answers
// @access  Public
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('user', 'name email')
      .populate('answers.user', 'name email')
      .populate('answers.replies.user', 'name email')
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions',
      error: error.message,
    });
  }
});

// @route   POST /api/community/questions/:id/answers
// @desc    Post an answer to a question
// @access  Public (optional auth - links to user if logged in)
router.post('/questions/:id/answers', optionalAuth, async (req, res) => {
  try {
    const { userName, answer } = req.body;
    const questionId = req.params.id;

    // Validation
    if (!userName || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both name and answer',
      });
    }

    // Find the question
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // If user is logged in, use their ID, otherwise null
    const userId = req.user ? req.user._id : null;

    // Add answer to question
    question.answers.push({
      user: userId,
      userName,
      answer,
    });

    const updatedQuestion = await question.save();
    
    // Populate user data
    await updatedQuestion.populate('user', 'name email');
    await updatedQuestion.populate('answers.user', 'name email');
    await updatedQuestion.populate('answers.replies.user', 'name email');

    res.status(201).json({
      success: true,
      data: updatedQuestion,
    });
  } catch (error) {
    console.error('Error posting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while posting answer',
      error: error.message,
    });
  }
});

// @route   POST /api/community/questions/:questionId/answers/:answerId/replies
// @desc    Post a reply to an answer
// @access  Public (optional auth - links to user if logged in)
router.post('/questions/:questionId/answers/:answerId/replies', optionalAuth, async (req, res) => {
  try {
    const { userName, reply } = req.body;
    const questionId = req.params.questionId;
    const answerId = req.params.answerId;

    // Validation
    if (!userName || !reply) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both name and reply',
      });
    }

    // Find the question
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Find the answer
    const answer = question.answers.id(answerId);
    
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found',
      });
    }

    // If user is logged in, use their ID, otherwise null
    const userId = req.user ? req.user._id : null;

    // Add reply to answer
    answer.replies.push({
      user: userId,
      userName,
      reply,
    });

    const updatedQuestion = await question.save();
    
    // Populate user data
    await updatedQuestion.populate('user', 'name email');
    await updatedQuestion.populate('answers.user', 'name email');
    await updatedQuestion.populate('answers.replies.user', 'name email');

    res.status(201).json({
      success: true,
      data: updatedQuestion,
    });
  } catch (error) {
    console.error('Error posting reply:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while posting reply',
      error: error.message,
    });
  }
});

// @route   GET /api/community/questions/:id
// @desc    Get a single question with answers
// @access  Public
router.get('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('user', 'name email')
      .populate('answers.user', 'name email')
      .populate('answers.replies.user', 'name email');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching question',
      error: error.message,
    });
  }
});

module.exports = router;

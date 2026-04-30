const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Board = require('../models/Board');

// @route   POST /api/boards/create
// @desc    Create new board
router.post('/create', auth, async (req, res) => {
  const { name, thumbnail, canvasData } = req.body;

  try {
    const newBoard = new Board({
      userId: req.user.id,
      name,
      thumbnail,
      canvasData,
    });

    const board = await newBoard.save();
    res.json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/boards/user/:userId
// @desc    Get all boards for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.params.userId }).sort({ updatedAt: -1 });
    res.json(boards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/boards/:boardId
// @desc    Get specific board
router.get('/:boardId', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    
    if (!board) {
      return res.status(404).json({ msg: 'Board not found' });
    }

    res.json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/boards/:boardId
// @desc    Update board
router.put('/:boardId', auth, async (req, res) => {
  const { name, thumbnail, canvasData } = req.body;

  try {
    let board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({ msg: 'Board not found' });
    }

    // Update fields
    if (name) board.name = name;
    if (thumbnail) board.thumbnail = thumbnail;
    if (canvasData) board.canvasData = canvasData;
    board.updatedAt = Date.now();

    await board.save();
    res.json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/boards/:boardId
// @desc    Delete board
router.delete('/:boardId', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({ msg: 'Board not found' });
    }

    await board.deleteOne();
    res.json({ msg: 'Board removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
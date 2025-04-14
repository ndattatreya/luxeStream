const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// Middleware to ensure JSON responses
router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Get all movies
router.get('/movies', async (req, res) => {z
  try {
    const movies = await Movie.find();
    res.json({
      success: true,
      data: movies
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create/Update movie
router.post('/movies', async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Publish movie
router.put('/api/movies/:id/publish', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'published',
        publishDate: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    return res.json({
      success: true,
      data: movie
    });

  } catch (error) {
    console.error('Movie publish error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error publishing movie',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete review
router.delete('/api/movies/:movieId/reviews/:reviewId', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.movieId,
      { $pull: { reviews: { _id: req.params.reviewId } } },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    return res.json({
      success: true,
      data: movie
    });

  } catch (error) {
    console.error('Review deletion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update movie
router.put('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete movie
router.delete('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
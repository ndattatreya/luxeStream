const express = require('express');
const router = express.Router();
const WatchHistory = require('../models/WatchHistory');
const Movie = require('../models/Movie');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Get user's watch history
router.get('/', auth, async (req, res) => {
    try {
        const watchHistory = await WatchHistory.find({ userId: req.user._id })
            .populate('movieId', 'title posterUrl genre rating')
            .sort({ watchedAt: -1 });

        res.json({
            success: true,
            data: watchHistory
        });
    } catch (error) {
        console.error('Error fetching watch history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching watch history'
        });
    }
});

// Add to watch history
router.post('/', auth, async (req, res) => {
    try {
        const { movieId, watchTime } = req.body;

        // Validate movieId
        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid movie ID'
            });
        }

        // Check if movie exists
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        // Check if already in history
        let history = await WatchHistory.findOne({
            userId: req.user._id,
            movieId: movieId
        });

        if (history) {
            // Update existing history
            history.watchTime = (history.watchTime || 0) + (watchTime || 0);
            history.watchedAt = new Date();
            await history.save();
        } else {
            // Create new history entry
            history = new WatchHistory({
                userId: req.user._id,
                movieId: movieId,
                watchTime: watchTime || 0
            });
            await history.save();
        }

        res.status(201).json({
            success: true,
            data: history,
            message: 'Watch history updated successfully'
        });
    } catch (error) {
        console.error('Error updating watch history:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating watch history'
        });
    }
});

// Update watch history
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { watchTime } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid history ID'
            });
        }

        const history = await WatchHistory.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { 
                watchTime,
                watchedAt: new Date()
            },
            { new: true }
        );

        if (!history) {
            return res.status(404).json({
                success: false,
                message: 'Watch history not found'
            });
        }

        res.json({
            success: true,
            data: history,
            message: 'Watch history updated successfully'
        });
    } catch (error) {
        console.error('Error updating watch history:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating watch history'
        });
    }
});

// Delete from watch history
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid history ID'
            });
        }

        const history = await WatchHistory.findOneAndDelete({
            _id: id,
            userId: req.user._id
        });

        if (!history) {
            return res.status(404).json({
                success: false,
                message: 'Watch history not found'
            });
        }

        res.json({
            success: true,
            message: 'Watch history deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting watch history:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting watch history'
        });
    }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const recommenderService = require('../ai/recommenderService');
const { authenticateUser } = require('../middleware/auth');

// Get recommendations for a user
router.get('/recommendations', authenticateUser, async (req, res) => {
    try {
        // Get user's watch history and preferences from database
        const userId = req.user._id;
        
        // TODO: Replace with actual database queries
        const movies = [
            {
                movieId: 1,
                title: "Movie 1",
                genre: "Action",
                language: "English",
                director: "Director 1",
                rating: 4.5
            },
            // Add more movies...
        ];

        const preferences = {
            userId,
            // Add user preferences...
        };

        const recommendations = await recommenderService.getRecommendations(movies, preferences);
        res.json(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

// Train the recommendation model
router.post('/train', authenticateUser, async (req, res) => {
    try {
        // Get all movies and user preferences from database
        const movies = [
            {
                movieId: 1,
                title: "Movie 1",
                genre: "Action",
                language: "English",
                director: "Director 1",
                rating: 4.5
            },
            // Add more movies...
        ];

        const preferences = [
            {
                userId: "user1",
                // Add user preferences...
            },
            // Add more user preferences...
        ];

        await recommenderService.trainModel(movies, preferences);
        res.json({ status: 'success' });
    } catch (error) {
        console.error('Error training model:', error);
        res.status(500).json({ error: 'Failed to train model' });
    }
});

module.exports = router; 
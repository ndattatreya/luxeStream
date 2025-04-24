const express = require('express');
const router = express.Router();
const recommenderService = require('../ai/recommenderService');
const auth = require('../middleware/auth');

console.log('Loading recommendation routes...');
console.log('recommenderService:', recommenderService);
console.log('auth middleware:', auth);

// Get recommendations for a user
router.get('/user', auth, async (req, res) => {
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
router.post('/train', auth, async (req, res) => {
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
            }
        ];

        const preferences = [
            {
                userId: 1,
                // Add user preferences...
            }
        ];

        await recommenderService.trainModel(movies, preferences);
        res.json({ message: 'Model trained successfully' });
    } catch (error) {
        console.error('Error training model:', error);
        res.status(500).json({ error: 'Failed to train model' });
    }
});

module.exports = router; 
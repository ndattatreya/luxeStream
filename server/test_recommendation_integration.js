const assert = require('assert');
const recommenderService = require('./ai/recommenderService');
const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');
const WatchHistory = require('../models/WatchHistory');

describe('Recommendation System Integration Tests', () => {
    let testUser;
    let testMovies = [];

    before(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_URI_TEST, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Create test user
        testUser = await User.create({
            username: 'test_user',
            email: 'test@example.com',
            password: 'test123'
        });

        // Create test movies
        testMovies = await Movie.create([
            {
                title: "Test Movie 1",
                genre: "Action",
                language: "English",
                director: "Test Director 1",
                rating: 4.5
            },
            {
                title: "Test Movie 2",
                genre: "Drama",
                language: "English",
                director: "Test Director 2",
                rating: 4.2
            }
        ]);

        // Create watch history
        await WatchHistory.create([
            {
                userId: testUser._id,
                movieId: testMovies[0]._id,
                watchTime: 120,
                watchedAt: new Date()
            }
        ]);
    });

    after(async () => {
        // Clean up test data
        await User.deleteMany({});
        await Movie.deleteMany({});
        await WatchHistory.deleteMany({});
        await mongoose.connection.close();
    });

    it('should get recommendations for a user with watch history', async () => {
        const result = await recommenderService.getRecommendations(
            testMovies,
            { userId: testUser._id }
        );

        assert.strictEqual(result.status, 'success');
        assert(Array.isArray(result.recommendations));
        assert(result.recommendations.length > 0);
    });

    it('should train model with real data', async () => {
        const result = await recommenderService.trainModel(
            testMovies,
            { userId: testUser._id }
        );

        assert.strictEqual(result.status, 'success');
    });
}); 
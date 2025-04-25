const assert = require('assert');
const recommenderService = require('./ai/recommenderService');

describe('Recommendation System Tests', () => {
    // Test data
    const testMovies = [
        {
            movieId: 1,
            title: "The Shawshank Redemption",
            genre: "Drama",
            language: "English",
            director: "Frank Darabont",
            rating: 4.8
        },
        {
            movieId: 2,
            title: "The Godfather",
            genre: "Crime",
            language: "English",
            director: "Francis Ford Coppola",
            rating: 4.7
        },
        {
            movieId: 3,
            title: "Inception",
            genre: "Sci-Fi",
            language: "English",
            director: "Christopher Nolan",
            rating: 4.5
        }
    ];

    const testPreferences = {
        userId: "test_user",
        favoriteGenres: ["Drama", "Sci-Fi"],
        preferredLanguages: ["English"],
        favoriteDirectors: ["Christopher Nolan"]
    };

    it('should train the model successfully', async () => {
        const result = await recommenderService.trainModel(testMovies, testPreferences);
        assert.strictEqual(result.status, 'success');
    });

    it('should get recommendations based on user preferences', async () => {
        const result = await recommenderService.getRecommendations(testMovies, testPreferences);
        assert.strictEqual(result.status, 'success');
        assert(Array.isArray(result.recommendations));
        assert(result.recommendations.length > 0);
        
        // Verify recommendation scores
        result.recommendations.forEach(rec => {
            assert('score' in rec);
            assert(typeof rec.score === 'number');
            assert(rec.score >= 0 && rec.score <= 1);
        });
    });

    it('should prioritize movies matching user preferences', async () => {
        const result = await recommenderService.getRecommendations(testMovies, testPreferences);
        
        // Check if movies matching preferences are ranked higher
        const recommendations = result.recommendations;
        const preferredMovies = recommendations.filter(rec => 
            testPreferences.favoriteGenres.includes(rec.genre) ||
            testPreferences.favoriteDirectors.includes(rec.director)
        );
        
        assert(preferredMovies.length > 0);
        assert(preferredMovies[0].score >= preferredMovies[preferredMovies.length - 1].score);
    });
}); 
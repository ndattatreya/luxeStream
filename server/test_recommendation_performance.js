const assert = require('assert');
const recommenderService = require('./ai/recommenderService');

describe('Recommendation System Performance Tests', () => {
    // Generate large test dataset
    const generateTestData = (count) => {
        const movies = [];
        const genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror'];
        const languages = ['English', 'Spanish', 'French', 'German'];
        const directors = ['Director 1', 'Director 2', 'Director 3', 'Director 4'];

        for (let i = 0; i < count; i++) {
            movies.push({
                movieId: i + 1,
                title: `Test Movie ${i + 1}`,
                genre: genres[Math.floor(Math.random() * genres.length)],
                language: languages[Math.floor(Math.random() * languages.length)],
                director: directors[Math.floor(Math.random() * directors.length)],
                rating: (Math.random() * 2 + 3).toFixed(1) // Random rating between 3.0 and 5.0
            });
        }
        return movies;
    };

    const testPreferences = {
        userId: "test_user",
        favoriteGenres: ["Action", "Drama"],
        preferredLanguages: ["English"],
        favoriteDirectors: ["Director 1"]
    };

    it('should handle large dataset within acceptable time', async () => {
        const largeDataset = generateTestData(1000); // 1000 movies
        const startTime = process.hrtime();

        const result = await recommenderService.getRecommendations(largeDataset, testPreferences);
        
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const executionTime = seconds + nanoseconds / 1e9;

        assert.strictEqual(result.status, 'success');
        assert(Array.isArray(result.recommendations));
        assert(result.recommendations.length > 0);
        
        // Performance assertion: should complete within 5 seconds
        assert(executionTime < 5, `Execution time ${executionTime}s exceeded 5s limit`);
    });

    it('should maintain consistent performance across multiple requests', async () => {
        const testDataset = generateTestData(100);
        const executionTimes = [];

        for (let i = 0; i < 10; i++) {
            const startTime = process.hrtime();
            await recommenderService.getRecommendations(testDataset, testPreferences);
            const [seconds, nanoseconds] = process.hrtime(startTime);
            executionTimes.push(seconds + nanoseconds / 1e9);
        }

        // Calculate average and standard deviation
        const avg = executionTimes.reduce((a, b) => a + b) / executionTimes.length;
        const variance = executionTimes.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / executionTimes.length;
        const stdDev = Math.sqrt(variance);

        // Assert that standard deviation is less than 20% of average
        assert(stdDev < avg * 0.2, 'Performance is not consistent enough');
    });

    it('should handle concurrent requests', async () => {
        const testDataset = generateTestData(100);
        const concurrentRequests = 5;
        const promises = [];

        for (let i = 0; i < concurrentRequests; i++) {
            promises.push(recommenderService.getRecommendations(testDataset, testPreferences));
        }

        const results = await Promise.all(promises);
        
        results.forEach(result => {
            assert.strictEqual(result.status, 'success');
            assert(Array.isArray(result.recommendations));
            assert(result.recommendations.length > 0);
        });
    });
}); 
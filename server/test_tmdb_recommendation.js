const recommenderService = require('./ai/recommenderService');

async function testTMDBRecommendation() {
    try {
        console.log("Training model with TMDB data...");
        const trainResult = await recommenderService.trainModel();
        console.log("Model trained successfully!");

        // Get some sample movies for testing
        const testMovies = [
            {
                movieId: "550",  // Fight Club
                title: "Fight Club",
                genre: "Drama",
                language: "en",
                director: "David Fincher",
                rating: 8.4
            },
            {
                movieId: "155",  // The Dark Knight
                title: "The Dark Knight",
                genre: "Action",
                language: "en",
                director: "Christopher Nolan",
                rating: 8.5
            }
        ];

        // Get user preferences and watch history
        const preferences = {
            userId: "user1",
            favoriteGenres: ["Action", "Drama"],
            preferredLanguages: ["en"],
            favoriteDirectors: ["Christopher Nolan"],
            watchHistory: [
                {
                    movieId: "550",  // Fight Club
                    rating: 5,
                    watch_date: "2023-01-15"
                },
                {
                    movieId: "155",  // The Dark Knight
                    rating: 4,
                    watch_date: "2023-02-20"
                }
            ]
        };

        console.log("\nGetting recommendations...");
        const result = await recommenderService.getRecommendations(testMovies, preferences);
        
        if (result.status === 'success' && result.recommendations) {
            console.log("\nTop recommendations:");
            result.recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. ${rec.title}`);
                console.log(`   Final Score: ${rec.score.toFixed(2)}`);
                console.log(`   Model Score: ${rec.model_score.toFixed(2)}`);
                console.log(`   User Preference Score: ${rec.user_preference_score.toFixed(2)}`);
                if (rec.poster_path) {
                    console.log(`   Poster: ${rec.poster_path}`);
                }
                if (rec.overview) {
                    console.log(`   Overview: ${rec.overview.substring(0, 100)}...`);
                }
                console.log('---');
            });
        } else {
            console.error("Error getting recommendations:", result.message || "Unknown error");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// Run the test
testTMDBRecommendation(); 
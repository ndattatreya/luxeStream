const recommenderService = require('./ai/recommenderService');

// Sample movie data
const movies = [
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
    },
    {
        movieId: 4,
        title: "Pulp Fiction",
        genre: "Crime",
        language: "English",
        director: "Quentin Tarantino",
        rating: 4.6
    },
    {
        movieId: 5,
        title: "The Dark Knight",
        genre: "Action",
        language: "English",
        director: "Christopher Nolan",
        rating: 4.7
    }
];

// Sample user preferences
const preferences = {
    userId: "user1",
    favoriteGenres: ["Action", "Sci-Fi"],
    preferredLanguages: ["English"],
    favoriteDirectors: ["Christopher Nolan"]
};

async function testRecommendationSystem() {
    try {
        console.log("Training the model...");
        const trainResult = await recommenderService.trainModel(movies, preferences);
        console.log("Model trained successfully!");

        console.log("\nGetting recommendations...");
        const result = await recommenderService.getRecommendations(movies, preferences);
        
        if (result.status === 'success' && result.recommendations) {
            console.log("\nTop recommendations:");
            result.recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. ${rec.title} (Score: ${rec.score.toFixed(2)})`);
            });
        } else {
            console.error("Error getting recommendations:", result.message || "Unknown error");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// Run the test
testRecommendationSystem(); 
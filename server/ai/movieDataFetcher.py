from pymongo import MongoClient
from bson import ObjectId

class MovieDataFetcher:
    def __init__(self):
        # MongoDB connection
        self.client = MongoClient('mongodb://localhost:27017/')
        self.db = self.client['luxeStream']
        self.movies = self.db['movies']
        self.watch_history = self.db['watchhistories']
        self.users = self.db['users']

    def get_user_watch_history(self, user_id):
        try:
            # Convert string user_id to ObjectId if needed
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            # Get watch history from MongoDB
            history = list(self.watch_history.find(
                {'userId': user_id},
                {'movieId': 1, 'watchTime': 1, 'watchedAt': 1}
            ))
            
            # Get movie details for each watched movie
            watch_history = []
            for item in history:
                movie = self.movies.find_one({'_id': item['movieId']})
                if movie:
                    watch_history.append({
                        'movieId': str(movie['_id']),
                        'title': movie.get('title', ''),
                        'genre': movie.get('genre', ''),
                        'rating': movie.get('rating', 0),
                        'watchTime': item.get('watchTime', 0),
                        'watchedAt': item.get('watchedAt')
                    })
            
            return watch_history
        except Exception as e:
            print(f"Error getting watch history: {str(e)}")
            return []

    def get_user_preferences(self, user_id):
        try:
            # Convert string user_id to ObjectId if needed
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            # Get user preferences from MongoDB
            user = self.users.find_one({'_id': user_id})
            if not user:
                return None
            
            # Get user's watch history
            watch_history = self.get_user_watch_history(user_id)
            
            # Extract preferences from watch history
            genres = {}
            languages = {}
            directors = {}
            
            for movie in watch_history:
                # Count genre preferences
                if 'genre' in movie:
                    genres[movie['genre']] = genres.get(movie['genre'], 0) + 1
                
                # Count language preferences
                if 'language' in movie:
                    languages[movie['language']] = languages.get(movie['language'], 0) + 1
                
                # Count director preferences
                if 'director' in movie:
                    directors[movie['director']] = directors.get(movie['director'], 0) + 1
            
            # Sort preferences by count
            favorite_genres = sorted(genres.items(), key=lambda x: x[1], reverse=True)
            preferred_languages = sorted(languages.items(), key=lambda x: x[1], reverse=True)
            favorite_directors = sorted(directors.items(), key=lambda x: x[1], reverse=True)
            
            return {
                'favoriteGenres': [genre for genre, _ in favorite_genres[:3]],
                'preferredLanguages': [lang for lang, _ in preferred_languages[:3]],
                'favoriteDirectors': [director for director, _ in favorite_directors[:3]],
                'watchHistory': watch_history
            }
        except Exception as e:
            print(f"Error getting user preferences: {str(e)}")
            return None

    def get_movies(self, limit=100):
        try:
            # Get movies from MongoDB
            movies = list(self.movies.find().limit(limit))
            
            # Convert ObjectId to string for JSON serialization
            for movie in movies:
                movie['_id'] = str(movie['_id'])
            
            return movies
        except Exception as e:
            print(f"Error getting movies: {str(e)}")
            return []

    def get_movie_details(self, movie_id):
        try:
            # Convert string movie_id to ObjectId if needed
            if isinstance(movie_id, str):
                movie_id = ObjectId(movie_id)
            
            # Get movie details from MongoDB
            movie = self.movies.find_one({'_id': movie_id})
            if movie:
                movie['_id'] = str(movie['_id'])
            return movie
        except Exception as e:
            print(f"Error getting movie details: {str(e)}")
            return None 
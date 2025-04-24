import requests
import os
import time

class MovieDataFetcher:
    def __init__(self):
        self.tmdb_api_key = '012c99e22d2da82680b0e1206ac07ffa'  # Your TMDB API key
        self.tmdb_base_url = 'https://api.themoviedb.org/3'
        self.imdb_base_url = 'https://imdb-api.com/en/API'
        self.imdb_api_key = None  # We'll focus on TMDB for now

    def get_user_watch_history(self, user_id):
        # In a real application, this would fetch from your database
        # For now, we'll return a sample watch history
        return [
            {
                'movieId': '550',  # Fight Club
                'rating': 5,
                'watch_date': '2023-01-15'
            },
            {
                'movieId': '155',  # The Dark Knight
                'rating': 4,
                'watch_date': '2023-02-20'
            }
        ]

    def get_user_preferences(self, user_id):
        # In a real application, this would fetch from your database
        # For now, we'll return sample preferences
        return {
            'favoriteGenres': ['Action', 'Drama'],
            'preferredLanguages': ['en'],
            'favoriteDirectors': ['Christopher Nolan'],
            'watchHistory': self.get_user_watch_history(user_id)
        }

    def get_tmdb_movies(self, page=1, num_pages=5):
        movies = []
        for page_num in range(page, page + num_pages):
            try:
                # Get popular movies
                response = requests.get(
                    f'{self.tmdb_base_url}/movie/popular',
                    params={
                        'api_key': self.tmdb_api_key,
                        'page': page_num,
                        'language': 'en-US'
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                for movie in data['results']:
                    # Get detailed movie information
                    details = self.get_tmdb_movie_details(movie['id'])
                    if details:
                        movies.append(details)
                
                # Respect rate limits
                time.sleep(0.5)
            except Exception as e:
                print(f"Error fetching TMDB movies: {str(e)}")
                continue
        
        return movies

    def get_tmdb_movie_details(self, movie_id):
        try:
            response = requests.get(
                f'{self.tmdb_base_url}/movie/{movie_id}',
                params={
                    'api_key': self.tmdb_api_key,
                    'language': 'en-US',
                    'append_to_response': 'credits'
                }
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                'movieId': str(movie_id),
                'title': data['title'],
                'genre': data['genres'][0]['name'] if data['genres'] else 'Unknown',
                'language': data['original_language'],
                'director': next((crew['name'] for crew in data['credits']['crew'] 
                                if crew['job'] == 'Director'), 'Unknown'),
                'rating': data['vote_average'],
                'overview': data['overview'],
                'release_date': data['release_date'],
                'poster_path': f"https://image.tmdb.org/t/p/w500{data['poster_path']}" if data['poster_path'] else None
            }
        except Exception as e:
            print(f"Error fetching TMDB movie details: {str(e)}")
            return None

    def get_imdb_ratings(self, movie_id):
        try:
            response = requests.get(
                f'{self.imdb_base_url}/Ratings/{self.imdb_api_key}/tt{movie_id}'
            )
            response.raise_for_status()
            data = response.json()
            return {
                'imdb_rating': float(data.get('imDb', 0)),
                'metacritic_rating': float(data.get('metacritic', 0)),
                'rotten_tomatoes_rating': float(data.get('rottenTomatoes', 0))
            }
        except Exception as e:
            print(f"Error fetching IMDB ratings: {str(e)}")
            return None

    def fetch_training_data(self, num_movies=100):
        movies = self.get_tmdb_movies(num_pages=num_movies//20)
        
        # Enhance with IMDB ratings
        for movie in movies:
            imdb_data = self.get_imdb_ratings(movie['movieId'])
            if imdb_data:
                movie.update(imdb_data)
        
        return movies 
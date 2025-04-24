import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import json
import sys
import joblib
import os
from movieDataFetcher import MovieDataFetcher
from datetime import datetime, timedelta
from pymongo import MongoClient

class MovieRecommender:
    def __init__(self):
        self.dt_model = DecisionTreeClassifier(random_state=42)
        self.rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.label_encoders = {}
        self.is_trained = False
        self.model_path = os.path.join(os.path.dirname(__file__), 'trained_models')
        os.makedirs(self.model_path, exist_ok=True)
        self.data_fetcher = MovieDataFetcher()
        
        # MongoDB connection
        self.client = MongoClient('mongodb://localhost:27017/')
        self.db = self.client['luxeStream']
        self.watch_history = self.db['watchhistories']
        self.movies = self.db['movies']

    def get_user_watch_history(self, user_id):
        try:
            # Convert string user_id to ObjectId if needed
            if isinstance(user_id, str):
                from bson import ObjectId
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
                        'rating': movie.get('rating', 0),
                        'watch_date': item['watchedAt'].strftime('%Y-%m-%d'),
                        'watch_time': item.get('watchTime', 0)
                    })
            
            return watch_history
        except Exception as e:
            print(f"Error fetching watch history: {str(e)}")
            return []

    def calculate_user_preference_score(self, movie, user_preferences):
        score = 0
        
        # Genre match
        if 'genre' in movie and 'favoriteGenres' in user_preferences:
            if movie['genre'] in user_preferences['favoriteGenres']:
                score += 3
        
        # Language match
        if 'language' in movie and 'preferredLanguages' in user_preferences:
            if movie['language'] in user_preferences['preferredLanguages']:
                score += 2
        
        # Director match
        if 'director' in movie and 'favoriteDirectors' in user_preferences:
            if movie['director'] in user_preferences['favoriteDirectors']:
                score += 2
        
        # Rating consideration
        if 'rating' in movie:
            score += movie['rating'] / 2  # Normalize rating to 0-5 scale
        
        return score

    def preprocess_data(self, data):
        # Convert data to DataFrame
        df = pd.DataFrame(data)
        
        # Encode categorical features
        categorical_features = ['genre', 'language', 'director']
        for feature in categorical_features:
            if feature in df.columns:
                self.label_encoders[feature] = LabelEncoder()
                df[feature] = self.label_encoders[feature].fit_transform(df[feature].fillna('Unknown'))
        
        # Fill missing values
        numeric_features = ['rating', 'releaseYear']
        for feature in numeric_features:
            if feature in df.columns:
                df[feature] = df[feature].fillna(df[feature].mean())
        
        return df

    def train(self, movies_data=None, user_preferences=None):
        try:
            # If no data provided, fetch from database
            if movies_data is None:
                movies_data = self.data_fetcher.get_movies()
            
            if not movies_data:
                raise ValueError("No movies data available for training")
            
            # Preprocess the data
            df = self.preprocess_data(movies_data)
            
            # Prepare features and target
            features = ['genre', 'language', 'director', 'rating', 'releaseYear']
            X = df[features]
            
            # Create target variable based on user preferences
            if user_preferences:
                y = df.apply(lambda row: self.calculate_user_preference_score(
                    row.to_dict(), user_preferences
                ), axis=1)
            else:
                # If no user preferences, use rating as target
                y = df['rating']
            
            # Train models
            self.dt_model.fit(X, y)
            self.rf_model.fit(X, y)
            
            # Save models and encoders
            joblib.dump(self.dt_model, os.path.join(self.model_path, 'dt_model.joblib'))
            joblib.dump(self.rf_model, os.path.join(self.model_path, 'rf_model.joblib'))
            joblib.dump(self.label_encoders, os.path.join(self.model_path, 'label_encoders.joblib'))
            
            self.is_trained = True
            return True
        except Exception as e:
            print(f"Error training model: {str(e)}")
            return False

    def load_models(self):
        try:
            self.dt_model = joblib.load(os.path.join(self.model_path, 'dt_model.joblib'))
            self.rf_model = joblib.load(os.path.join(self.model_path, 'rf_model.joblib'))
            self.label_encoders = joblib.load(os.path.join(self.model_path, 'label_encoders.joblib'))
            self.is_trained = True
            return True
        except Exception as e:
            print(f"Error loading models: {str(e)}")
            return False

    def predict(self, movies_data, user_preferences):
        try:
            if not self.is_trained:
                if not self.load_models():
                    raise ValueError("Models not trained and cannot be loaded")
            
            # Preprocess the data
            df = self.preprocess_data(movies_data)
            
            # Prepare features
            features = ['genre', 'language', 'director', 'rating', 'releaseYear']
            X = df[features]
            
            # Get predictions from both models
            dt_predictions = self.dt_model.predict_proba(X)
            rf_predictions = self.rf_model.predict_proba(X)
            
            # Combine predictions (simple average)
            combined_predictions = (dt_predictions + rf_predictions) / 2
            
            # Add predictions to movies data
            for i, movie in enumerate(movies_data):
                movie['recommendation_score'] = float(combined_predictions[i][1])
            
            # Sort movies by recommendation score
            recommended_movies = sorted(
                movies_data,
                key=lambda x: x.get('recommendation_score', 0),
                reverse=True
            )
            
            return recommended_movies[:10]  # Return top 10 recommendations
        except Exception as e:
            print(f"Error making predictions: {str(e)}")
            return []

def main():
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    action = input_data.get('action')
    movies = input_data.get('movies', [])
    preferences = input_data.get('preferences', {})
    
    recommender = MovieRecommender()
    result = {}
    
    try:
        if action == 'train':
            success = recommender.train(movies, preferences)
            result = {
                'status': 'success' if success else 'error',
                'message': 'Model trained successfully' if success else 'Failed to train model'
            }
        elif action == 'predict':
            recommendations = recommender.predict(movies, preferences)
            result = {
                'status': 'success',
                'recommendations': recommendations
            }
        else:
            result = {
                'status': 'error',
                'message': 'Invalid action'
            }
    except Exception as e:
        result = {
            'status': 'error',
            'message': str(e)
        }
    
    # Write result to stdout
    print(json.dumps(result))

if __name__ == '__main__':
    main() 
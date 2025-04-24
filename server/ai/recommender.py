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
        
        # Check genre match
        if movie['genre'] in user_preferences.get('favoriteGenres', []):
            score += 2
        
        # Check language match
        if movie['language'] in user_preferences.get('preferredLanguages', []):
            score += 1
        
        # Check director match
        if movie['director'] in user_preferences.get('favoriteDirectors', []):
            score += 2
        
        # Get user's watch history from MongoDB
        watch_history = self.get_user_watch_history(user_preferences.get('userId'))
        
        # Check watch history
        for watched in watch_history:
            if watched['movieId'] == movie['movieId']:
                # Recent watches have more weight
                watch_date = datetime.strptime(watched['watch_date'], '%Y-%m-%d')
                days_ago = (datetime.now() - watch_date).days
                recency_weight = max(0, 1 - (days_ago / 365))  # Weight decreases over a year
                
                # Consider both rating and watch time
                rating_weight = watched.get('rating', 0) / 5  # Normalize rating to 0-1
                watch_time_weight = min(1, watched.get('watch_time', 0) / 7200)  # Normalize watch time (2 hours max)
                
                score += (rating_weight + watch_time_weight) * recency_weight
        
        return score

    def preprocess_data(self, data):
        # Convert data to DataFrame
        df = pd.DataFrame(data)
        
        # Encode categorical features
        categorical_features = ['genre', 'language', 'director']
        for feature in categorical_features:
            if feature in df.columns:
                if feature not in self.label_encoders:
                    self.label_encoders[feature] = LabelEncoder()
                    df[feature] = self.label_encoders[feature].fit_transform(df[feature].astype(str))
                else:
                    # Handle unseen categories
                    known_categories = set(self.label_encoders[feature].classes_)
                    new_categories = set(df[feature].astype(str))
                    if not new_categories.issubset(known_categories):
                        # Retrain encoder with new categories
                        self.label_encoders[feature] = LabelEncoder()
                        df[feature] = self.label_encoders[feature].fit_transform(df[feature].astype(str))
                    else:
                        df[feature] = self.label_encoders[feature].transform(df[feature].astype(str))
        
        return df

    def train(self, movies_data=None, user_preferences=None):
        # If no movies data provided, fetch from TMDB
        if movies_data is None:
            movies_data = self.data_fetcher.fetch_training_data(num_movies=100)
        
        # Preprocess movies data
        movies_df = self.preprocess_data(movies_data)
        
        # Create features and target
        X = movies_df.drop(['movieId', 'title', 'rating', 'overview', 'release_date', 'poster_path'], 
                          axis=1, errors='ignore')
        y = movies_df['rating'].apply(lambda x: 1 if x >= 4 else 0)
        
        # Train models
        self.dt_model.fit(X, y)
        self.rf_model.fit(X, y)
        self.is_trained = True

        # Save models and encoders
        joblib.dump(self.dt_model, os.path.join(self.model_path, 'dt_model.joblib'))
        joblib.dump(self.rf_model, os.path.join(self.model_path, 'rf_model.joblib'))
        joblib.dump(self.label_encoders, os.path.join(self.model_path, 'label_encoders.joblib'))
        joblib.dump(True, os.path.join(self.model_path, 'is_trained.joblib'))

    def load_models(self):
        try:
            self.dt_model = joblib.load(os.path.join(self.model_path, 'dt_model.joblib'))
            self.rf_model = joblib.load(os.path.join(self.model_path, 'rf_model.joblib'))
            self.label_encoders = joblib.load(os.path.join(self.model_path, 'label_encoders.joblib'))
            self.is_trained = joblib.load(os.path.join(self.model_path, 'is_trained.joblib'))
            return True
        except:
            return False

    def predict(self, movies_data, user_preferences):
        if not self.is_trained:
            if not self.load_models():
                raise Exception("Model not trained yet")
        
        # Preprocess movies data
        movies_df = self.preprocess_data(movies_data)
        
        # Prepare features for prediction
        X = movies_df.drop(['movieId', 'title', 'rating', 'overview', 'release_date', 'poster_path'], 
                          axis=1, errors='ignore')
        
        # Get predictions from both models
        dt_predictions = self.dt_model.predict_proba(X)
        rf_predictions = self.rf_model.predict_proba(X)
        
        # Handle single-column predictions
        if dt_predictions.shape[1] == 1:
            dt_scores = dt_predictions.ravel()
        else:
            dt_scores = dt_predictions[:, 1]
            
        if rf_predictions.shape[1] == 1:
            rf_scores = rf_predictions.ravel()
        else:
            rf_scores = rf_predictions[:, 1]
        
        # Combine predictions (simple average)
        model_predictions = (dt_scores + rf_scores) / 2
        
        # Create recommendations with user preference scores
        recommendations = []
        for i, movie in enumerate(movies_data):
            user_score = self.calculate_user_preference_score(movie, user_preferences)
            # Combine model prediction with user preference score
            final_score = (model_predictions[i] * 0.7) + (user_score / 10 * 0.3)  # 70% model, 30% user preferences
            
            recommendations.append({
                'movieId': movie['movieId'],
                'title': movie['title'],
                'score': float(final_score),
                'model_score': float(model_predictions[i]),
                'user_preference_score': float(user_score / 10),
                'poster_path': movie.get('poster_path'),
                'overview': movie.get('overview')
            })
        
        # Sort by final score
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:10]  # Return top 10 recommendations

def main():
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    
    # Initialize recommender
    recommender = MovieRecommender()
    
    try:
        if input_data['action'] == 'train':
            recommender.train(input_data.get('movies'), input_data.get('preferences'))
            print(json.dumps({'status': 'success', 'message': 'Model trained successfully'}))
        elif input_data['action'] == 'predict':
            recommendations = recommender.predict(input_data['movies'], input_data['preferences'])
            print(json.dumps({'status': 'success', 'recommendations': recommendations}))
        else:
            print(json.dumps({'status': 'error', 'message': 'Invalid action'}))
    except Exception as e:
        print(json.dumps({'status': 'error', 'message': str(e)}))

if __name__ == '__main__':
    main() 
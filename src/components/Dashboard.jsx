import React, { useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import { Link, useNavigate } from 'react-router-dom';
import MovieCard from './MovieCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [featuredContent, setFeaturedContent] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [freeMovies, setFreeMovies] = useState([]);
  const [paidMovies, setPaidMovies] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [genres, setGenres] = useState([]);
  const [continueWatchingMovies, setContinueWatchingMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredMovies, setFilteredMovies] = useState([]);

  const logout = () => {
    // Clear authentication data (e.g., tokens, user data)
    localStorage.removeItem('user'); // Example: Remove user data from localStorage
    sessionStorage.clear(); // Clear session storage if used
  };

  // Fetch featured content
  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        const response = await fetch('https://api.themoviedb.org/3/movie/popular?api_key=012c99e22d2da82680b0e1206ac07ffa');
        const data = await response.json();
        setFeaturedContent(data.results[0]);
      } catch (error) {
        console.error('Error fetching featured content:', error);
      }
    };

    fetchFeaturedContent();
  }, []);

  // Fetch top rated movies
  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        const response = await fetch('https://api.themoviedb.org/3/movie/top_rated?api_key=012c99e22d2da82680b0e1206ac07ffa');
        const data = await response.json();
        setTopMovies(data.results.slice(0, 10));
      } catch (error) {
        console.error('Error fetching top movies:', error);
      }
    };
    fetchTopMovies();
  }, []);

  // Fetch popular movies (free)
  useEffect(() => {
    const fetchFreeMovies = async () => {
      try {
        const response = await fetch('https://api.themoviedb.org/3/discover/movie?api_key=012c99e22d2da82680b0e1206ac07ffa&vote_average.lte=7');
        const data = await response.json();
        setFreeMovies(data.results);
      } catch (error) {
        console.error('Error fetching free movies:', error);
      }
    };
    fetchFreeMovies();
  }, []);

  // Fetch premium movies (paid)
  useEffect(() => {
    const fetchPaidMovies = async () => {
      try {
        const response = await fetch('https://api.themoviedb.org/3/discover/movie?api_key=012c99e22d2da82680b0e1206ac07ffa&vote_average.gte=8');
        const data = await response.json();
        setPaidMovies(data.results);
      } catch (error) {
        console.error('Error fetching paid movies:', error);
      }
    };
    fetchPaidMovies();
  }, []);

  useEffect(() => {
    // Fetch genres
    const fetchGenres = async () => {
      try {
        const response = await fetch('https://api.themoviedb.org/3/genre/movie/list?api_key=012c99e22d2da82680b0e1206ac07ffa');
        const data = await response.json();
        setGenres(data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    // Fetch trending movies
    const fetchTrending = async () => {
      try {
        const response = await fetch('https://api.themoviedb.org/3/trending/movie/day?api_key=012c99e22d2da82680b0e1206ac07ffa');
        const data = await response.json();
        setTrendingMovies(data.results);
      } catch (error) {
        console.error('Error fetching trending movies:', error);
      }
    };
    fetchTrending();

    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/movies');
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    // Simulate continue watching (using top rated movies for demo)
    const fetchContinueWatching = async () => {
      try {
        const response = await fetch('https://api.themoviedb.org/3/movie/top_rated?api_key=012c99e22d2da82680b0e1206ac07ffa&page=2');
        const data = await response.json();
        setContinueWatchingMovies(data.results.slice(0, 6));
      } catch (error) {
        console.error('Error fetching continue watching:', error);
      }
    };
    fetchContinueWatching();

    // Simulate recommended movies (using popular movies for demo)
    const fetchRecommended = async () => {
      try {
        const response = await fetch('https://api.themoviedb.org/3/movie/popular?api_key=012c99e22d2da82680b0e1206ac07ffa&page=3');
        const data = await response.json();
        setRecommendedMovies(data.results.slice(0, 6));
      } catch (error) {
        console.error('Error fetching recommended movies:', error);
      }
    };
    fetchRecommended();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('https://api.themoviedb.org/3/movie/popular?api_key=012c99e22d2da82680b0e1206ac07ffa');
        const data = await response.json();
        setMovies(data.results);
        setFilteredMovies(data.results);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch movies');
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMovies(filtered);
    }
  }, [searchQuery, movies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      /* Navigation Bar */
      <nav className="bg-black bg-opacity-90 fixed w-full z-50 top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-red-600">LuxeStream</h1>
            <div className="hidden md:flex space-x-6">
              <Link to="/movies" className="hover:text-red-600">Movies</Link>
              <Link to="/tv-shows" className="hover:text-red-600">TV Shows</Link>
              <Link to="/my-list" className="hover:text-red-600">My List</Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="search"
              placeholder="Search..."
              className="px-4 py-2 bg-gray-800 rounded-full focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={() => {
                logout(); // Clear authentication data
                navigate('/'); // Redirect to the homepage
              }}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Featured Content Banner */}
      {featuredContent && (
        <div
          className="relative h-[50vh] md:h-[70vh] w-full bg-cover bg-center mt-16"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${featuredContent.backdrop_path})`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
            <div className="container mx-auto px-4 h-full flex items-end pb-8 md:pb-20">
              <div className="max-w-2xl">
                <h2 className="text-2xl md:text-5xl font-bold mb-2 md:mb-4">{featuredContent.title}</h2>
                <p className="text-sm md:text-lg mb-4 md:mb-6 line-clamp-3 md:line-clamp-none">{featuredContent.overview}</p>
                <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                  <button className="bg-red-600 px-4 md:px-8 py-2 md:py-3 rounded hover:bg-red-700 text-sm md:text-base">
                    Play Now
                  </button>
                  <button className="bg-gray-800 px-4 md:px-8 py-2 md:py-3 rounded hover:bg-gray-700 text-sm md:text-base">
                    More Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Top Movies Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Top Rated Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {topMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} isPaid={movie.vote_average >= 8} />
            ))}
          </div>
        </section>

        {/* Free Movies Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Free Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {freeMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} isPaid={false} />
            ))}
          </div>
        </section>

        {/* Premium Movies Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Premium Movies</h2>
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
              Subscription Required
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {paidMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} isPaid={true} />
            ))}
          </div>
        </section>

        {/* Genre Filter */}
        <div className="mb-8 flex items-center space-x-4">
          <span className="text-lg font-semibold">Filter by Genre:</span>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            <option value="all">All Genres</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {/* Continue Watching */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Continue Watching</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {continueWatchingMovies.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isPaid={movie.vote_average >= 8}
                progress={Math.floor(Math.random() * 90 + 10)} // Random progress between 10-99%
              />
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Because You Watched</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendedMovies
              .filter(movie => selectedGenre === 'all' || movie.genre_ids.includes(Number(selectedGenre)))
              .map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isPaid={movie.vote_average >= 8}
                />
              ))}
          </div>
        </section>

        {/* Trending Now */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingMovies
              .filter(movie => selectedGenre === 'all' || movie.genre_ids.includes(Number(selectedGenre)))
              .map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isPaid={movie.vote_average >= 8}
                />
              ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/category/action" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700">
              Action
            </Link>
            <Link to="/category/comedy" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700">
              Comedy
            </Link>
            <Link to="/category/drama" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700">
              Drama
            </Link>
            <Link to="/category/scifi" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700">
              Sci-Fi
            </Link>
          </div>
        </section>

        {/* Live TV & Sports */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Live Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add live content items */}
          </div>
        </section>

        {/* User Profile Section */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Profile & Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold mb-2">My List</h3>
                <p>Access your saved content</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Downloads</h3>
                <p>View downloaded content</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Settings</h3>
                <p>Manage your account</p>
              </div>
            </div>
          </div>
        </section>

        {/* Movies Grid */}
        <div>
          <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Popular Movies</h2>
          {filteredMovies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No movies found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed bottom-4 right-4">
        {/* Add notification components */}
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          movie={selectedMovie}
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}
    </div>
  );
};

const SubscriptionModal = ({ movie, onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Premium Content</h2>
        <p className="mb-6">
          "{movie?.title}" is a premium movie. Subscribe to our premium plan to watch this and other exclusive content.
        </p>
        <div className="flex flex-col space-y-4">
          <button
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            onClick={() => {
              navigate('/subscription');
              onClose();
            }}
          >
            View Subscription Plans
          </button>
          <button
            className="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600"
            onClick={onClose}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MovieCard from './MovieCard';
import SearchAndFilter from './SearchAndFilter';

const TMDB_API_KEY = '012c99e22d2da82680b0e1206ac07ffa';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const Movies = () => {
  const location = useLocation();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1,
    limit: 20,
  });

  const fetchMovies = async (params = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams(params);
      const query = searchParams.get('query') || '';
      const page = searchParams.get('page') || 1;
      const genre = searchParams.get('genre') || '';
      const year = searchParams.get('year') || '';
      const language = searchParams.get('language') || '';
      const sortBy = searchParams.get('sortBy') || 'popularity.desc';

      let url;
      if (query) {
        url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
      } else {
        url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`;
      }
      
      if (!query) {
        if (genre) url += `&with_genres=${genre}`;
        if (year) url += `&year=${year}`;
        if (language) url += `&with_original_language=${language}`;
        if (sortBy) url += `&sort_by=${sortBy}`;
      }

      console.log('Fetching from TMDB:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.status_message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('TMDB Response:', data);
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid data format received from TMDB');
      }
      
      const transformedMovies = data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genre_ids: movie.genre_ids,
        _id: movie.id,
        rating: movie.vote_average,
        description: movie.overview,
      }));

      console.log('Transformed movies:', transformedMovies);

      setMovies(transformedMovies);
      setPagination({
        page: data.page,
        total: data.total_results,
        pages: data.total_pages,
        limit: 20,
      });
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError(error.message);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    console.log('Initial URL params:', params.toString());
    
    if (!params.toString()) {
      fetchMovies('page=1');
    } else {
      fetchMovies(params.toString());
    }
  }, [location]);

  const handlePageChange = (event, value) => {
    const params = new URLSearchParams(location.search);
    params.set('page', value);
    window.history.pushState({}, '', `?${params.toString()}`);
    fetchMovies(params.toString());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-xl">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-red-600">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8">Movies</h1>
        
        <SearchAndFilter onSearch={fetchMovies} />

        {movies.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl">No movies found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-8">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(null, page)}
                      className={`px-4 py-2 rounded ${
                        page === pagination.page
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Movies; 
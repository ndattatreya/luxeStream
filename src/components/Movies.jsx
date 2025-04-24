import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Pagination,
} from '@mui/material';
import MovieCard from './MovieCard';
import SearchAndFilter from './SearchAndFilter';

const TMDB_API_KEY = '012c99e22d2da82680b0e1206ac07ffa'; // Replace with your actual TMDB API key
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
      
      // Parse the search parameters
      const searchParams = new URLSearchParams(params);
      const query = searchParams.get('query') || '';
      const page = searchParams.get('page') || 1;
      const genre = searchParams.get('genre') || '';
      const year = searchParams.get('year') || '';
      const language = searchParams.get('language') || '';
      const sortBy = searchParams.get('sortBy') || 'popularity.desc';

      // For initial load, fetch popular movies
      let url;
      if (query) {
        url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
      } else {
        url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`;
      }
      
      // Add filters only if we're not doing a text search
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
      
      // Transform TMDB data to match MovieCard component's expectations
      const transformedMovies = data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genre_ids: movie.genre_ids,
        // Add any additional fields that MovieCard might need
        _id: movie.id, // For compatibility with existing code
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

  // Initial load - fetch popular movies
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    console.log('Initial URL params:', params.toString());
    
    // If no search parameters, fetch popular movies
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Movies
      </Typography>

      <SearchAndFilter onSearch={fetchMovies} />

      {movies.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>No movies found</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {movies.map((movie) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                <MovieCard movie={movie} />
              </Grid>
            ))}
          </Grid>

          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Movies; 
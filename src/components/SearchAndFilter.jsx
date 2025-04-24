import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Button,
  Grid,
  Typography,
} from '@mui/material';

const TMDB_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

const TMDB_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
];

const SearchAndFilter = ({ onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    language: '',
    year: '',
    rating: 0,
    sortBy: 'popularity.desc',
  });

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('query') || '');
    setFilters({
      genre: params.get('genre') || '',
      language: params.get('language') || '',
      year: params.get('year') || '',
      rating: parseFloat(params.get('rating')) || 0,
      sortBy: params.get('sortBy') || 'popularity.desc',
    });
  }, [location]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.language) params.set('language', filters.language);
    if (filters.year) params.set('year', filters.year);
    if (filters.rating) params.set('rating', filters.rating);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);

    navigate(`/movies?${params.toString()}`);
    if (onSearch) onSearch(params.toString());
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Search Movies"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Genre</InputLabel>
            <Select
              value={filters.genre}
              onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
              label="Genre"
            >
              <MenuItem value="">All Genres</MenuItem>
              {TMDB_GENRES.map((genre) => (
                <MenuItem key={genre.id} value={genre.id}>
                  {genre.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              label="Language"
            >
              <MenuItem value="">All Languages</MenuItem>
              {TMDB_LANGUAGES.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Year"
            type="number"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Typography gutterBottom>Minimum Rating</Typography>
          <Slider
            value={filters.rating}
            onChange={(e, value) => setFilters({ ...filters, rating: value })}
            min={0}
            max={10}
            step={0.5}
            valueLabelDisplay="auto"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              label="Sort By"
            >
              <MenuItem value="popularity.desc">Popularity</MenuItem>
              <MenuItem value="vote_average.desc">Rating</MenuItem>
              <MenuItem value="release_date.desc">Release Date</MenuItem>
              <MenuItem value="title.asc">Title (A-Z)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            fullWidth
          >
            Search
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchAndFilter; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
    <div className="bg-gray-900 p-4 md:p-6 rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <input
            type="text"
            placeholder="Search Movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full p-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        <div>
          <select
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
            className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="">All Genres</option>
            {TMDB_GENRES.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="">All Languages</option>
            {TMDB_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="number"
            placeholder="Year"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="w-full p-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        <div>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="popularity.desc">Popularity</option>
            <option value="vote_average.desc">Rating</option>
            <option value="release_date.desc">Release Date</option>
            <option value="title.asc">Title (A-Z)</option>
          </select>
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="flex items-center space-x-2">
            <span className="text-white">Rating: {filters.rating}</span>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <button
            onClick={handleSearch}
            className="w-full bg-red-600 text-white py-3 px-4 rounded font-semibold hover:bg-red-700 transition duration-300"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter; 
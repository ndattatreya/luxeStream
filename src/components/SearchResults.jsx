import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css'; // Reuse Home styles

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q'); // Get the search query
  const [results, setResults] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:3001/videos') // Fetch videos from the backend
      .then((response) => {
        const movies = response.data;

        // Filter movies based on the search query
        const filteredResults = movies.filter(
          (movie) =>
            movie.title.toLowerCase().includes(query.toLowerCase()) ||
            (Array.isArray(movie.category) &&
              movie.category.some((cat) =>
                cat.toLowerCase().includes(query.toLowerCase())
              ))
        );

        setResults(filteredResults);
      })
      .catch((error) => console.error('Error fetching videos:', error));
  }, [query]);

  return (
    <div className="container">
      <h2>Search Results for "{query}"</h2>
      <div className="card-container">
        {results.length > 0 ? (
          results.map((movie) => (
            <div className="col-md-3" key={movie.id}>
              <Link to={`/video/${movie.id}`}>
                <div className="card">
                  <div
                    className="cover-image"
                    style={{ backgroundImage: `url(${movie.image})` }}
                  />
                  <div className="overlay">
                    <h5 className="overlay-title">{movie.title}</h5>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <p>No results found for "{query}".</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

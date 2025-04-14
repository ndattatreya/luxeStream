import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const [imdbRating, setImdbRating] = useState("N/A");

  useEffect(() => {
    const fetchImdbRating = async () => {
      try {
        // Use IMDb ID if available; otherwise search by movie title.
        const url = movie.imdb_id
          ? `http://www.omdbapi.com/?apikey=951519c3&i=${movie.imdb_id}`
          : `http://www.omdbapi.com/?apikey=951519c3&t=${encodeURIComponent(movie.title)}`;
          
        console.log("Fetching OMDb data from:", url);
  
        const response = await fetch(url);
        const data = await response.json();
        console.log("OMDb API response:", data);
  
        // Check if data exists and if imdbRating is valid.
        if (data && data.imdbRating && data.imdbRating !== "N/A") {
          // If no imdb_id, then do a strict check using title and (if available) year.
          if (!movie.imdb_id) {
            const titleMatches = data.Title && (data.Title.toLowerCase() === movie.title.toLowerCase());
            // If movie.year exists, compare with data.Year.
            if (movie.year) {
              if (titleMatches && data.Year === movie.year.toString()) {
                setImdbRating(data.imdbRating);
              } else {
                setImdbRating("N/A");
              }
            } else {
              // If year is not provided, use title match only.
              if (titleMatches) {
                setImdbRating(data.imdbRating);
              } else {
                setImdbRating("N/A");
              }
            }
          } else {
            // When using imdb_id, accept the rating.
            setImdbRating(data.imdbRating);
          }
        } else {
          setImdbRating("N/A");
        }
      } catch (error) {
        console.error("Error fetching IMDb rating:", error);
        setImdbRating("N/A");
      }
    };

    fetchImdbRating();
  }, [movie.title, movie.imdb_id, movie.year]);

  return (
    <Link to={`/moviedetails/${movie.id}`} className="block">
      <div className="bg-gray-900 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 shadow-lg group">
        <div className="relative pb-[150%]">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <h3 className="text-xs md:text-sm font-semibold text-white line-clamp-2">{movie.title}</h3>
            <div className="flex items-center mt-1">
              <span className="text-yellow-400 text-xs md:text-sm">★</span>
              <span className="text-gray-200 text-xs md:text-sm ml-1">{imdbRating}</span>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 md:p-4 flex flex-col justify-end">
            <h3 className="text-sm md:text-base font-semibold text-white mb-1 md:mb-2">{movie.title}</h3>
            <p className="text-xs md:text-sm text-gray-300 line-clamp-3 md:line-clamp-4">{movie.overview}</p>
            <div className="flex items-center mt-2">
              <span className="text-yellow-400 text-xs md:text-sm">★</span>
              <span className="text-gray-200 text-xs md:text-sm ml-1">{imdbRating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
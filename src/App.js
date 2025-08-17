import { useEffect, useRef, useState } from "react";
import MovieDetails from "./MovieDetails";
import WatchedSummary from "./WatchedSummary";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";
import useDebounce from "./useDebounce";

export default function App() {

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const { movies, isLoading, error } = useMovies(query, handleCloseMovie);

  const [watched, setWatched] = useLocalStorageState([], 'watched')


  function handleSelectMovie(movieId) {
    setSelectedId((selectedId) => movieId === selectedId ? null : movieId);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched(watched => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== id))
  }

  useEffect(() => {
    if (selectedId) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [selectedId]);

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults query={query} movies={movies} />
      </NavBar>

      <Main className={isLoading || error || movies.length > 0 ? "two-col" : "one-col" }>
        {isLoading || error || movies.length > 0 ? (
          <Box>
            {isLoading && <Loader />}
            {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie} />}
            {error && <ErrorMessage message={error} />}
          </Box>
        ) : null}

        <Box className={selectedId ? "overlay" : ""}>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteWatched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
} 


function Main({ children, className }) {
  return <main className={`main ${className || ""}`}>
    {children}
  </main>
}


export function Loader() {

  return (
    <p className="loader">Loading...</p>
  )
}

function ErrorMessage({ message }) {
  return <p className="error">
    <span>
      ⛔
    </span>
    {message}
  </p>
}

function NavBar({ children }) {

  return <nav className="nav-bar">
    <Logo />
    {children}
  </nav>
}



function NumResults({ movies , query }) {
  return query && <p className="num-results">
    Found <strong>{movies.length}</strong> results
  </p>
}

function Logo() {
  return <div className="logo">
    <img className="imglogo" src="./movie.png" alt="MovieCache" />
    <h1>MovieCache</h1>
  </div>
}


function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  const debounced =  useDebounce(query,500);

  useEffect(function(){
    setQuery(debounced)
  },[setQuery,debounced])

  useKey('Enter', function () {
    if (document.activeElement === inputEl.current) {
      return;
    }
    setQuery(''); 
  })

  return <input
    className="search"
    type="text"
    placeholder="Search movies..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    ref={inputEl}
  />
}




function Box({ children ,className = "" }) {
  const [isOpen, setIsOpen] = useState(true);


  return <div className={`box ${className}`}>
    <button
      className="btn-toggle"
      onClick={() => setIsOpen((open) => !open)}
    >
      {isOpen ? "–" : "+"}
    </button>

    {isOpen && children}
  </div>
}

function MovieList({ movies, onSelectMovie }) {
  return <ul className="list list-movies">
    {movies?.map((movie) => <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />)}
  </ul>
}

function Movie({ movie, onSelectMovie }) {
  return <li key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)}>
    <img src={movie.Poster} alt={`${movie.Title} poster`} />
    <h3>{movie.Title}</h3>
    <div>
      <p>
        <span>🗓</span>
        <span>{movie.Year}</span>
      </p>
    </div>
  </li>
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  const [sortBy, setSortBy] = useState("title");
  const [filter, setfilter] = useState('');


  let sortedMovies;
  if (sortBy === 'recent') sortedMovies = watched.slice().reverse();
  if (sortBy === 'title') sortedMovies = watched.slice().sort((a, b) => a.title.localeCompare(b.title));
  if (sortBy === 'imdb') sortedMovies = watched.slice().sort((a, b) => b.imdbRating - a.imdbRating);
  if (sortBy === 'userRating') sortedMovies = watched.slice().sort((a, b) => b.userRating - a.userRating);

  const filteredMovies = sortedMovies.filter((movie) => movie.title.toLowerCase().includes(filter.toLowerCase()));


  return <>
    <div className="features">
      <div>
        <input type="text" className="filter" value={filter} onChange={(e) => setfilter(e.target.value)} placeholder="Search by filter" ></input>
      </div>

      <div className="sortby">
        <span>Sort by</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="title">Title</option>
          <option value="imdb">IMDb Rating</option>
          <option value="userRating">User Rating</option>
          <option value="recent">Recent</option>
        </select>
      </div>
    </div>

    <ul className="list">
      {filteredMovies.map((movie) => <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />)}
    </ul>
  </>
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return <li key={movie.imdbID}>
    <img src={movie.poster} alt={`${movie.title} poster`} />
    <h3>{movie.title}</h3>
    <div>
      <p>
        <span>⭐️</span>
        <span>{movie.imdbRating}</span>
      </p>
      <p>
        <span>🌟</span>
        <span>{movie.userRating}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{movie.runtime} min</span>
      </p>
      <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>
        X
      </button>
    </div>
  </li>
}



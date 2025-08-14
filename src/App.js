import { useEffect, useRef, useState } from "react";
import MovieDetails from "./MovieDetails";
import WatchedSummary from "./WatchedSummary";
import { useMovies } from "./useMovies";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const KEY = "3b5c663b"

export default function App() {
 
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const {movies,isLoading,error} = useMovies(query,handleCloseMovie);

  const [watched, setWatched] = useState(function(){
    const storedValue = localStorage.getItem('watched');
    return JSON.parse(storedValue);
  });


  function handleSelectMovie(movieId) {
    setSelectedId((selectedId) => movieId === selectedId ? null : movieId);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched(watched => [...watched, movie]);

    // localStorage.setItem('watched',JSON.stringify([...watched,movie]))
  }

  function handleDeleteWatched(id){
    setWatched(watched => watched.filter(movie => movie.imdbID !== id))
  }

  useEffect(function(){
    localStorage.setItem("watched",JSON.stringify(watched))
  },[watched])



  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie} />}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie} onAddWatched={handleAddWatched} watched={watched} /> :
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} onDeleteWatched = {handleDeleteWatched} />
            </>
          }
        </Box>
      </Main>
    </>
  );
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



function NumResults({ movies }) {
  return <p className="num-results">
    Found <strong>{movies.length}</strong> results
  </p>
}

function Logo() {
  return <div className="logo">
    <span role="img">🍿</span>
    <h1>usePopcorn</h1>
  </div>
}


function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  // useEffect(function(){
  //   const el = document.querySelector('.search');
  //   el.focus();
  // },[])
  useEffect(function(){

    function callback(e){
      if(document.activeElement=== inputEl){
        return;
      }

      if(e.code ==='Enter'){
        inputEl.current.focus();
        setQuery('');
      }
    } 

    document.addEventListener('keydown',callback);
    return ()=> document.removeEventListener('keydown',callback);
  },[setQuery])



  return <input
    className="search"
    type="text"
    placeholder="Search movies..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    ref={inputEl}
  />
}


function Main({ children }) {

  return <main className="main">
    {children}
  </main>
}



function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);


  return <div className="box">
    <button
      className="btn-toggle"
      onClick={() => setIsOpen((open) => !open)}
    >
      {isOpen ? "–" : "+"}
    </button>

    {isOpen && children}
  </div>
}

// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);


//   return <div className="box">
//     <button
//       className="btn-toggle"
//       onClick={() => setIsOpen2((open) => !open)}
//     >
//       {isOpen2 ? "–" : "+"}
//     </button>
//     {isOpen2 && (
//       <>
//         <WatchedSummary watched={watched} />
//         <WatchedMovieList watched={watched} />
//       </>
//     )}
//   </div>
// }

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
  return <ul className="list">
    {watched.map((movie) => <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched}/>)}
  </ul>
}

function WatchedMovie({ movie,onDeleteWatched }) {
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
      <button className="btn-delete" onClick={()=>onDeleteWatched(movie.imdbID)}>
        X
      </button>
    </div>
  </li>
}



// http://www.omdbapi.com/?apikey=[yourkey]&
// aac2feb4
// http://www.omdbapi.com/?apikey=aac2feb4&

// Type: "movie"
// Year: "2006"
// imdbID: "tt0383216"

let allMovies = [];
let currentQuery = "";

let debounceTimeout;
function debounce(func, delay = 500) {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(func, delay);
}

function onSearchChange(event) {
  const value = event.target.value;
  debounce(() => movieSearch(value));
}

function showSpinner() {
  document.getElementById("loading-spinner").classList.remove("hidden");
}

function hideSpinner() {
  document.getElementById("loading-spinner").classList.add("hidden");
}

async function movieSearch(query) {
  currentQuery = query;
  showSpinner();

  const response = await fetch(
    `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=aac2feb4`
  );
  const data = await response.json();

  const moviesContainer = document.getElementById("movies-container");

  if (data.Response === "True") {
    recordSearch(query);
    const basicMovies = data.Search.slice(0, 10);
    const detailedMovies = await Promise.all(
      basicMovies.map(async (movie) => {
        const detailRes = await fetch(
          `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=aac2feb4`
        );
        return await detailRes.json();
      })
    );

    allMovies = filterByKeywords(detailedMovies, query);
    applyFilters(allMovies);
  } else {
    moviesContainer.innerHTML = `<p>No results found for "${query}".</p>`;
  }

  hideSpinner();
}

function onFilterChange(event) {
  applyFilters(allMovies);
}

function applyFilters(movies) {
  const filterValue = document.getElementById("movie-filter").value;
  let filtered = [...movies];

  if (filterValue.startsWith("genre:")) {
    const genre = filterValue.split(":")[1].toLowerCase();
    filtered = filtered.filter((m) => m.Genre.toLowerCase().includes(genre));
  }

  if (filterValue.startsWith("title:")) {
    const direction = filterValue.split(":")[1];
    filtered.sort((a, b) => {
      return direction === "asc"
        ? a.Title.localeCompare(b.Title)
        : b.Title.localeCompare(a.Title);
    });
  }

  if (filterValue.startsWith("year:")) {
    const direction = filterValue.split(":")[1];
    filtered.sort((a, b) => {
      return direction === "asc"
        ? parseInt(a.Year) - parseInt(b.Year)
        : parseInt(b.Year) - parseInt(a.Year);
    });
  }

  const moviesContainer = document.getElementById("movies-container");
  moviesContainer.innerHTML = filtered
    .slice(0, 6)
    .map((movie) => movieHTML(movie))
    .join("");
}

// async function movieSearch(movieTitle) {
//     const response = await fetch(`http://www.omdbapi.com/?s=${encodeURIComponent(movieTitle)}&apikey=aac2feb4&`);
//     const data = await response.json();
//     const moviesContainer = document.getElementById(`movies-container`);

//     if (data.Response === "True") {
//         const movies = data.Search.slice(0, 6);
//         moviesContainer.innerHTML = movies.map(movie => movieHTML(movie)).join(``);
//     } else {
//         moviesContainer.innerHTML = `<p>No results found for "${movieTitle}".</p>`;
//     }
// }

function movieHTML(movie) {
  return `
        <div class="movieSearchResult__container">
            <img src="${
              movie.Poster !== "N/A" ? movie.Poster : `./assets/no-poster.jpg`
            }" alt="${movie.Title} poster" />
            <div class="movieDescription">
                <h4>${movie.Title}</h4>
                <p><b>Type: </b>${movie.Type}</p>
                <p><b>Year: </b>${movie.Year}</p>
                <p><b>Genre: </b>${movie.Genre}</p>
                <p><b>Plot: </b>${movie.Plot}</p>
                <p><b>imdbID: </b>${movie.imdbID}</p>
            </div>
        </div>
    `;
}



function filterByKeywords(movies, keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return movies.filter((movie) => {
    const genre = movie.Genre ? movie.Genre.toLowerCase() : "";
    const plot = movie.Plot ? movie.Plot.toLowerCase() : "";
    const title = movie.Title ? movie.Title.toLowerCase() : "";

    return (
      genre.includes(lowerKeyword) ||
      plot.includes(lowerKeyword) ||
      title.includes(lowerKeyword)
    );
  });
}

function recordSearch(query) {
  if (!query) return;

  // Get existing search counts or start fresh
  let searches = JSON.parse(localStorage.getItem("searchCounts")) || {};

  // Increment count for this query
  searches[query] = (searches[query] || 0) + 1;

  // Save back to localStorage
  localStorage.setItem("searchCounts", JSON.stringify(searches));
}

function getTop10Searches(limit = 10) {
  let searches = JSON.parse(localStorage.getItem("searchCounts")) || {};
  return Object.entries(searches)
    .sort((a, b) => b[1] - a[1]) // sort by count desc
    .slice(0, limit);
}

function showTopSearches() {
  const topSearches = getTopSearches();
  const container = document.getElementById("movies-container");

  if (topSearches.length === 0) {
    container.innerHTML = "<p>No searches recorded yet.</p>";
    return;
  } else {
    document.getElementById("top-searches-link").addEventListener("click", (e) => {
      e.preventDefault();
      showTopSearches();
    });
    
  }

  container.innerHTML = `
    <h3>My Top 10 Searches</h3>
    <ol>
      ${topSearches.map(([term, count]) => `<li>${term} (${count})</li>`).join("")}
    </ol>
  `;
}


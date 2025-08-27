// http://www.omdbapi.com/?apikey=[yourkey]&
// aac2feb4
// http://www.omdbapi.com/?apikey=aac2feb4&

// Type: "movie"
// Year: "2006"
// imdbID: "tt0383216"

let unfilteredSearch = [];

// Keep track of the most recent unfiltered search results
let lastUnfilteredSearchResults = [];

let currentQuery = "";


let debounceTimeout;
function debounce(func, delay = 500) {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(func, delay);
}

function onSearchChange(event) {
  const value = event.target.value;
  debounce(() => dbSearch(value));
}

function showSpinner() {
  document.getElementById("loading-spinner").classList.remove("hidden");
}

function hideSpinner() {
  document.getElementById("loading-spinner").classList.add("hidden");
}

// Capture the default results container state once, at load time
const defaultResultsHTML = document.getElementById("results-container").innerHTML;

async function dbSearch(query) {
  currentQuery = query;

  // If user cleared the input, reset and exit early
  if (!query || query.trim().length === 0) {
      // Reset "results-container" to original state
      const resultsContainer = document.getElementById("results-container");
      // And, disable the filter menu
      document.getElementById("result-filter").disabled = true;
      return;
  }

  showSpinner();

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=aac2feb4`
    );
  
    const data = await response.json();

    const resultsContainer = document.getElementById("results-container");

    if (data.Response === "True") {
      recordSearch(query);
      const basicResults = data.Search.slice(0, 10);
      const detailedResults = await Promise.all(
        basicResults.map(async (movie) => {
          const detailRes = await fetch(
            `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=aac2feb4`
          );
        return await detailRes.json();
      })
    );

    unfilteredSearch = filterByKeywords(detailedResults, query);

    // Save last unfiltered results
    lastUnfilteredSearchResults = [...unfilteredSearch];

    applyFilters(unfilteredSearch);

    // Now that we have search results, enable filter menu
    document.getElementById("result-filter").disabled = false;
    } else {
      // Search not valid, display message and disable the filter menu
      resultsContainer.innerHTML = `<p>No results found for "${query}".</p>`;
      document.getElementById("result-filter").disabled = true;
    } 
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    hideSpinner();
  }
}

function onFilterChange(event) {
  applyFilters(unfilteredSearch);
}

function applyFilters(results) {
  const filterSelect = document.getElementById("result-filter");
  const filterValue = filterSelect.value;
  const messageBox = document.getElementById("filter-message");
  let filtered = [...results];

  messageBox.classList.add("hidden");
  messageBox.innerText = "";

  if (!results || results.length === 0) {
    // If no search results to filter then disable filter menu
    filterSelect.disabled = true;
    return;
  } else {
    filterSelect.disabled = false;
  }

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

  const resultsContainer = document.getElementById("results-container");

  if (filtered.length === 0) {
    // Show inline warning message
    messageBox.innerText =
      "⚠️ Filter not applicable to current results. Reverting to last unfiltered results.";
    messageBox.classList.remove("hidden");

    // Reset filter back to default
    filterSelect.value = "";

    // Restore last unfiltered results
    resultsContainer.innerHTML = lastUnfilteredSearchResults
      .slice(0, 6)
      .map((movie) => resultsHTML(movie))
      .join("");

    // Fade-out message after 3 seconds
    setTimeout(() => {
      messageBox.classList.add("fade-out");
      // After fade-out animation finishes, hide it fully
      setTimeout(() => {
        messageBox.classList.add("hidden");
        messageBox.classList.remove("fade-out");
      }, 1000); // match CSS duration
    }, 3000);
  } else {
    resultsContainer.innerHTML = filtered
      .slice(0, 6)
      .map((movie) => resultsHTML(movie))
      .join("");
  }
}


function filterByKeywords(results, keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return results.filter((movie) => {
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


function resultsHTML(movie) {
  return `
    <div class="dbSearchResult__container">
      <img src="${
        movie.Poster !== "N/A" ? movie.Poster : `./assets/no-poster.jpg`
        }" alt="${movie.Title} poster" />
      <div class="resultDescription">
        <h4 class="mb-16">${movie.Title}</h4>
        <p><b>Type: </b>${movie.Type}</p>
        <p><b>Year: </b>${movie.Year}</p>
        <p><b>Genre: </b>${movie.Genre}</p>
        <p><b>Plot: </b>${movie.Plot}</p>
        <p><b>imdbID: </b>${movie.imdbID}</p>
      </div>
    </div>
  `;
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

let showingTop10Searches = false; // track toggle state


function showLastSearchResults() { 
  showingTop10Searches = false; // update state
  console.log("showLastResults() called. Setting showingTop10Searches = false");

  const top10container = document.getElementById("top10searches__container");

  if (lastUnfilteredSearchResults.length === 0) { 
    showingTop10Searches = false; // update state
    top10container.innerHTML = "<p>No previous search results to show.</p>";
    return;
  }

  top10container.innerHTML = lastUnfilteredSearchResults
    .slice(0, 6)
    .map((movie) => resultsHTML(movie))
    .join("");
}

function showTop10SearchesDialog() {
  const top10Searches = getTop10Searches();
  const dialog = document.getElementById("top10searches-dialog");
  const list = document.getElementById("top10searches-list");

  if (top10Searches.length === 0) {
    list.innerHTML = "<li>No searches recorded.</li>";
  } else {
    list.innerHTML = top10Searches
      .map(([term, count]) => `<li>${term} (${count})</li>`)
      .join("");
  }

  dialog.classList.remove("hidden");
}

function hideTop10Searches() {
  document.getElementById("top10searches-dialog").classList.add("hidden");
}

// Hook up listeners
document.getElementById("top10searches-link").addEventListener("click", (e) => {
  e.preventDefault();
  showTop10SearchesDialog();
});

document.getElementById("close-top10searches").addEventListener("click", hideTop10Searches);

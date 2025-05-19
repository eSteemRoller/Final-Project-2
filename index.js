// http://www.omdbapi.com/?apikey=[yourkey]&
// aac2feb4
// http://www.omdbapi.com/?apikey=[aac2feb4]&


// Type: "movie"
// Year: "2006"
// imdbID: "tt0383216"


function onSearchChange(event) {
    const movieTitle = event.target.value;
    movieSearch(movieTitle);
}



async function movieSearch(movieTitle) {
    const response = await fetch(`http://www.omdbapi.com/?s=${encodeURIComponent(movieTitle)}&apikey=aac2feb4&`);
    const data = await response.json();
    const moviesContainer = document.getElementById(`movies-container`);

    if (data.Response === "True") {
        const movies = data.Search.slice(0, 6);
        moviesContainer.innerHTML = movies.map(movie => movieHTML(movie)).join(``);
    } else {
        moviesContainer.innerHTML = `<p>No results found for "${movieTitle}".</p>`;
    }
}


function movieHTML(movie) {
    return `
        <div class="movieSearchResult__container">
            <img src="${movie.Poster !== "N/A" ? movie.Poster : `./assets/no-poster.jpg`}" alt="${movie.Title} poster" />
            <div class="movieDescription">
                <h4>${movie.Title}</h4>
                <p><b>Type: <b>${movie.Type}</p>
                <p><b>Year: <b>${movie.Year}</p>
                <p><b>imdbID: <b>${movie.imdbID}</p>
            </div>
        </div>
    `;
}


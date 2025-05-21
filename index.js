// http://www.omdbapi.com/?apikey=[yourkey]&
// aac2feb4
// http://www.omdbapi.com/?apikey=aac2feb4&


// Type: "movie"
// Year: "2006"
// imdbID: "tt0383216"


function onSearchChange(event) {
    const query = event.target.value;
    movieSearch(query);
}


async function movieSearch(query) {
    const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=aac2feb4`);
    const data = await response.json();

    const moviesContainer = document.getElementById('movies-container');

    if (data.Response === "True") {
        const basicMovies = data.Search.slice(0, 10); // Get more in case filtering removes some
        const detailedMovies = await Promise.all(
            basicMovies.map(async (movie) => {
                const detailRes = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=aac2feb4`);
                return await detailRes.json();
            })
        );

        // Filter by description or genre (optional at this point)
        const filtered = filterByKeywords(detailedMovies, query).slice(0, 6);

        if (filtered.length > 0) {
            moviesContainer.innerHTML = filtered.map(movie => movieHTML(movie)).join('');
        } else {
            moviesContainer.innerHTML = `<p>No matches found with genre/description including "${query}".</p>`;
        }

    } else {
        moviesContainer.innerHTML = `<p>No results found for "${query}".</p>`;
    }
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
            <img src="${movie.Poster !== "N/A" ? movie.Poster : `./assets/no-poster.jpg`}" alt="${movie.Title} poster" />
            <div class="movieDescription">
                <h4>${movie.Title}</h4>
                <p><b>Type: <b>${movie.Type}</p>
                <p><b>Year: <b>${movie.Year}</p>
                <p><b>Genre:</b> ${movie.Genre}</p>
                <p><b>Plot:</b> ${movie.Plot}</p>
                <p><b>imdbID: <b>${movie.imdbID}</p>
            </div>
        </div>
    `;
}


function filterByKeywords(movies, keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return movies.filter(movie => {
        const genre = movie.Genre ? movie.Genre.toLowerCase() : '';
        const plot = movie.Plot ? movie.Plot.toLowerCase() : '';
        const title = movie.Title ? movie.Title.toLowerCase() : '';

        return genre.includes(lowerKeyword) || plot.includes(lowerKeyword) || title.includes(lowerKeyword);
    });
}

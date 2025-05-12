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
    const movies = await fetch(`http://www.omdbapi.com/?s=${movieTitle}&apikey=aac2feb4&`);
    const movieData = await movies.json();
    console.log(movieData);

    // <div class="movieSearchResult__container">
    //     <img src="${Poster}" alt="movie poster image"></img>
    //     <div class="movieDescription">
    //         <h4>${Title}</h4>
    //         <p><b>Type: <b>${Type}</p>
    //         <p><b>Year: <b>${Year}</p>
    //         <p><b>imdbID: <b>${imdbID}</p>
    //     </div>
    // </div>

    // userListEl.innerHTML = usersData.map((user) => userHTML(user)).join(``);

}

movieSearch(movieTitle);

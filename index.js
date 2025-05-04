// http://www.omdbapi.com/?apikey=[yourkey]&
// aac2feb4
// http://www.omdbapi.com/?apikey=[aac2feb4]&



async function main() {
    const movies = await fetch(`http://www.omdbapi.com/?apikey=[aac2feb4]&`);
    const movieData = await users.json();
    console.log(movieData);

    userListEl.innerHTML = usersData.map((user) => userHTML(user)).join(``);

}


// http://www.omdbapi.com/?apikey=[yourkey]&
// aac2feb4
// http://www.omdbapi.com/?apikey=[aac2feb4]&



async function main() {
    const movies = await fetch(`http://www.omdbapi.com/?apikey=[aac2feb4]&`);
    const movieData = await users.json();
    console.log(movieData);

    userListEl.innerHTML = usersData.map((user) => userHTML(user)).join(``);

}

const btnClose = document.querySelector('[data-closeModal]'),
    dialog = document.querySelector('.modal'),
    btnNoTime = document.querySelector('[data-noTime]'),
    modalVivod = document.querySelector('.modal__title'),
    modalBox = document.querySelector('.modal__box')

btnClose.addEventListener('click', () => dialog.close())
dialog.addEventListener('keyup', (e) => {if (e.code === 'Escape') dialog.close()})
dialog.addEventListener('click', (e) => {if (e.target === dialog) dialog.close()})

const apiKey = "b299ee00"

const userTitle = document.querySelector('.account__btn'),
    userBtn = document.querySelector('.account')

const user = {
    login: JSON.parse(localStorage.getItem("user"))[0],
    password: JSON.parse(localStorage.getItem("user"))[1],
}

let newUser
async function userInfo() {
    try {
        let users = await fetch('https://moviesearch-666-default-rtdb.firebaseio.com/users.json')
        users = await users.json()
        const keys = Object.keys(users);
        for (const key of keys) {
            if ((users[key].login === user.login || users[key].email === user.login) && users[key].password === user.password) {
                newUser = {
                    login: users[key].login,
                    email: users[key].email,
                    password: users[key].password,
                    id: key,
                    genre:  users[key].genre || []
                }
            }
        }  
        userTitle.textContent = newUser.login
        return newUser
    } 
    catch (err) {
        console.log('error')
    }
}

userInfo()

userBtn.addEventListener('click', () => {

    modalBox.innerHTML = `
        <label class="modal__label">
            <img class="account__img" src="./images/user.svg" alt="user">
            <input class="modal__input" type="text" value="${newUser.login}" readonly>
        </label>
        <label class="modal__label">
            <img class="account__img" src="./images/email.svg" alt="email">
            <input class="modal__input" type="text" value="${newUser.email}" readonly>
        </label>
        <label class="modal__label">
            <img class="account__img" src="./images/lock.svg" alt="password">
            <input class="modal__input" type="text" value="${newUser.password}" readonly>
        </label>
        <p class="modal__text">Favorite genres:</p>
        <div class="modal__cont">
        </div>
        <div class="modal__label" id="logOutBtn">
            <img class="account__img" src="./images/logout.svg" alt="log out">
            <button class="btn-del">Log out</button>
        </div>
        `
        const modalCont = document.querySelector('.modal__cont')
        if (newUser.genre.length === 0) {
            modalCont.innerHTML = `<input class="modal__input" type="text" value="No favorites yet" readonly>`;
        } else {
            newUser.genre.forEach(genre => {
                modalCont.innerHTML += `<input class="modal__input" type="text" value="${genre}" readonly>`;
            });
        }
    dialog.showModal()
    const logOutBtn = document.querySelector('#logOutBtn')

    logOutBtn.addEventListener("click", () => {
        localStorage.clear()
        window.location.href = 'index.html'
    })
})

async function saveUserGenres(userId, genres) {
    try {
        const currentGenres = newUser.genre ? [...newUser.genre] : [];

        const allGenres = genres.split(',').map(genre => genre.trim());

        const combinedGenres = [...allGenres, ...currentGenres];

        const uniqueGenres = [...new Set(combinedGenres)].slice(0, 3);

        await fetch(`https://moviesearch-666-default-rtdb.firebaseio.com/users/${userId}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ genre: uniqueGenres }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        userInfo()
        recomBox.innerHTML = ''
        displayMovies()
    } catch (error) {
        console.error('Error updating genres', error);
    }
}

const formSearch = document.forms.formSearch,
    searchBox = document.querySelector('.search__box'),
    searchPage = document.querySelector('.search__page'),
    searchInfo = document.querySelector('.details')

async function info(imdbID) {
    try {
        let film = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`);
        film = await film.json();

        searchInfo.innerHTML = `
            <img src="${film.Poster}" alt="poster" class="details__img">
            <div class="details__info">
                <div class="details__block">
                    <p class="details__name">Title:</p>
                    <p class="details__value">${film.Title}</p>
                </div>
                <div class="details__block">
                    <p class="details__name">Released:</p>
                    <p class="details__value">${film.Released}</p>
                </div>
                <div class="details__block">
                    <p class="details__name">Genre:</p>
                    <p class="details__value">${film.Genre}</p>
                </div>
                <div class="details__block">
                    <p class="details__name">Country:</p>
                    <p class="details__value">${film.Country}</p>
                </div>
                <div class="details__block">
                    <p class="details__name">Director:</p>
                    <p class="details__value">${film.Director}</p>
                </div>
                <div class="details__block">
                    <p class="details__name">Writer:</p>
                    <p class="details__value">${film.Writer}</p>
                </div>
                <div class="details__block">
                    <p class="details__name">Actors:</p>
                    <p class="details__value">${film.Actors}</p>
                </div>
                <div class="details__block">
                    <p class="details__name">Awards:</p>
                    <p class="details__value">${film.Awards}</p>
                </div>
            </div>
        `
        document.querySelector('#info').scrollIntoView({ behavior: 'smooth' });
        const genres = film.Genre
        saveUserGenres(newUser.id, genres)
    } 
    catch (err) {
        console.error('Error');
    }
}

async function search(title, type, counter) {
    try {
        let film = await fetch(`https://www.omdbapi.com/?s=${title}&type=${type}&page=${counter}&apikey=${apiKey}`)
        film = await film.json()

        let allPage = Math.ceil(film.totalResults / 10)
        film = await film.Search
        await film.forEach((item) => {
            searchBox.innerHTML += `
                <div class="search__block">
                    <img src="${item.Poster}" alt="poster" class="search__img">
                    <div class="search__cont">
                        <h3 class="search__type">${item.Type}</h3>
                        <h2 class="search__title">${item.Title}</h2>
                        <h3 class="search__year">${item.Year}</h3>
                        <input type="text" value="${item.imdbID}" class="imdbID" hidden>
                        <button class="btn btn-det">Details</button>
                    </div>
                </div>
            `
        })
        
        searchPage.innerHTML = `
            <button class="btn search__btn">Previous</button>
            <span class="search__counter">${counter}</span>
            <button class="btn search__btn">Next</button>
        `
        const searchBtnAll = document.querySelectorAll('.search__btn')
        searchBtnAll[0].addEventListener('click', () => {
            if (counter > 1) {
                searchBox.scrollIntoView({ behavior: 'smooth' });
                searchBox.innerHTML = ''
                searchInfo.innerHTML = ''
                counter--
                search(title, type, counter)
            }
        })
        searchBtnAll[1].addEventListener('click', () => {
            if (counter < allPage) {
                searchBox.scrollIntoView({ behavior: 'smooth' });
                searchBox.innerHTML = ''
                searchInfo.innerHTML = ''
                counter++
                search(title, type, counter)
            }
        })
        const btnAll = document.querySelectorAll('.btn-det')
        btnAll.forEach(btn => {
            btn.addEventListener('click', async (event) => {
                const imdbID = event.target.parentElement.querySelector('.imdbID').value
                await info(imdbID)
            })
        })
    } 
    catch (err) {
        searchBox.innerHTML = `
            <h3 class="search__title">Movie not found!</h2>
        `
    }
}

formSearch.addEventListener('submit', (event) => {
    event.preventDefault()
    searchBox.innerHTML = ''
    searchInfo.innerHTML = ''
    let title = formSearch.title.value,
    type = formSearch.type.value
    let counter = 1
    search(title, type, counter)
    formSearch.reset()
})

const recomBox = document.querySelector('.recom__box')

const randomMovieIDs = [
    "tt3896198", "tt0111161", "tt1375666", "tt0848228", "tt0133093",
    "tt6751668", "tt0109830", "tt0114369", "tt4154796", "tt1853728",
    "tt0110912", "tt0068646", "tt0071562", "tt0468569", "tt0102926",
    "tt0137523", "tt0120737", "tt0088763", "tt0120815", "tt0167260",
    "tt0499549", "tt4154756", "tt0361748", "tt0137523", "tt0120689",
    "tt0082971", "tt1375666", "tt0110357", "tt0107290", "tt0407887",
    "tt0081505", "tt0114814", "tt0317705", "tt0347149", "tt0338013",
    "tt0108778", "tt0110357", "tt0120815", "tt0110912", "tt0103064",
    "tt0114709", "tt0119217", "tt0108778", "tt1345836", "tt0133093",
    "tt0080684", "tt1375666", "tt0110413", "tt0295297", "tt0120586",
    "tt0088763", "tt0332280", "tt0118715", "tt0086190", "tt0372784",
    "tt0083658", "tt0416449", "tt0245429", "tt0317248", "tt0268978",
    "tt0477348", "tt1049413", "tt0112573", "tt0407887", "tt0266697",
    "tt1853728", "tt0120338", "tt0118715", "tt0151804", "tt0112573",
    "tt1979320", "tt0110912",
];

async function fetchMovieByIMDbID(imdbID) {
    const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`);
    const data = await response.json();
    return data;
}

async function fetchRandomMovieFromFavoriteGenres() {
    const newUser = await userInfo();
    const favoriteGenres = newUser.genre;

    if (!favoriteGenres || favoriteGenres.length === 0) {
        return [];
    }

    let foundMovies = [];
    while (foundMovies.length < 3) {
        const randomID = randomMovieIDs[Math.floor(Math.random() * randomMovieIDs.length)];
        const movie = await fetchMovieByIMDbID(randomID); 

        if (movie.Response === 'True' && (movie.Type === 'movie' || movie.Type === 'series') && movie.Poster && movie.Poster !== 'N/A') {
            const movieGenres = movie.Genre.split(', '); 
            const isFavoriteGenre = favoriteGenres.some(genre => movieGenres.includes(genre)); 
            if (isFavoriteGenre) {
                foundMovies.push(movie); 
            }
        }
    }
    return foundMovies
}

async function displayMovies() {
    try {
        const movies = await fetchRandomMovieFromFavoriteGenres();

        if (movies.length === 0) {
            recomBox.innerHTML = `
                <h3 class="recom__title">Don't you have any favorite genres yet :(</h3>
            `;
            return;
        }

        movies.forEach((item) => {
            recomBox.innerHTML += `
                <div class="search__block">
                    <img src="${item.Poster}" alt="poster" class="search__img">
                    <div class="search__cont">
                        <h3 class="search__type">${item.Type}</h3>
                        <h2 class="search__title">${item.Title}</h2>
                        <h3 class="search__year">${item.Year}</h3>
                        <input type="text" value="${item.imdbID}" class="imdbID" hidden>
                        <button class="btn btn-det">Details</button>
                    </div>
                </div>
            `;
        });
        const btnAll = document.querySelectorAll('.btn-det');
        btnAll.forEach(btn => {
            btn.addEventListener('click', async (event) => {
                const imdbID = event.target.parentElement.querySelector('.imdbID').value;
                await info(imdbID);
            });
        });
    } 
    catch (err) {
        console.log('error');
    }
}

displayMovies()

document.querySelector('.logo').addEventListener('click', () => {
    window.location.reload()
})

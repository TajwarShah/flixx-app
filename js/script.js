const globalState = {
  currentPage: document.location.pathname,
  search: {
    term: '',
    type: '',
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },
  api: {
    apiKey: '55b2f29bf9fc9ec0c55a78eb7506317e',
    apiURL: 'https://api.themoviedb.org/3/',
  },
};

//Search Movies/Shows
async function search() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  globalState.search.type = urlParams.get('type');
  globalState.search.term = urlParams.get('search-term');

  if (globalState.search.term !== '' && globalState.search.term !== null) {
    const { results, total_pages, page, total_results } = await apiSearch();

    globalState.search.page = page;
    globalState.search.totalPages = total_pages;
    globalState.search.totalResults = total_results;

    if (results.length === 0) {
      showAlert('no results found');
      return;
    }

    displaySearchResults(results);

    document.querySelector('#search-term').value = '';
  } else {
    showAlert('Please Enter a Search Term');
  }
}

//Displaying Search Results
function displaySearchResults(results) {
  document.querySelector('#search-results').innerHTML = '';
  document.querySelector('#pagination').innerHTML = '';
  document.querySelector('#search-results-heading').innerHTML = '';

  results.forEach((result) => {
    const div = document.createElement('div');
    div.classList.add('card');

    div.innerHTML = `<a href="${globalState.search.type}-details.html?id=${
      result.id
    }">
    ${
      result.poster_path
        ? ` <img
     src="https://image.tmdb.org/t/p/w500${result.poster_path}"
     class="card-img-top"
     alt="${globalState.search.type === 'tv' ? result.name : result.title}"
   />`
        : ` <img
   src="images/no-image.jpg"
   class="card-img-top"
   alt="${globalState.search.type === 'tv' ? result.name : result.title}"
 />`
    }
   </a>
   <div class="card-body">
     <h5 class="card-title">${
       globalState.search.type === 'tv' ? result.name : result.title
     }</h5>
     <p class="card-text">
       <small class="text-muted">Release: ${
         globalState.search.type === 'tv'
           ? result.first_air_date
           : result.release_date
       }</small>
     </p>
   </div>`;
    document.querySelector(
      '#search-results-heading'
    ).innerHTML = `<h2>${results.length} of ${globalState.search.totalResults} Results for ${globalState.search.term}</h2>`;
    document.querySelector('#search-results').appendChild(div);
  });

  displayPagination();
}

//Displays pagination
function displayPagination() {
  const div = document.createElement('div');

  div.classList.add('pagination');

  div.innerHTML = `<button class="btn btn-primary" id="prev">Prev</button>
                <button class="btn btn-primary" id="next">Next</button>
                <div class="page-counter">Page ${globalState.search.page} of ${globalState.search.totalPages}</div>
                `;

  document.querySelector('#pagination').appendChild(div);

  //Disable Prev Button if on the first page
  if (globalState.search.page === 1) {
    document.querySelector('#prev').disabled = true;
  }

  //Disable Next Button if on the first page
  if (globalState.search.page === globalState.search.totalPages) {
    document.querySelector('#next').disabled = true;
  }

  //Next Page
  document.querySelector('#next').addEventListener('click', async () => {
    globalState.search.page++;
    const { results, total_pages } = await apiSearch();
    displaySearchResults(results);
  });

  //Prev Page
  document.querySelector('#prev').addEventListener('click', async () => {
    globalState.search.page--;
    const { results, total_pages } = await apiSearch();
    displaySearchResults(results);
  });
}

// Search Api Data
async function apiSearch() {
  const API_KEY = globalState.api.apiKey;
  const API_URL = globalState.api.apiURL;
  showSpinner();
  const response = await fetch(
    `${API_URL}search/${globalState.search.type}?api_key=${API_KEY}&query=${globalState.search.term}&page=${globalState.search.page}`
  );
  const data = await response.json();
  removeSpinner();
  return data;
}

//Display Movie Details
async function displayMovieDetails() {
  const movieId = window.location.search.split('=')[1];

  const movie = await apiDataFetch(`movie/${movieId}`);

  displayBackgroundImage('movie', movie.backdrop_path);

  const div = document.createElement('div');

  div.innerHTML = `  <div class="details-top">
                        <div>
                         ${
                           movie.poster_path
                             ? ` <img
                          src="https://image.tmdb.org/t/p/w500/${movie.poster_path}"
                          class="card-img-top"
                          alt="${movie.title}"
                        />`
                             : ` <img
                        src="images/no-image.jpg"
                        class="card-img-top"
                        alt="${movie.title}"
                      />`
                         }
                        </div>
                        <div>
                          <h2>${movie.title}</h2>
                          <p>
                            <i class="fas fa-star text-primary"></i>
                            ${movie.vote_average.toFixed(1)} / 10
                          </p>
                          <p class="text-muted">Release Date: ${
                            movie.release_date
                          }</p>
                          <p>
                            ${movie.overview}
                          </p>
                          <h5>Genres</h5>
                          <ul class="list-group">
                           ${movie.genres
                             .map((genre) => {
                               return `<li>${genre.name}</li>`;
                             })
                             .join('')}
                          </ul>
                          <a href="${
                            movie.homepage
                          }" target="_blank" class="btn">Visit Movie Homepage</a>
                        </div>
                      </div>
                      <div class="details-bottom">
                        <h2>Movie Info</h2>
                        <ul>
                          <li><span class="text-secondary">Budget:</span> $${numberToCommas(
                            movie.budget
                          )}</li>
                          <li><span class="text-secondary">Revenue:</span> $${numberToCommas(
                            movie.revenue
                          )}</li>
                          <li><span class="text-secondary">Runtime:</span> ${
                            movie.runtime
                          } minutes</li>
                          <li><span class="text-secondary">Status:</span> ${
                            movie.status
                          }</li>
                        </ul>
                        <h4>Production Companies</h4>
                        <div class="list-group">${movie.production_companies
                          .map((company) => {
                            return `<span>${company.name}</span>`;
                          })
                          .join(', ')}</div>
                      </div>`;

  document.querySelector('#movie-details').appendChild(div);
}
//Display Show Details
async function displayShowDetails() {
  const showId = window.location.search.split('=')[1];

  const show = await apiDataFetch(`tv/${showId}`);
  displayBackgroundImage('show', show.backdrop_path);
  const div = document.createElement('div');

  div.innerHTML = `  <div class="details-top">
                        <div>
                         ${
                           show.poster_path
                             ? ` <img
                          src="https://image.tmdb.org/t/p/w500/${show.poster_path}"
                          class="card-img-top"
                          alt="${show.name}"
                        />`
                             : ` <img
                        src="images/no-image.jpg"
                        class="card-img-top"
                        alt="${show.name}"
                      />`
                         }
                        </div>
                        <div>
                          <h2>${show.name}</h2>
                          <p>
                            <i class="fas fa-star text-primary"></i>
                            ${show.vote_average.toFixed(1)} / 10
                          </p>
                          <p class="text-muted">Last Air Date: ${
                            show.last_air_date
                          }</p>
                          <p>
                            ${show.overview}
                          </p>
                          <h5>Genres</h5>
                          <ul class="list-group">
                           ${show.genres
                             .map((genre) => {
                               return `<li>${genre.name}</li>`;
                             })
                             .join('')}
                          </ul>
                          <a href="${
                            show.homepage
                          }" target="_blank" class="btn">Visit show Homepage</a>
                        </div>
                      </div>
                      <div class="details-bottom">
                        <h2>show Info</h2>
                        <ul>
                          <li><span class="text-secondary">Number of Episodes:</span> ${
                            show.number_of_episodes
                          }</li>
                          <li><span class="text-secondary">Last Episode Air Date:</span> ${
                            show.last_episode_to_air.name
                          }</li>
                          <li><span class="text-secondary">Status:</span> ${
                            show.status
                          }</li>
                        </ul>
                        <h4>Production Companies</h4>
                        <div class="list-group">${show.production_companies
                          .map((company) => {
                            return `<span>${company.name}</span>`;
                          })
                          .join(', ')}</div>
                      </div>`;

  document.querySelector('#show-details').appendChild(div);
}

//Displays the Background Image in Details
function displayBackgroundImage(type, path) {
  const div = document.createElement('div');

  div.style.backgroundImage = `url(
    https://image.tmdb.org/t/p/original/${path}
  )`;
  div.style.backgroundSize = 'cover';
  div.style.backgroundPosition = 'center';
  div.style.backgroundRepeat = 'no-repeat';
  div.style.height = '100vh';
  div.style.width = '100vw';
  div.style.position = 'absolute';
  div.style.top = '0';
  div.style.left = '0';
  div.style.zIndex = '-1';
  div.style.opacity = '0.1';

  if (type === 'movie') {
    document.querySelector('#movie-details').appendChild(div);
  } else {
    document.querySelector('#show-details').appendChild(div);
  }
}

//Displays Popular Shows
async function displayPopularShow() {
  const { results } = await apiDataFetch('tv/popular');

  results.forEach((show) => {
    const divEl = document.getElementById('popular-shows');

    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `<a href="tv-details.html?id=${show.id}">
                     ${
                       show.poster_path
                         ? ` <img
                      src="https://image.tmdb.org/t/p/w500/${show.poster_path}"
                      class="card-img-top"
                      alt="${show.name}"
                    />`
                         : ` <img
                    src="images/no-image.jpg"
                    class="card-img-top"
                    alt="${show.name}"
                  />`
                     }
                    </a>
                    <div class="card-body">
                      <h5 class="card-title">${show.name}</h5>
                      <p class="card-text">
                        <small class="text-muted">Firs Air Date: ${
                          show.first_air_date
                        }</small>
                      </p>
                    </div>`;
    divEl.appendChild(div);
  });
}

//Displays the HomePage Slider
async function displaySlider() {
  const { results } = await apiDataFetch(`movie/now_playing`);

  results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('swiper-slide');

    div.innerHTML = ` <a href="movie-details.html?id=${movie.id}">
                 <img src="https://image.tmdb.org/t/p/w500/${
                   movie.poster_path
                 }" alt="${movie.title}" />
              </a>
              <h4 class="swiper-rating">
               <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(
                 1
               )} / 10
              </h4>`;

    document.querySelector('.swiper-wrapper').appendChild(div);

    initSwiper();
  });
}

//Swiper Object Instantiation
function initSwiper() {
  const swiper = new Swiper('.swiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    breakpoints: {
      500: {
        slidesPerView: 1,
      },
      700: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  });
}

//Displays Popular Movies
async function displayPopularMovie() {
  const { results } = await apiDataFetch('movie/popular');
  results.forEach((movie) => {
    const divEl = document.getElementById('popular-movies');

    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `<a href="movie-details.html?id=${movie.id}">
                     ${
                       movie.poster_path
                         ? ` <img
                      src="https://image.tmdb.org/t/p/w500/${movie.poster_path}"
                      class="card-img-top"
                      alt="${movie.title}"
                    />`
                         : ` <img
                    src="images/no-image.jpg"
                    class="card-img-top"
                    alt="${movie.title}"
                  />`
                     }
                    </a>
                    <div class="card-body">
                      <h5 class="card-title">${movie.title}</h5>
                      <p class="card-text">
                        <small class="text-muted">Release: ${
                          movie.release_date
                        }</small>
                      </p>
                    </div>`;
    divEl.appendChild(div);
  });
}

//Change Number to Delimited Currency Number
function numberToCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

//Show Alert
function showAlert(message, className = 'error') {
  const alertEl = document.createElement('div');

  alertEl.classList.add('alert', className);

  alertEl.appendChild(document.createTextNode(message));

  document.querySelector('#alert').appendChild(alertEl);

  setTimeout(() => {
    alertEl.remove();
  }, 3000);
}

function showSpinner() {
  const spinnerEl = document.querySelector('.spinner');

  spinnerEl.classList.add('show');
}

function removeSpinner() {
  const spinnerEl = document.querySelector('.spinner');

  spinnerEl.classList.remove('show');
}

//Highlight Active Link
function highlightActiveLink() {
  const links = document.querySelectorAll('.nav-link');

  links.forEach((link) => {
    if (link.getAttribute('href') === globalState.currentPage) {
      link.classList.add('active');
    }
  });
}

//Gets data from TMDb Api
async function apiDataFetch(endpoint) {
  const API_KEY = globalState.api.apiKey;
  const API_URL = globalState.api.apiURL;
  showSpinner();
  const response = await fetch(`${API_URL}${endpoint}?api_key=${API_KEY}`);
  const data = await response.json();
  removeSpinner();
  return data;
}

//App Initializer
function init() {
  switch (globalState.currentPage) {
    case '/':
    case '/index.html':
      displaySlider();
      displayPopularMovie();
      break;
    case '/shows.html':
    case '/shows':
      displayPopularShow();
      break;
    case '/movie-details.html':
      displayMovieDetails();
      break;
    case '/tv-details.html':
      displayShowDetails();
      break;
    case '/search.html':
      search();
      break;
  }

  highlightActiveLink();
}

document.addEventListener('DOMContentLoaded', init);

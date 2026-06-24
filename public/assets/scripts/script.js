const API_KEY = "cb2cb452055ea5930b48714204c02d45";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const POSTER_FALLBACK = "https://placehold.co/500x750/1a1a2e/e0e0e0?text=Sem+Poster";

const searchInput = document.getElementById("search");
const btnSearch = document.getElementById("btnSearch");
const categorySelect = document.getElementById("category");
const movieListEl = document.getElementById("movie-list");
const messageEl = document.getElementById("message");

async function fetchMovies(query = "") {
    showMessage("⏳ Carregando filmes...", "loading");
    movieListEl.innerHTML = "";

    let url;

    if (query.trim() !== "") {
        url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=1`;
    } else {
        const category = categorySelect.value;
        url = `${BASE_URL}/movie/${category}?api_key=${API_KEY}&language=pt-BR&page=1`;
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.results;

    } catch (error) {
        showMessage(`❌ Erro ao carregar filmes: ${error.message}`, "error");
        return [];
    }
}

function createMovieCard(movie) {
    const card = document.createElement("div");
    card.classList.add("movie-card");

    const posterSrc = movie.poster_path
        ? `${IMG_BASE}${movie.poster_path}`
        : POSTER_FALLBACK;

    const title = movie.title || "Título desconhecido";
    const year = movie.release_date ? movie.release_date.split("-")[0] : "—";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "—";
    const votes = movie.vote_count ? movie.vote_count.toLocaleString("pt-BR") : "0";
    const overview = movie.overview && movie.overview.length > 0
        ? (movie.overview.length > 160 ? movie.overview.substring(0, 160) + "…" : movie.overview)
        : "Sinopse não disponível em português.";

    const starsHtml = buildStars(movie.vote_average);

    const img = document.createElement("img");
    img.classList.add("movie-poster");
    img.src = posterSrc;
    img.alt = `Poster de ${title}`;
    img.loading = "lazy";
    img.onerror = () => { img.src = POSTER_FALLBACK; };

    const info = document.createElement("div");
    info.classList.add("movie-info");

    const titleEl = document.createElement("h3");
    titleEl.classList.add("movie-title");
    titleEl.textContent = title;

    const meta = document.createElement("div");
    meta.classList.add("movie-meta");
    meta.innerHTML = `
    <span class="badge year">📅 ${year}</span>
    <span class="badge rating">⭐ ${rating}<small> (${votes} votos)</small></span>
  `;

    const starsEl = document.createElement("div");
    starsEl.classList.add("movie-stars");
    starsEl.innerHTML = starsHtml;

    const overviewEl = document.createElement("p");
    overviewEl.classList.add("movie-overview");
    overviewEl.textContent = overview;

    info.appendChild(titleEl);
    info.appendChild(meta);
    info.appendChild(starsEl);
    info.appendChild(overviewEl);

    card.appendChild(img);
    card.appendChild(info);

    return card;
}

function renderMovies(movies) {
    movieListEl.innerHTML = "";

    if (!movies || movies.length === 0) {
        showMessage("🎭 Nenhum filme encontrado para esta busca.", "empty");
        return;
    }

    showMessage("");

    movies.forEach((movie) => {
        const card = createMovieCard(movie);
        movieListEl.appendChild(card);
    });
}

function showMessage(text, type = "") {
    messageEl.textContent = text;
    messageEl.className = "message";
    if (type) messageEl.classList.add(type);
}

function buildStars(rating = 0) {
    const filled = Math.round(rating / 2);
    let html = "";
    for (let i = 1; i <= 5; i++) {
        html += `<span class="star ${i <= filled ? "filled" : ""}">★</span>`;
    }
    return html;
}

async function init() {
    const movies = await fetchMovies();
    renderMovies(movies);
}

btnSearch.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    const movies = await fetchMovies(query);
    renderMovies(movies);
});

searchInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        const query = searchInput.value.trim();
        const movies = await fetchMovies(query);
        renderMovies(movies);
    }
});

categorySelect.addEventListener("change", async () => {
    searchInput.value = "";
    const movies = await fetchMovies();
    renderMovies(movies);
});

init();
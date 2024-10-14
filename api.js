import express from "express";
import axios from "axios";
import dotenv from 'dotenv';
import cors from 'cors';
import logger from './utils/logger.js';

dotenv.config();

const app = express(); 
app.use(cors()); 
const PORT = process.env.PORT || 5000;

export const URLs = {
    tmdb: "https://api.themoviedb.org/3",
    image: "https://image.tmdb.org/t/p/w500",
    jikan: "https://api.jikan.moe/v4"
};

const imageUrl = "https://image.tmdb.org/t/p/w500";
const baseJikanUrl = "https://api.jikan.moe/v4";

cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.AUTH_TOKEN}`
    }
};

/* =============================================== */
/*                  BASE ROUTE                     */
/* =============================================== */
app.get("/", (request, response) => {
    response.send("Hello World!");
});

/* =============================================== */
/*                  TMDB API ROUTES                */
/* =============================================== */
app.get("/trending-movies", async (request, response) => {
    try {
        const url = "https://api.themoviedb.org/3/trending/movie/week?language=en-US";

        const trending = await axios.get(url, options);
        const trendingData = trending.data.results;

        const trendingMovieArray = trendingData.slice(0, 20).map(movie => ({
            id: movie.id,
            title: movie.title,
            backdrop_path: imageUrl + movie.backdrop_path,
            poster_path: imageUrl + movie.poster_path,
            overview: movie.overview
        }));

        response.send(trendingMovieArray);
    } catch (err) {
        handleError(err, response);
    }
});

app.get("/trending-tv", async (request, response) => {
    try {
        const url = "https://api.themoviedb.org/3/trending/tv/week?language=en-US";

        const trending = await axios.get(url, options);
        const trendingData = trending.data.results;

        const trendingTVArray = trendingData.slice(0, 20).map(movie => ({
            id: movie.id,
            title: movie.name,
            backdrop_path: imageUrl + movie.backdrop_path,
            overview: movie.overview
        }));

        response.send(trendingTVArray);
    } catch (err) {
        console.error("Error fetching trending tv:", err);
        response.status(500).send("Error fetching trending tv.");
    }
});

app.get("/popular-tv", async (request, response) => {
    try {
        const url = "https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1";

        const popular = await axios.get(url, options);
        const popularData = popular.data.results;

        const popularTVArray = popularData.slice(0, 20).map(movie => ({
            id: movie.id,
            title: movie.name,
            backdrop_path: imageUrl + movie.backdrop_path,
            overview: movie.overview
        }));

        response.send(popularTVArray);
    } catch (err) {
        handleError(err, response);
    }
});

app.get("/popular-movies", async (request, response) => {
    try {
        const url = "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1";

        const popular = await axios.get(url, options);
        const popularData = popular.data.results;

        const popularMovieArray = popularData.slice(0, 20).map(movie => ({
            id: movie.id,
            title: movie.title,
            backdrop_path: imageUrl + movie.backdrop_path,
            poster_path: imageUrl + movie.poster_path,
            overview: movie.overview
        }));

        response.send(popularMovieArray);
    } catch (err) {
        handleError(err, response);
    }
});

app.get("/upcoming-movies", async (request, response) => {
    try {
        const url = "https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1";

        const upcoming = await axios.get(url, options);
        const upcomingData = upcoming.data.results;

        const upcomingMovieArray = upcomingData.slice(0, 20).map(movie => ({
            id: movie.id,
            title: movie.title,
            backdrop_path: imageUrl + movie.backdrop_path,
            overview: movie.overview
        }));

        response.send(upcomingMovieArray);
    } catch (err) {
        handleError(err, response);
    }
});

app.get("/search-movie", async (request, response) => {
    const query = request.query.q; // Get the search query from the query parameters
    console.log(`Searching for movie: ${query}`);
    // Replace with the actual TMDB API call
    response.send(`Search results for movie: ${query}`);
});

app.get("/search-tv", async (request, response) => {
    const query = request.query.q; // Get the search query from the query parameters
    console.log(`Searching for TV show: ${query}`);
    // Replace with the actual TMDB API call
    response.send(`Search results for TV show: ${query}`);
});

/* =============================================== */
/*                  JIKAN API ROUTES               */
/* =============================================== */
/* *********************************************** */

/* =============================================== */
/*                  Trending anime                 */
/* =============================================== */
app.get("/trending/anime", async (request, response) => {
    let { page = 1, limit = 25, filter, sfw, unapproved, continuing } = request.query;

    // Define allowed filter values & validate
    const allowedFilters = ["tv", "movie", "ova", "special", "ona", "music"];

    if (filter && !allowedFilters.includes(filter)) {
        return response.status(400).send({ error: `Invalid filter value: "${filter}". Allowed values are: ${allowedFilters.join(", ")}` });
    }

    try {
        let trendingAnimeUrl = `${URLs.jikan}/seasons/now?page=${page}&limit=${limit}`;

        // Add filters if provided
        if (filter) {
            trendingAnimeUrl += `&filter=${filter}`;
        }
        if (sfw) {
            trendingAnimeUrl += `&sfw`;
        }
        if (unapproved) {
            trendingAnimeUrl += `&unapproved`;
        }
        if (continuing) {
            trendingAnimeUrl += `&continuing`;
        }

        const trending = await axios.get(trendingAnimeUrl);
        const trendingAnimeData = trending.data;

        // Check if the requested page exceeds the last visible page
        if (page > trendingAnimeData.pagination.last_visible_page) {
            return response.status(404).json({
                pagination: {
                    current_page: page,
                    last_visible_page: trendingAnimeData.pagination.last_visible_page,
                    has_next_page: false,
                    items: {
                        count: 0,
                        total: 0,
                        per_page: limit
                    }
                },
                results: [],
                message: "No results found for the requested page."
            });
        }

        const trendingAnimeArray = trendingAnimeData.data.slice(0, limit).map(anime => ({
            mal_id: anime.mal_id,
            mal_url: anime.url,
            images: [
                anime.images.jpg.image_url,
                anime.images.jpg.large_image_url,
                anime.trailer.images?.maximum_image_url || null
            ],
            trailer: {
                yt_id: anime.trailer.youtube_id,
                yt_url: anime.trailer.url,
                embed_url: anime.trailer.embed_url
            },
            titles: {
                default_title: anime.title,
                japanese_title: anime.title_japanese,
                english_title: anime.title_english
            },
            episodes: anime.episodes,
            rating: anime.rating,
            type: anime.type,
            source: anime.source,
            status: anime.status,
            score: anime.score,
            rank: anime.rank,
            popularity: anime.popularity,
            synopsis: anime.synopsis,
            backgroud: anime.backgroud,
            season: anime.season,
            year: anime.year,
            genres: anime.genres.map(genre => genre.name),
            themes: anime.themes.map(theme => theme.name),
            demographics: anime.demographics.map(demographic => demographic.name),
            explicit_genres: anime.explicit_genres.map(genre => genre.name)
        }));

        const paginationInfo = {
            current_page: page,
            last_visible_page: trendingAnimeData.pagination.last_visible_page,
            has_next_page: trendingAnimeData.pagination.has_next_page,
            items: {
                count: trendingAnimeData.pagination.items.count,
                total: trendingAnimeData.pagination.items.total,
                per_page: limit
            }
        };

        const responseData = {
            pagination: paginationInfo,
            results: trendingAnimeArray
        };

        logger.info(`Fetched trending anime with query params: page=${page}, limit=${limit}, filter=${filter}, at ${new Date().toISOString()}`);
        response.send(responseData);
    } catch (err) {
        handleError(err, response);
    }
});

/* =============================================== */
/*                  Popular anime                  */
/* =============================================== */
app.get("/popular/anime", async (request, response) => {
    try {
        const popularAnimeUrl = `${baseJikanUrl}/top/anime`;
        const popular = await axios.get(popularAnimeUrl);
        const popularAnimeData = popular.data.data;

        const popularAnimeArray = popularAnimeData.slice(0, 20).map(anime => ({
            mal_id: anime.mal_id,
            mal_url: anime.url,
            images: [
                anime.images.jpg.image_url,
                anime.images.jpg.large_image_url,
                anime.trailer.images?.maximum_image_url || null
            ],
            trailer: {
                yt_id: anime.trailer.youtube_id,
                yt_url: anime.trailer.url,
                embed_url: anime.trailer.embed_url
            },
            titles: {
                default_title: anime.title,
                japanese_title: anime.title_japanese,
                english_title: anime.title_english
            },
            episodes: anime.episodes,
            rating: anime.rating,
            type: anime.type,
            source: anime.source,
            status: anime.status,
            score: anime.score,
            rank: anime.rank,
            popularity: anime.popularity,
            synopsis: anime.synopsis,
            backgroud: anime.backgroud,
            season: anime.season,
            year: anime.year,
            genres: anime.genres.map(genre => genre.name),
            themes: anime.themes.map(theme => theme.name),
            demographics: anime.demographics.map(demographic => demographic.name),
            explicit_genres: anime.explicit_genres.map(genre => genre.name)
        }));

        response.send(popularAnimeArray);
    } catch (err) {
        handleError(err, response);
    }
});

/* =============================================== */
/*                  Upcoming anime                 */
/* =============================================== */
app.get("/upcoming/anime", async (request, response) => {
    try {
        const upcomingAnimeUrl = `${baseJikanUrl}/seasons/upcoming`;
        const upcoming = await axios.get(upcomingAnimeUrl);
        const upcomingAnimeData = upcoming.data.data;

        const upcomingAnimeArray = upcomingAnimeData.slice(0, 20).map(anime => ({
            mal_id: anime.mal_id,
            mal_url: anime.url,
            images: [
                anime.images.jpg.image_url,
                anime.images.jpg.large_image_url,
                anime.trailer.images?.maximum_image_url || null
            ],
            trailer: {
                yt_id: anime.trailer.youtube_id,
                yt_url: anime.trailer.url,
                embed_url: anime.trailer.embed_url
            },
            titles: {
                default_title: anime.title,
                japanese_title: anime.title_japanese,
                english_title: anime.title_english
            },
            episodes: anime.episodes,
            rating: anime.rating,
            type: anime.type,
            source: anime.source,
            status: anime.status,
            score: anime.score,
            rank: anime.rank,
            popularity: anime.popularity,
            synopsis: anime.synopsis,
            backgroud: anime.backgroud,
            season: anime.season,
            year: anime.year,
            genres: anime.genres.map(genre => genre.name),
            themes: anime.themes.map(theme => theme.name),
            demographics: anime.demographics.map(demographic => demographic.name),
            explicit_genres: anime.explicit_genres.map(genre => genre.name)
        }));

        response.send(upcomingAnimeArray);
    } catch (err) {
        handleError(err, response);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

/* ============================================ */
/*                 Handle Error                 */
/* ============================================ */
function handleError(err, response) {
    if (err.response) {
        logger.error(`API Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
        response.status(err.response.status).send("Error fetching data from API.");
    } else if (err.request) {
        logger.error('No response received from API:', err.request);
        response.status(500).send("No response received from API.");
    } else {
        logger.error(`Error: ${err.message}`);
        response.status(500).send("Internal Server Error.");
    }
}
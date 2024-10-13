import express from "express";
import axios from "axios";
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express(); 
app.use(cors()); 
const PORT = process.env.PORT || 5000;

const imageUrl = "https://image.tmdb.org/t/p/w500";
const baseJikanUrl = "https://api.jikan.moe/v4";

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
        console.error("Error fetching trending movies:", err);
        response.status(500).send("Error fetching trending movies.");
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
        console.error("Error fetching trending tv:", err);
        response.status(500).send("Error fetching trending tv.");
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
        console.error("Error fetching popular movies:", err);
        response.status(500).send("Error fetching popular movies.");
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
        console.error("Error fetching upcoming movies:", err);
        response.status(500).send("Error fetching upcoming movies.");
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
app.get("/trending-anime", async (request, response) => {
    try {
        const trendingAnimeUrl = `${baseJikanUrl}/seasons/now`;
        const trending = await axios.get(trendingAnimeUrl);
        const trendingAnimeData = trending.data.data;

        const trendingAnimeArray = trendingAnimeData.slice(0, 20).map(anime => ({
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

        response.send(trendingAnimeArray);
    } catch (err) {
        console.error("Error fetching trending anime:", err);
        response.status(500).send("Error fetching trending anime.");
    }
});

/* =============================================== */
/*                  Popular anime                  */
/* =============================================== */
app.get("/popular-anime", async (request, response) => {
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
        console.error("Error fetching popular anime:", err);
        response.status(500).send("Error fetching popular anime.");
    }
});

/* =============================================== */
/*                  Upcoming anime                 */
/* =============================================== */
app.get("/upcoming-anime", async (request, response) => {
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
        console.error("Error fetching popular anime:", err);
        response.status(500).send("Error fetching popular anime.");
    }
});

app.get("/search-anime", async (request, response) => {
    const query = request.query.q; // Get the search query from the query parameters
    console.log(`Searching for anime: ${query}`);
    // Replace with the actual Kitsu API call
    response.send(`Search results for anime: ${query}`);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

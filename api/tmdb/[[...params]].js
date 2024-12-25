import axios from "axios";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const CACHE_DURATION = 3600; // 1 hour

const tmdbConfig = {
  headers: {
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    accept: "application/json",
  },
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Extract path and query parameters
    const params = req.query.params || [];
    const tmdbPath = params.join("/");
    const queryString = new URLSearchParams(req.query).toString();
    const cacheKey = `tmdb:${tmdbPath}:${queryString}`;

    // Check cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Make request to TMDB
    const tmdbUrl = `https://api.themoviedb.org/3/${tmdbPath}?${queryString}`;
    const response = await axios.get(tmdbUrl, tmdbConfig);

    // Cache the response
    await redis.setex(cacheKey, CACHE_DURATION, JSON.stringify(response.data));

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
}

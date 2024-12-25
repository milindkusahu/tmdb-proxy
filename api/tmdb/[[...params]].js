import { Redis } from "@upstash/redis";
import axios from "axios";

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
    // Get the full path from the URL
    const path = req.url.replace("/api/tmdb/", "");
    const queryString = new URLSearchParams(req.query).toString();
    const cacheKey = `tmdb:${path}:${queryString}`;

    // Check cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Make request to TMDB
    const tmdbUrl = `https://api.themoviedb.org/3/${path}?${queryString}`;
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

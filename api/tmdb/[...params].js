import { Redis } from "@upstash/redis";
import axios from "axios";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Get the path from the URL by removing '/api/tmdb/'
    const fullPath = req.url.split("/api/tmdb/")[1];
    const [pathPart, queryPart] = fullPath.split("?");

    // Create query string
    const queryParams = queryPart ? `?${queryPart}` : "";

    // Create TMDB URL
    const tmdbUrl = `https://api.themoviedb.org/3/${pathPart}${queryParams}`;

    console.log("TMDB URL:", tmdbUrl);

    // Check cache
    const cacheKey = `tmdb:${pathPart}${queryParams}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      // Check if cached data is a string
      if (typeof cachedData === "string") {
        try {
          const parsedData = JSON.parse(cachedData);
          return res.status(200).json(parsedData);
        } catch (error) {
          console.error("Error parsing cached data:", error);
        }
      } else {
        console.error("Cached data is not a string:", cachedData);
      }
    }

    // Make request to TMDB
    const response = await axios.get(tmdbUrl, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    // Cache the response
    await redis.setex(cacheKey, 3600, JSON.stringify(response.data));

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
}

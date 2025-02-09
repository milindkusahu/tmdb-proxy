import axios from "axios";

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization");

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

    // Make request to TMDB
    const response = await axios.get(tmdbUrl, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
}

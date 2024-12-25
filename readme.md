# TMDB Proxy

This project is a simple proxy server that allows you to access the TMDB (The Movie Database) API from regions where it might be blocked by network providers, such as Jio in India.

## Overview

The TMDB Proxy is a serverless function deployed on Vercel that acts as a middleman between your application and the TMDB API. It fetches data from the TMDB API and caches the responses in Redis for faster subsequent requests. This proxy server can be used in any application that needs to access the TMDB API, such as movie or TV show applications.

## Features

- **Unblocks TMDB API**: Allows access to the TMDB API from regions where it might be blocked by network providers.
- **Caching**: Caches API responses in Redis for faster subsequent requests.
- **Serverless**: Deployed as a serverless function on Vercel, eliminating the need for server management.
- **CORS Support**: Adds CORS headers to allow cross-origin requests from your application.

## Getting Started

To use this proxy server in your application, simply make requests to the deployed Vercel URL instead of directly accessing the TMDB API. The URL structure follows the same pattern as the TMDB API:

```
https://your-vercel-project.vercel.app/api/tmdb/[...params]
```

Replace `your-vercel-project.vercel.app` with the actual URL of your deployed Vercel project, and `[...params]` with the desired TMDB API endpoint and query parameters.

For example, to fetch popular movies, you would make a request to:

```
https://your-vercel-project.vercel.app/api/tmdb/movie/popular
```

## Deployment

To deploy your own instance of the TMDB Proxy, follow these steps:

1. Clone this repository to your local machine.
2. Install the required dependencies by running `npm install`.
3. Set up environment variables for `TMDB_ACCESS_TOKEN`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` in your Vercel project settings or a local `.env` file.
4. Deploy the project to Vercel using the `vercel` CLI or the Vercel dashboard.

## Environment Variables

This project requires the following environment variables:

- `TMDB_ACCESS_TOKEN`: An access token for the TMDB API. You can obtain one by creating an account on [TMDB](https://www.themoviedb.org/) and requesting an API key.
- `UPSTASH_REDIS_REST_URL`: The URL for your Upstash Redis instance. You can create a free Redis instance on [Upstash](https://upstash.com/).
- `UPSTASH_REDIS_REST_TOKEN`: The token for your Upstash Redis instance.

Set these environment variables in your Vercel project settings or create a local `.env` file with the following format:

```
TMDB_ACCESS_TOKEN=your_tmdb_access_token
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

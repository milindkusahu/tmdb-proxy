import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import handler from "./api/tmdb/[...params].js";

// Mock TMDB API responses
const server = setupServer(
  http.get("https://api.themoviedb.org/3/movie/550", () => {
    return HttpResponse.json({
      id: 550,
      title: "Fight Club",
      original_title: "Fight Club",
      overview: "A ticking-time-bomb insomniac...",
    });
  })
);

// Mock environment variables
process.env.TMDB_ACCESS_TOKEN = "test-token";

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("TMDB Proxy Handler", () => {
  it("should proxy GET requests to TMDB API", async () => {
    // Mock request and response objects
    const req = {
      method: "GET",
      url: "/api/tmdb/movie/550",
      headers: {},
    };

    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      end: vi.fn(),
    };

    // Call the handler
    await handler(req, res);

    // Verify CORS headers were set
    expect(res.setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Origin",
      "*"
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Methods",
      "GET, OPTIONS"
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Headers",
      "Authorization"
    );

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 550,
        title: "Fight Club",
      })
    );
  });

  it("should handle OPTIONS requests", async () => {
    const req = {
      method: "OPTIONS",
      url: "/api/tmdb/movie/550",
      headers: {},
    };

    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  it("should handle API errors", async () => {
    // Mock an error response from TMDB
    server.use(
      http.get("https://api.themoviedb.org/3/movie/999999", () => {
        return new HttpResponse(null, {
          status: 404,
          statusText: "Not Found",
        });
      })
    );

    const req = {
      method: "GET",
      url: "/api/tmdb/movie/999999",
      headers: {},
    };

    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String),
      })
    );
  });
});

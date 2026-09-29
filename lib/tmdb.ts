import "server-only";

// TMDB (themoviedb.org) is the film catalogue behind search and film pages.
// Every call happens on the server, so the key never reaches the browser.

const API = "https://api.themoviedb.org/3";
const IMAGES = "https://image.tmdb.org/t/p";

// Film metadata barely changes, so one TMDB round trip per hour is plenty.
const REVALIDATE_SECONDS = 60 * 60;

export const tmdbConfigured = Boolean(process.env.TMDB_API_KEY);

export type FilmSummary = {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
};

export type FilmDetail = FilmSummary & {
  tagline: string;
  runtime: number | null;
  backdrop_path: string | null;
  genres: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  credits: {
    cast: { id: number; name: string; character: string; order: number }[];
    crew: { id: number; name: string; job: string }[];
  };
};

type Page<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

async function tmdb<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;

  const url = new URL(`${API}${path}`);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }

  // TMDB hands out two credentials: a short v3 "API key" (sent as a query
  // parameter) and a long v4 "read access token" (a JWT, sent as a bearer
  // header). Accept whichever one was pasted in.
  const headers: HeadersInit = { accept: "application/json" };
  if (key.startsWith("eyJ")) {
    headers.authorization = `Bearer ${key}`;
  } else {
    url.searchParams.set("api_key", key);
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`TMDB ${path} responded ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function searchFilms(query: string, page = 1) {
  return tmdb<Page<FilmSummary>>("/search/movie", {
    query,
    page: String(page),
    include_adult: "false",
    language: "en-US",
  });
}

export async function trendingFilms() {
  return tmdb<Page<FilmSummary>>("/trending/movie/week", {
    language: "en-US",
  });
}

export async function getFilm(id: number) {
  return tmdb<FilmDetail>(`/movie/${id}`, {
    append_to_response: "credits",
    language: "en-US",
  });
}

export function posterUrl(path: string | null, size: "w185" | "w342" | "w500") {
  return path ? `${IMAGES}/${size}${path}` : null;
}

export function backdropUrl(path: string | null) {
  return path ? `${IMAGES}/w1280${path}` : null;
}

export function releaseYear(film: Pick<FilmSummary, "release_date">) {
  return film.release_date ? film.release_date.slice(0, 4) : null;
}

export function directorsOf(film: FilmDetail) {
  return film.credits.crew
    .filter((person) => person.job === "Director")
    .map((person) => person.name);
}

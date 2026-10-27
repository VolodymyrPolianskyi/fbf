import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmDiary } from "@/components/film-diary";
import { SiteHeader, TmdbCredit } from "@/components/site-header";
import {
  backdropUrl,
  directorsOf,
  getFilm,
  posterUrl,
  releaseYear,
  tmdbConfigured,
  type FilmDetail,
} from "@/lib/tmdb";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// Resolves the route to a film, or to null when TMDB is not set up or down.
// A missing film is a 404 either way.
async function loadFilm(params: Params) {
  const { id } = await params;
  const filmId = Number(id);
  if (!Number.isInteger(filmId) || filmId <= 0) notFound();

  if (!tmdbConfigured) return null;

  let film: FilmDetail | null;
  try {
    film = await getFilm(filmId);
  } catch (error) {
    console.error("[framebyframe] TMDB request failed:", error);
    return null;
  }

  if (!film) notFound();
  return film;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const film = await loadFilm(params);
  if (!film) return { title: "Film — framebyframe" };

  const year = releaseYear(film);
  return {
    title: `${film.title}${year ? ` (${year})` : ""} — framebyframe`,
    description: film.overview || undefined,
  };
}

function formatRuntime(minutes: number | null) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${rest}m` : `${rest}m`;
}

function listNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

export default async function FilmPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const film = await loadFilm(params);
  const { log } = await searchParams;

  return (
    <main className="grain relative min-h-dvh overflow-hidden">
      {film ? <Backdrop path={film.backdrop_path} /> : null}

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-10 sm:px-10">
        <SiteHeader />

        {film ? (
          <FilmBody film={film} logStatus={typeof log === "string" ? log : undefined} />
        ) : (
          <section className="flex-1 py-20">
            <p className="max-w-xl rounded-2xl border border-edge bg-ink-soft/70 p-6 text-sm leading-relaxed text-haze">
              {tmdbConfigured
                ? "The film catalogue didn’t answer. Try again in a moment."
                : "The film catalogue isn’t connected yet — see SETUP.md."}
            </p>
          </section>
        )}

        <footer className="border-t border-edge pt-6">
          <TmdbCredit />
        </footer>
      </div>
    </main>
  );
}

// The film's own still, dimmed and faded into the page like a screen seen
// from the back row.
function Backdrop({ path }: { path: string | null }) {
  const src = backdropUrl(path);
  if (!src) return <div aria-hidden="true" className="projector absolute inset-0" />;

  return (
    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[70vh]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-linear-to-b from-ink/40 via-ink/80 to-ink" />
    </div>
  );
}

function FilmBody({
  film,
  logStatus,
}: {
  film: FilmDetail;
  logStatus?: string;
}) {
  const poster = posterUrl(film.poster_path, "w500");
  const year = releaseYear(film);
  const directors = directorsOf(film);
  const runtime = formatRuntime(film.runtime);
  const cast = film.credits.cast
    .toSorted((a, b) => a.order - b.order)
    .slice(0, 8);

  const facts = [
    runtime && { label: "Runtime", value: runtime },
    film.genres.length > 0 && {
      label: film.genres.length === 1 ? "Genre" : "Genres",
      value: film.genres.map((genre) => genre.name).join(", "),
    },
    film.production_countries.length > 0 && {
      label: "Country",
      value: film.production_countries.map((country) => country.name).join(", "),
    },
    film.original_title !== film.title && {
      label: "Original title",
      value: film.original_title,
    },
    film.vote_average > 0 && {
      label: "TMDB rating",
      value: `${film.vote_average.toFixed(1)} / 10`,
    },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact));

  return (
    <article className="flex-1 py-14 sm:py-20">
      <Link
        href="/search"
        className="text-sm text-haze transition hover:text-paper"
      >
        &larr; Back to films
      </Link>

      <div className="mt-8 grid gap-10 sm:grid-cols-[220px_1fr] md:grid-cols-[280px_1fr]">
        <div className="mx-auto w-full max-w-[280px] sm:mx-0">
          <div className="aspect-[2/3] overflow-hidden rounded-xl border border-edge bg-ink-soft shadow-2xl shadow-black/60">
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt={`Poster for ${film.title}`} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center p-6 text-center font-display text-2xl italic text-haze">
                {film.title}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            {film.title}
            {year ? (
              <span className="ml-3 font-display text-3xl font-normal italic text-amber sm:text-4xl">
                {year}
              </span>
            ) : null}
          </h1>

          {directors.length > 0 ? (
            <p className="mt-4 text-lg text-haze">
              Directed by{" "}
              <span className="text-paper">{listNames(directors)}</span>
            </p>
          ) : null}

          {film.tagline ? (
            <p className="mt-8 font-display text-xl italic text-paper/90">
              &ldquo;{film.tagline}&rdquo;
            </p>
          ) : null}

          {film.overview ? (
            <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-haze">
              {film.overview}
            </p>
          ) : null}

          {facts.length > 0 ? (
            <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 border-t border-edge pt-6 sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-haze/80">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm text-paper">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {cast.length > 0 ? (
            <section className="mt-10 max-w-2xl border-t border-edge pt-6">
              <h2 className="text-[11px] uppercase tracking-[0.14em] text-haze/80">
                Cast
              </h2>
              <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {cast.map((person) => (
                  <li key={person.id} className="text-sm">
                    <span className="text-paper">{person.name}</span>
                    {person.character ? (
                      <span className="text-haze"> as {person.character}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <FilmDiary filmId={film.id} status={logStatus} />
        </div>
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { FilmCard } from "@/components/film-card";
import { SiteHeader, TmdbCredit } from "@/components/site-header";
import {
  searchFilms,
  tmdbConfigured,
  trendingFilms,
  type FilmSummary,
} from "@/lib/tmdb";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function readParams(params: Awaited<SearchParams>) {
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Number(params.page) || 1);
  return { q, page };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { q } = readParams(await searchParams);
  return {
    title: q ? `“${q}” — framebyframe` : "Find a film — framebyframe",
  };
}

async function loadFilms(q: string, page: number) {
  try {
    const result = q ? await searchFilms(q, page) : await trendingFilms();
    return { result, failed: false };
  } catch (error) {
    // TMDB being down should cost us the results, not the page.
    console.error("[framebyframe] TMDB request failed:", error);
    return { result: null, failed: true };
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, page } = readParams(await searchParams);
  const { result, failed } = tmdbConfigured
    ? await loadFilms(q, page)
    : { result: null, failed: false };

  // TMDB caps search at 500 pages however many results it reports.
  const totalPages = Math.min(result?.total_pages ?? 1, 500);

  return (
    <main className="projector grain relative min-h-dvh overflow-hidden">
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-10 sm:px-10">
        <SiteHeader />

        <section className="pt-14 sm:pt-20">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-amber">
            Reel 02 &middot; The catalogue
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            Find a{" "}
            <span className="font-display italic font-normal text-amber">
              film
            </span>
          </h1>

          <form action="/search" className="mt-8 flex max-w-2xl gap-2">
            <label htmlFor="q" className="sr-only">
              Film title
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search by title — Stalker, Paddington 2, Aftersun…"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-full border border-edge bg-ink-soft/80 px-5 py-3 text-[15px] placeholder:text-haze/60 focus:border-amber focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-paper px-6 py-3 text-[15px] font-medium text-ink transition hover:bg-white"
            >
              Search
            </button>
          </form>
        </section>

        <section className="flex-1 py-12">
          {!tmdbConfigured ? (
            <Notice>
              The film catalogue isn&rsquo;t connected yet. Add{" "}
              <code className="text-paper">TMDB_API_KEY</code> to the
              environment &mdash; see SETUP.md.
            </Notice>
          ) : failed ? (
            <Notice>
              The film catalogue didn&rsquo;t answer. Try again in a moment.
            </Notice>
          ) : result && result.results.length > 0 ? (
            <>
              <p className="mb-6 text-sm text-haze">
                {q
                  ? `${result.total_results.toLocaleString("en-US")} ${
                      result.total_results === 1 ? "film" : "films"
                    } matching “${q}”`
                  : "Trending this week"}
              </p>
              <FilmGrid films={result.results} />
              {q && totalPages > 1 ? (
                <Pager q={q} page={page} totalPages={totalPages} />
              ) : null}
            </>
          ) : (
            <Notice>
              Nothing matches &ldquo;{q}&rdquo;. Try the original title, or
              fewer words.
            </Notice>
          )}
        </section>

        <footer className="border-t border-edge pt-6">
          <TmdbCredit />
        </footer>
      </div>
    </main>
  );
}

function FilmGrid({ films }: { films: FilmSummary[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {films.map((film) => (
        <li key={film.id}>
          <FilmCard film={film} />
        </li>
      ))}
    </ul>
  );
}

function Pager({
  q,
  page,
  totalPages,
}: {
  q: string;
  page: number;
  totalPages: number;
}) {
  const href = (target: number) =>
    `/search?${new URLSearchParams({ q, page: String(target) })}`;
  const linkClass =
    "rounded-full border border-edge px-4 py-2 transition hover:border-amber hover:text-amber";

  return (
    <nav className="mt-12 flex items-center justify-center gap-4 text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClass}>
          &larr; Previous
        </Link>
      ) : null}
      <span className="text-haze">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={linkClass}>
          Next &rarr;
        </Link>
      ) : null}
    </nav>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-xl rounded-2xl border border-edge bg-ink-soft/70 p-6 text-sm leading-relaxed text-haze">
      {children}
    </p>
  );
}

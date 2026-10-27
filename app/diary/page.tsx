import type { Metadata } from "next";
import Link from "next/link";
import { deleteEntry } from "@/app/diary/actions";
import { SignInButton } from "@/components/sign-in-button";
import { SiteHeader, TmdbCredit } from "@/components/site-header";
import { getDiary, getUser, stars, type DiaryEntry } from "@/lib/diary";
import { supabaseConfigured } from "@/lib/supabase/server";
import { posterUrl } from "@/lib/tmdb";

export const metadata: Metadata = {
  title: "Your diary — framebyframe",
};

// Entries arrive newest first, so months come out in the same order.
function byMonth(entries: DiaryEntry[]) {
  const months = new Map<string, DiaryEntry[]>();
  for (const entry of entries) {
    const key = entry.watched_on.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), entry]);
  }
  return [...months];
}

function monthLabel(key: string) {
  return new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function summarise(entries: DiaryEntry[]) {
  const year = new Date().getUTCFullYear().toString();
  const rated = entries.filter((entry) => entry.rating);
  const average = rated.length
    ? rated.reduce((sum, entry) => sum + entry.rating!, 0) / rated.length / 2
    : null;

  return [
    { label: "Films logged", value: String(entries.length) },
    {
      label: `In ${year}`,
      value: String(entries.filter((e) => e.watched_on.startsWith(year)).length),
    },
    {
      label: "Distinct films",
      value: String(new Set(entries.map((entry) => entry.film_id)).size),
    },
    { label: "Average rating", value: average ? `${average.toFixed(1)} ★` : "—" },
  ];
}

export default async function DiaryPage() {
  const user = await getUser();
  const entries = user ? await getDiary() : null;

  return (
    <main className="projector grain relative min-h-dvh overflow-hidden">
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-4xl flex-col px-6 py-10 sm:px-10">
        <SiteHeader />

        <section className="flex-1 pt-14 pb-16 sm:pt-20">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-amber">
            Reel 03 &middot; The diary
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            Your{" "}
            <span className="font-display italic font-normal text-amber">
              diary
            </span>
          </h1>

          {!user ? (
            <div className="mt-8 flex max-w-xl flex-col gap-5">
              <p className="leading-relaxed text-haze">
                Every film you log lands here, by the day you watched it. Sign
                in with Google to start yours.
              </p>
              <SignInButton
                configured={supabaseConfigured}
                next="/diary"
                label="Sign in to see your diary"
              />
            </div>
          ) : entries === null ? (
            <p className="mt-8 max-w-xl rounded-2xl border border-edge bg-ink-soft/70 p-6 text-sm leading-relaxed text-haze">
              Your diary didn&rsquo;t load. Try again in a moment.
            </p>
          ) : entries.length === 0 ? (
            <div className="mt-8 max-w-xl rounded-2xl border border-edge bg-ink-soft/70 p-6">
              <p className="leading-relaxed text-haze">
                Nothing logged yet. Find a film you&rsquo;ve seen and press{" "}
                <span className="text-paper">Log it</span>.
              </p>
              <Link
                href="/search"
                className="mt-5 inline-block rounded-full bg-amber px-5 py-2 text-sm font-medium text-ink transition hover:bg-paper"
              >
                Find a film
              </Link>
            </div>
          ) : (
            <>
              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-y border-edge py-6 sm:grid-cols-4">
                {summarise(entries).map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-[11px] uppercase tracking-[0.14em] text-haze/80">
                      {stat.label}
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-paper">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {byMonth(entries).map(([month, monthEntries]) => (
                <section key={month} className="mt-12">
                  <h2 className="font-display text-2xl italic text-amber">
                    {monthLabel(month)}
                  </h2>
                  <ol className="mt-4 divide-y divide-edge border-t border-edge">
                    {monthEntries.map((entry) => (
                      <DiaryRow key={entry.id} entry={entry} />
                    ))}
                  </ol>
                </section>
              ))}
            </>
          )}
        </section>

        <footer className="border-t border-edge pt-6">
          <TmdbCredit />
        </footer>
      </div>
    </main>
  );
}

function DiaryRow({ entry }: { entry: DiaryEntry }) {
  const poster = posterUrl(entry.poster_path, "w185");

  return (
    <li className="flex items-center gap-4 py-3">
      <span className="w-8 shrink-0 text-right text-2xl font-semibold tabular-nums text-haze">
        {Number(entry.watched_on.slice(8, 10))}
      </span>

      <Link
        href={`/film/${entry.film_id}`}
        className="group flex min-w-0 flex-1 items-center gap-4"
      >
        <span className="h-15 w-10 shrink-0 overflow-hidden rounded border border-edge bg-ink-soft">
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : null}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium group-hover:text-amber">
            {entry.title}
            {entry.release_year ? (
              <span className="ml-2 font-normal text-haze">{entry.release_year}</span>
            ) : null}
          </span>
          <span className="block text-sm">
            {entry.rating ? (
              <span className="text-amber">{stars(entry.rating)}</span>
            ) : (
              <span className="text-haze/70">Unrated</span>
            )}
            {entry.rewatch ? <span className="ml-3 text-haze">rewatch</span> : null}
          </span>
        </span>
      </Link>

      <form action={deleteEntry}>
        <input type="hidden" name="id" value={entry.id} />
        <input type="hidden" name="back" value="/diary" />
        <button
          type="submit"
          aria-label={`Remove ${entry.title} on ${entry.watched_on}`}
          className="text-[13px] text-haze underline-offset-4 hover:text-paper hover:underline"
        >
          Remove
        </button>
      </form>
    </li>
  );
}

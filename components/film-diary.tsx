import Link from "next/link";
import { deleteEntry, logFilm } from "@/app/diary/actions";
import { SignInButton } from "@/components/sign-in-button";
import { RATINGS, getFilmEntries, getUser, stars, today } from "@/lib/diary";
import { supabaseConfigured } from "@/lib/supabase/server";

const STATUS: Record<string, { text: string; tone: "ok" | "bad" }> = {
  saved: { text: "Logged. It’s in your diary.", tone: "ok" },
  baddate: { text: "That date doesn’t work — pick a day up to today.", tone: "bad" },
  signin: { text: "Sign in first, then log it again.", tone: "bad" },
  failed: { text: "Couldn’t save that. Try again in a moment.", tone: "bad" },
};

const fieldClass =
  "rounded-lg border border-edge bg-ink px-3 py-2 text-sm text-paper outline-none focus:border-amber/70";

// The "I watched this" panel on a film page: a log form plus every earlier
// viewing of this film from the signed-in person's diary.
export async function FilmDiary({
  filmId,
  status,
}: {
  filmId: number;
  status?: string;
}) {
  const user = await getUser();
  const entries = user ? await getFilmEntries(filmId) : null;
  const notice = status ? STATUS[status] : undefined;
  const here = `/film/${filmId}`;

  return (
    <section
      id="diary"
      className="mt-10 max-w-2xl scroll-mt-10 rounded-2xl border border-edge bg-ink-soft/70 p-6"
    >
      <h2 className="text-[11px] uppercase tracking-[0.14em] text-haze/80">
        Your diary
      </h2>

      {notice ? (
        <p
          role="status"
          className={`mt-3 text-sm ${notice.tone === "ok" ? "text-amber" : "text-paper"}`}
        >
          {notice.text}
        </p>
      ) : null}

      {!user ? (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-haze">
            Sign in to log this film with the day you watched it and a rating.
          </p>
          <SignInButton
            configured={supabaseConfigured}
            next={`${here}#diary`}
            label="Sign in to log it"
          />
        </div>
      ) : (
        <>
          <form
            action={logFilm}
            className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-4"
          >
            <input type="hidden" name="film_id" value={filmId} />

            <label className="flex flex-col gap-1.5 text-[13px] text-haze">
              Watched on
              <input
                type="date"
                name="watched_on"
                required
                defaultValue={today()}
                max={today()}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-[13px] text-haze">
              Rating
              <select name="rating" defaultValue="" className={fieldClass}>
                <option value="">No rating</option>
                {RATINGS.map((value) => (
                  <option key={value} value={value}>
                    {stars(value)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 pb-2 text-sm text-haze">
              <input
                type="checkbox"
                name="rewatch"
                defaultChecked={Boolean(entries?.length)}
                className="h-4 w-4 accent-amber"
              />
              Rewatch
            </label>

            <button
              type="submit"
              className="rounded-full bg-amber px-5 py-2 text-sm font-medium text-ink transition hover:bg-paper"
            >
              Log it
            </button>
          </form>

          {entries && entries.length > 0 ? (
            <ul className="mt-6 divide-y divide-edge border-t border-edge">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <span className="text-paper">
                    {formatDay(entry.watched_on)}
                    {entry.rating ? (
                      <span className="ml-3 text-amber">{stars(entry.rating)}</span>
                    ) : null}
                    {entry.rewatch ? (
                      <span className="ml-3 text-haze">rewatch</span>
                    ) : null}
                  </span>
                  <form action={deleteEntry}>
                    <input type="hidden" name="id" value={entry.id} />
                    <input type="hidden" name="back" value={`${here}#diary`} />
                    <button
                      type="submit"
                      className="text-[13px] text-haze underline-offset-4 hover:text-paper hover:underline"
                    >
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : null}

          <Link
            href="/diary"
            className="mt-5 inline-block text-sm text-haze underline-offset-4 hover:text-paper hover:underline"
          >
            Open your diary &rarr;
          </Link>
        </>
      )}
    </section>
  );
}

function formatDay(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

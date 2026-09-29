import Link from "next/link";
import { posterUrl, releaseYear, type FilmSummary } from "@/lib/tmdb";

export function FilmCard({ film }: { film: FilmSummary }) {
  const poster = posterUrl(film.poster_path, "w342");
  const year = releaseYear(film);

  return (
    <Link href={`/film/${film.id}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-edge bg-ink-soft">
        {poster ? (
          // TMDB already serves each poster at the size we ask for, so there
          // is nothing for next/image to optimise.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] group-hover:opacity-90"
          />
        ) : (
          <div className="grid h-full place-items-center p-3 text-center font-display text-lg italic text-haze">
            {film.title}
          </div>
        )}
      </div>
      <p className="mt-2.5 line-clamp-2 text-sm font-medium leading-snug group-hover:text-amber">
        {film.title}
      </p>
      {year ? <p className="mt-0.5 text-[13px] text-haze">{year}</p> : null}
    </Link>
  );
}

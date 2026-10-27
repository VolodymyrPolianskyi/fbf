import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="grid h-7 w-7 place-items-center rounded-[7px] border border-edge bg-ink-soft"
      >
        <span className="h-2 w-2 rounded-[2px] bg-amber" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        framebyframe
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4">
      <Logo />
      <nav className="flex items-center gap-5 text-sm">
        <Link href="/search" className="text-haze transition hover:text-paper">
          Films
        </Link>
        <Link href="/diary" className="text-haze transition hover:text-paper">
          Diary
        </Link>
      </nav>
    </header>
  );
}

// TMDB's terms ask every app using the API to say so.
export function TmdbCredit() {
  return (
    <p className="text-[12px] leading-relaxed text-haze/70">
      Film data and images from{" "}
      <a
        href="https://www.themoviedb.org/"
        className="underline underline-offset-4 hover:text-paper"
      >
        TMDB
      </a>
      . framebyframe uses the TMDB API but is not endorsed or certified by
      TMDB.
    </p>
  );
}

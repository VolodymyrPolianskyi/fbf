import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function FilmNotFound() {
  return (
    <main className="projector grain relative min-h-dvh overflow-hidden">
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-10 sm:px-10">
        <SiteHeader />
        <section className="flex flex-1 flex-col justify-center py-20">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-amber">
            Missing reel
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            That film isn&rsquo;t in the catalogue.
          </h1>
          <Link
            href="/search"
            className="mt-8 w-fit rounded-full bg-paper px-6 py-3 text-[15px] font-medium text-ink transition hover:bg-white"
          >
            Search for another
          </Link>
        </section>
      </div>
    </main>
  );
}

import { SiteHeader } from "@/components/site-header";

// Poster-shaped placeholders while TMDB answers.
export default function Loading() {
  return (
    <main className="projector relative min-h-dvh">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <SiteHeader />
        <div className="mt-14 h-10 w-64 animate-pulse rounded-lg bg-ink-soft sm:mt-20" />
        <div className="mt-8 h-12 max-w-2xl animate-pulse rounded-full bg-ink-soft" />
        <ul className="mt-16 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <li
              key={i}
              className="aspect-[2/3] animate-pulse rounded-lg border border-edge bg-ink-soft"
            />
          ))}
        </ul>
      </div>
    </main>
  );
}

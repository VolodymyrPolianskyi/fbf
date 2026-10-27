"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { today } from "@/lib/diary";
import { safePath } from "@/lib/safe-path";
import { getFilm, releaseYear, type FilmDetail } from "@/lib/tmdb";

function filmPath(filmId: number, status: string) {
  return `/film/${filmId}?log=${status}#diary`;
}

// Server Actions can be POSTed to directly, so everything from the form is
// treated as untrusted: the film is looked up again on TMDB rather than taking
// its title from the page, and the database checks ownership through RLS.
export async function logFilm(formData: FormData) {
  const filmId = Number(formData.get("film_id"));
  if (!Number.isInteger(filmId) || filmId <= 0) redirect("/search");
  if (!supabaseConfigured) redirect(filmPath(filmId, "failed"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(filmPath(filmId, "signin"));

  const watchedOn = String(formData.get("watched_on") ?? "");
  const validDate =
    /^\d{4}-\d{2}-\d{2}$/.test(watchedOn) &&
    !Number.isNaN(Date.parse(watchedOn)) &&
    watchedOn >= "1888-01-01" &&
    watchedOn <= today();
  if (!validDate) redirect(filmPath(filmId, "baddate"));

  const ratingValue = Number(formData.get("rating"));
  const rating =
    Number.isInteger(ratingValue) && ratingValue >= 1 && ratingValue <= 10
      ? ratingValue
      : null;

  let film: FilmDetail | null = null;
  try {
    film = await getFilm(filmId);
  } catch (error) {
    console.error("[framebyframe] TMDB request failed:", error);
  }
  if (!film) redirect(filmPath(filmId, "failed"));

  const year = releaseYear(film);
  const { error } = await supabase.from("diary_entries").insert({
    film_id: film.id,
    title: film.title,
    release_year: year ? Number(year) : null,
    poster_path: film.poster_path,
    watched_on: watchedOn,
    rating,
    rewatch: formData.get("rewatch") === "on",
  });

  if (error) {
    console.error("[framebyframe] could not log film:", error);
    redirect(filmPath(filmId, "failed"));
  }

  revalidatePath("/diary");
  revalidatePath(`/film/${filmId}`);
  redirect(filmPath(filmId, "saved"));
}

export async function deleteEntry(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const back = safePath(formData.get("back")?.toString(), "/diary");
  if (!supabaseConfigured || !id) redirect(back);

  // RLS limits the delete to the caller's own rows; anyone else's id is a
  // no-op rather than an error.
  const supabase = await createClient();
  const { error } = await supabase.from("diary_entries").delete().eq("id", id);
  if (error) console.error("[framebyframe] could not delete entry:", error);

  revalidatePath("/diary");
  redirect(back);
}

import "server-only";
import { unstable_rethrow } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

// The diary: every film a signed-in person has logged, newest viewing first.
// Row-level security in supabase/schema.sql keeps each diary private to its
// owner, so these queries never filter by user themselves.

export type DiaryEntry = {
  id: string;
  film_id: number;
  title: string;
  release_year: number | null;
  poster_path: string | null;
  watched_on: string;
  rating: number | null;
  rewatch: boolean;
};

const COLUMNS =
  "id, film_id, title, release_year, poster_path, watched_on, rating, rewatch";

// The signed-in user, or null when signed out, unconfigured or unreachable.
export async function getUser() {
  if (!supabaseConfigured) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    unstable_rethrow(error);
    console.error("[framebyframe] could not read session:", error);
    return null;
  }
}

async function selectEntries(filmId?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("diary_entries")
    .select(COLUMNS)
    .order("watched_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (filmId !== undefined) query = query.eq("film_id", filmId);

  const { data, error } = await query;
  if (error) {
    console.error("[framebyframe] could not read diary:", error);
    return null;
  }
  return data as DiaryEntry[];
}

export function getDiary() {
  return selectEntries();
}

export function getFilmEntries(filmId: number) {
  return selectEntries(filmId);
}

// Today in Poland, where framebyframe is made, as YYYY-MM-DD. Used as the
// default viewing date; the form lets people change it.
export function today() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Warsaw" });
}

// Ratings are half stars stored as 1-10.
export function stars(rating: number) {
  return "★".repeat(Math.floor(rating / 2)) + (rating % 2 ? "½" : "");
}

export const RATINGS = Array.from({ length: 10 }, (_, i) => i + 1);

import { createClient } from "@/lib/supabase/server";
import { SignInButton } from "@/components/sign-in-button";
import { SignOutButton } from "@/components/sign-out-button";

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const perks = [
  {
    title: "Founding member badge",
    body: "A permanent mark on your profile. Only handed out before launch.",
  },
  {
    title: "Your handle, reserved",
    body: "First in line for the username you actually want.",
  },
  {
    title: "Pro features, free",
    body: "Full stats, custom lists and no ads for your first year.",
  },
];

const roadmap = [
  { label: "Diary & ratings", status: "Building" },
  { label: "Lists and reviews", status: "Next" },
  { label: "Year in review stats", status: "Planned" },
];

async function getSession() {
  if (!configured) return { user: null, member: null };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { user: null, member: null };

    const { data: member } = await supabase
      .from("early_access")
      .select("member_number, full_name")
      .eq("id", user.id)
      .maybeSingle();

    return { user, member };
  } catch (error) {
    // A misconfigured or unreachable Supabase must never take the landing page
    // down — the whole point of this page is that it is always up.
    console.error("[framebyframe] could not read session:", error);
    return { user: null, member: null };
  }
}

function FilmRail({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 hidden w-9 border-edge bg-ink-soft/50 lg:block ${
        side === "left" ? "left-0 border-r" : "right-0 border-l"
      }`}
    >
      <div className="sprockets mx-auto h-full w-3.5" />
    </div>
  );
}

export default async function Home() {
  const { user, member } = await getSession();
  const name =
    member?.full_name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email;
  const avatar = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <main className="projector grain relative min-h-dvh overflow-hidden">
      <FilmRail side="left" />
      <FilmRail side="right" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10 sm:px-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid h-7 w-7 place-items-center rounded-[7px] border border-edge bg-ink-soft"
            >
              <span className="h-2 w-2 rounded-[2px] bg-amber" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              framebyframe
            </span>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-ink-soft/70 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-haze">
            <span className="blink h-1.5 w-1.5 rounded-full bg-amber" />
            Work in progress
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16 sm:py-24">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-amber">
            Reel 01 &middot; In development
          </p>

          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            A diary for everything
            <br />
            you watch,{" "}
            <span className="font-display italic font-normal text-amber">
              frame by frame
            </span>
            .
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-haze sm:text-lg">
            We&rsquo;re still in the cutting room. framebyframe will let you log
            every film you see, rate it, write it up, and watch a year of your
            taste take shape. Nothing is live yet &mdash; but the door is open
            early.
          </p>

          <div className="mt-10">
            {user ? (
              <div className="rounded-2xl border border-edge bg-ink-soft/70 p-6">
                <div className="flex items-center gap-4">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatar}
                      alt=""
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full border border-edge"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      You&rsquo;re on the list, {name}.
                    </p>
                    <p className="text-sm text-haze">
                      {member?.member_number
                        ? `Founding member #${member.member_number}`
                        : "Founding member"}{" "}
                      &middot; we&rsquo;ll email you the moment it opens.
                    </p>
                  </div>
                </div>

                <ul className="mt-6 grid gap-3 border-t border-edge pt-5 sm:grid-cols-3">
                  {perks.map((perk) => (
                    <li key={perk.title}>
                      <p className="text-sm font-medium text-paper">
                        {perk.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-haze">
                        {perk.body}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t border-edge pt-4">
                  <SignOutButton />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <SignInButton configured={configured} />
                <p className="max-w-md text-sm leading-relaxed text-haze">
                  Create your account now and you keep a{" "}
                  <span className="text-paper">founding member</span> badge,
                  first pick of usernames, and a year of pro features on the
                  house.
                </p>
              </div>
            )}
          </div>
        </section>

        <footer className="border-t border-edge pt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {roadmap.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm">
                <span className="text-haze">{item.label}</span>
                <span className="rounded-full border border-edge px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-haze/80">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] text-haze/70">
            &copy; {new Date().getFullYear()} framebyframe &middot; built in the
            open
          </p>
        </footer>
      </div>
    </main>
  );
}

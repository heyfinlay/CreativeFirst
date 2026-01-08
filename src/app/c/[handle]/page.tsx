import Link from "next/link";
import { notFound } from "next/navigation";
import { normalizeHandle } from "@/lib/creator-public-profiles";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PlatformEntry = {
  platform?: string;
  handle?: string;
  followers?: number | null;
  verified?: boolean;
};

type PortfolioEntry = {
  platform?: string;
  title?: string;
  thumb_url?: string;
  link_url?: string;
};

const statLabels: Array<[string, string]> = [
  ["avg_views", "Avg views"],
  ["engagement", "Engagement %"],
  ["turnaround", "Turnaround (days)"],
  ["ugc_delivered", "UGC delivered"],
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-AU").format(value);
}

export default async function CreatorPublicPage({
  params,
  searchParams,
}: {
  params: { handle: string };
  searchParams?: { request?: string };
}) {
  const normalized = normalizeHandle(params.handle);
  const supabase = createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("creator_public_profiles")
    .select("*")
    .eq("handle", normalized)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const tags = Array.isArray(profile.tags) ? profile.tags : [];
  const stats = typeof profile.stats === "object" && profile.stats ? profile.stats : {};
  const platforms = Array.isArray(profile.platforms)
    ? profile.platforms.filter(isRecord)
    : [];
  const prerequisites =
    typeof profile.prerequisites === "object" && profile.prerequisites
      ? profile.prerequisites
      : {};
  const contentStyle = Array.isArray(profile.content_style)
    ? profile.content_style
    : [];
  const audience =
    typeof profile.audience === "object" && profile.audience ? profile.audience : {};
  const portfolio = Array.isArray(profile.portfolio)
    ? profile.portfolio.filter(isRecord)
    : [];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.15),_transparent_50%),radial-gradient(circle_at_20%_20%,_rgba(244,114,182,0.15),_transparent_40%),linear-gradient(180deg,_#050505_0%,_#0b0b0b_55%,_#050505_100%)]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="font-display text-xl text-white">
            Creator First
          </Link>
          <span className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70">
            /c/{profile.handle}
          </span>
        </nav>

        {searchParams?.request === "sent" ? (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            Collaboration request sent successfully.
          </div>
        ) : null}

        <section className="grid gap-8 lg:grid-cols-[1.4fr,0.9fr]">
          <div className="flex flex-col gap-8">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
              <div className="relative flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl bg-white/10">
                    {profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt={`${profile.display_name} avatar`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-white/50">
                        {profile.display_name?.slice(0, 2)?.toUpperCase() ?? "CF"}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="font-display text-3xl text-white">
                        {profile.display_name}
                      </h1>
                      <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">
                        @{profile.handle}
                      </span>
                      {profile.is_pro ? (
                        <span className="rounded-full bg-amber-300/20 px-3 py-1 text-xs text-amber-200">
                          PRO
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-white/70">
                      {profile.headline || "Creator open to collaborations."}
                    </p>
                  </div>
                </div>
                {profile.bio ? (
                  <p className="text-sm text-white/70">{profile.bio}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {tags.length > 0
                    ? tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70"
                        >
                          {tag}
                        </span>
                      ))
                    : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/c/${profile.handle}/collaborate`}
                    className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black"
                  >
                    Collaborate
                  </Link>
                  <button
                    type="button"
                    className="rounded-full border border-white/30 px-5 py-2 text-sm text-white/80"
                  >
                    Share profile
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {statLabels.map(([key, label]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                    {label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {formatNumber(stats[key as keyof typeof stats] as number | null)}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-display text-xl text-white">Platforms</h2>
              <div className="mt-4 grid gap-3">
                {platforms.length > 0 ? (
                  platforms.map((platform: PlatformEntry, index: number) => (
                    <div
                      key={`${platform.platform ?? "platform"}-${index}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {platform.platform || "Platform"}
                        </span>
                        {platform.handle ? (
                          <span className="text-white/60">
                            @{platform.handle}
                          </span>
                        ) : null}
                      </div>
                      <span>{formatNumber(platform.followers)} followers</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/60">
                    No platforms listed yet.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-display text-xl text-white">Portfolio</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {(
                  portfolio.length
                    ? portfolio.slice(0, 3)
                    : Array.from({ length: 3 }, () => null)
                ).map((item: PortfolioEntry | null, index: number) => (
                    <div
                      key={`portfolio-${index}`}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-4"
                    >
                      <div className="h-24 rounded-xl bg-white/10">
                        {item?.thumb_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.thumb_url}
                            alt={item.title || "Portfolio item"}
                            className="h-full w-full rounded-xl object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item?.title || "Campaign highlight"}
                        </p>
                        <p className="text-xs text-white/60">
                          {item?.platform || "Platform"}{" "}
                          {item?.link_url ? (
                            <Link
                              href={item.link_url}
                              className="text-white/80 underline"
                            >
                              View
                            </Link>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-display text-xl text-white">Prerequisites</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li>
                  Minimum budget:{" "}
                  <span className="text-white">
                    {formatNumber(prerequisites.min_budget_aud as number | null)}{" "}
                    AUD
                  </span>
                </li>
                <li>
                  Paid only:{" "}
                  <span className="text-white">
                    {prerequisites.paid_only ? "Yes" : "Flexible"}
                  </span>
                </li>
                <li>
                  Excluded categories:{" "}
                  <span className="text-white">
                    {Array.isArray(prerequisites.excluded_categories) &&
                    prerequisites.excluded_categories.length > 0
                      ? prerequisites.excluded_categories.join(", ")
                      : "None listed"}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-display text-xl text-white">How it works</h2>
              <ol className="mt-4 space-y-3 text-sm text-white/70">
                <li>Share your brief and target outcomes.</li>
                <li>Creator responds with timelines and deliverables.</li>
                <li>Approve the concept and kick off production.</li>
              </ol>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-display text-xl text-white">Content style</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {contentStyle.length > 0
                  ? contentStyle.map((style: string) => (
                      <span
                        key={style}
                        className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70"
                      >
                        {style}
                      </span>
                    ))
                  : (
                    <p className="text-sm text-white/60">
                      No style tags yet.
                    </p>
                  )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-display text-xl text-white">Audience</h2>
              <div className="mt-4 space-y-2 text-sm text-white/70">
                <p>
                  Age range:{" "}
                  <span className="text-white">
                    {audience.age_range || "Not specified"}
                  </span>
                </p>
                <p>
                  Gender skew:{" "}
                  <span className="text-white">
                    {audience.gender || "Not specified"}
                  </span>
                </p>
                <p>
                  Regions:{" "}
                  <span className="text-white">
                    {Array.isArray(audience.regions) && audience.regions.length > 0
                      ? audience.regions.join(", ")
                      : "Not specified"}
                  </span>
                </p>
                {audience.note ? (
                  <p className="text-white/60">{audience.note}</p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50">
          <span>Creator First • Built for brand-safe collaborations.</span>
          <span>Profile last updated {new Date(profile.updated_at).toLocaleDateString("en-AU")}</span>
        </footer>
      </div>
    </main>
  );
}

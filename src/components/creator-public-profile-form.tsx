"use client";

import { useState, useTransition } from "react";
import type {
  CreatorPublicProfileInput,
  PortfolioItem,
} from "@/lib/creator-public-profile-schema";

type HandleCheckResult = {
  ok: boolean;
  available: boolean;
  handle: string;
  message?: string;
};

type SaveResult = {
  ok: boolean;
  message?: string;
};

type CreatorPublicProfileFormProps = {
  initialProfile: CreatorPublicProfileInput;
  saveAction: (payload: CreatorPublicProfileInput) => Promise<SaveResult>;
  checkHandleAction: (handle: string) => Promise<HandleCheckResult>;
};

type PlatformEntryInput = {
  platform: string;
  handle: string;
  followers: string;
};

const emptyPlatform: PlatformEntryInput = {
  platform: "",
  handle: "",
  followers: "",
};

const emptyPortfolioItem: PortfolioItem = {
  platform: "",
  title: "",
  thumb_url: "",
  link_url: "",
};

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value: string) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export default function CreatorPublicProfileForm({
  initialProfile,
  saveAction,
  checkHandleAction,
}: CreatorPublicProfileFormProps) {
  const [handle, setHandle] = useState(initialProfile.handle);
  const [displayName, setDisplayName] = useState(initialProfile.display_name);
  const [headline, setHeadline] = useState(initialProfile.headline);
  const [bio, setBio] = useState(initialProfile.bio);
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url);
  const [tagsText, setTagsText] = useState(initialProfile.tags.join(", "));
  const [contentStyleText, setContentStyleText] = useState(
    initialProfile.content_style.join(", ")
  );
  const [excludedCategoriesText, setExcludedCategoriesText] = useState(
    initialProfile.prerequisites.excluded_categories?.join(", ") ?? ""
  );
  const [audienceRegionsText, setAudienceRegionsText] = useState(
    initialProfile.audience.regions?.join(", ") ?? ""
  );
  const [stats, setStats] = useState({
    avg_views: initialProfile.stats.avg_views?.toString() ?? "",
    engagement: initialProfile.stats.engagement?.toString() ?? "",
    turnaround: initialProfile.stats.turnaround?.toString() ?? "",
    ugc_delivered: initialProfile.stats.ugc_delivered?.toString() ?? "",
  });
  const [platforms, setPlatforms] = useState<PlatformEntryInput[]>(() => {
    if (initialProfile.platforms.length > 0) {
      return initialProfile.platforms.map((platform) => ({
        platform: platform.platform ?? "",
        handle: platform.handle ?? "",
        followers: platform.followers?.toString() ?? "",
      }));
    }
    return [{ ...emptyPlatform }];
  });
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => {
    if (initialProfile.portfolio.length >= 3) {
      return initialProfile.portfolio.slice(0, 3);
    }
    const items = [...initialProfile.portfolio];
    while (items.length < 3) {
      items.push({ ...emptyPortfolioItem });
    }
    return items;
  });
  const [prerequisites, setPrerequisites] = useState({
    min_budget_aud:
      initialProfile.prerequisites.min_budget_aud?.toString() ?? "",
    paid_only: initialProfile.prerequisites.paid_only ?? false,
  });
  const [audience, setAudience] = useState({
    age_range: initialProfile.audience.age_range ?? "",
    gender: initialProfile.audience.gender ?? "",
    note: initialProfile.audience.note ?? "",
  });
  const [handleStatus, setHandleStatus] = useState<HandleCheckResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const updatePlatform = (
    index: number,
    field: keyof PlatformEntryInput,
    value: string
  ) => {
    setPlatforms((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      )
    );
  };

  const updatePortfolio = (
    index: number,
    field: keyof PortfolioItem,
    value: string
  ) => {
    setPortfolioItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleCheck = () => {
    setHandleStatus(null);
    setError(null);
    startTransition(async () => {
      const result = await checkHandleAction(handle);
      setHandle(result.handle);
      setHandleStatus(result);
      if (!result.ok) {
        setError(result.message ?? "Unable to check handle.");
      }
    });
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const payload: CreatorPublicProfileInput = {
      handle,
      display_name: displayName,
      headline,
      bio,
      avatar_url: avatarUrl,
      tags: splitList(tagsText),
      stats: {
        avg_views: parseNumber(stats.avg_views),
        engagement: parseNumber(stats.engagement),
        turnaround: parseNumber(stats.turnaround),
        ugc_delivered: parseNumber(stats.ugc_delivered),
      },
      platforms: platforms
        .map((platform) => ({
          ...platform,
          followers: parseNumber(platform.followers),
        }))
        .filter(
          (platform) =>
            platform.platform.trim() ||
            platform.handle.trim() ||
            platform.followers !== null
        ),
      prerequisites: {
        min_budget_aud: parseNumber(prerequisites.min_budget_aud),
        paid_only: prerequisites.paid_only,
        excluded_categories: splitList(excludedCategoriesText),
      },
      content_style: splitList(contentStyleText),
      audience: {
        age_range: audience.age_range.trim(),
        gender: audience.gender.trim(),
        regions: splitList(audienceRegionsText),
        note: audience.note.trim(),
      },
      portfolio: portfolioItems
        .filter(
          (item) =>
            item.title.trim() ||
            item.platform.trim() ||
            item.thumb_url.trim() ||
            item.link_url.trim()
        )
        .map((item) => ({
          platform: item.platform.trim(),
          title: item.title.trim(),
          thumb_url: item.thumb_url.trim(),
          link_url: item.link_url.trim(),
        })),
      is_pro: initialProfile.is_pro,
    };

    startTransition(async () => {
      const result = await saveAction(payload);
      if (!result.ok) {
        setError(result.message ?? "Unable to save profile.");
        return;
      }
      setMessage("Public profile updated.");
    });
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8">
      <section className="grid gap-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft md:grid-cols-[2fr,1fr]">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
              Public link
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
                className="w-full max-w-xs rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900"
                placeholder="heyfinlay"
                required
              />
              <button
                type="button"
                onClick={handleCheck}
                disabled={isPending}
                className="rounded-full border border-ink-900/10 bg-white px-4 py-2 text-xs text-ink-700"
              >
                Check availability
              </button>
            </div>
            {handleStatus ? (
              <p
                className={`mt-2 text-xs ${
                  handleStatus.available ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {handleStatus.message}
              </p>
            ) : null}
            <a
              href={`/c/${handle}`}
              className="mt-3 inline-flex text-xs font-semibold text-ink-900 underline"
            >
              View public profile
            </a>
          </div>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Display name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Headline
            <input
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
              placeholder="UGC creator for premium lifestyle brands"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Bio
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={3}
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Avatar URL
            <input
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
              placeholder="https://"
            />
          </label>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-ink-900/10 bg-sand-50 px-4 py-4 text-xs text-ink-700">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
              Pro status
            </p>
            <p className="mt-2 text-sm text-ink-900">
              {initialProfile.is_pro ? "Pro active" : "Pro not enabled"}
            </p>
            <p className="mt-2 text-xs text-ink-600">
              Billing arrives later. This badge will appear publicly when enabled.
            </p>
          </div>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Tags (comma separated)
            <input
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Content style (comma separated)
            <input
              value={contentStyleText}
              onChange={(event) => setContentStyleText(event.target.value)}
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl text-ink-900">Stats</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["avg_views", "Avg views"],
              ["engagement", "Engagement %"],
              ["turnaround", "Turnaround (days)"],
              ["ugc_delivered", "UGC delivered"],
            ].map(([key, label]) => (
              <label key={key} className="flex flex-col gap-2 text-sm text-ink-700">
                {label}
                <input
                  value={stats[key as keyof typeof stats]}
                  onChange={(event) =>
                    setStats((prev) => ({ ...prev, [key]: event.target.value }))
                  }
                  className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
                />
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl text-ink-900">Prerequisites</h2>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Minimum budget (AUD)
            <input
              value={prerequisites.min_budget_aud}
              onChange={(event) =>
                setPrerequisites((prev) => ({
                  ...prev,
                  min_budget_aud: event.target.value,
                }))
              }
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={prerequisites.paid_only}
              onChange={(event) =>
                setPrerequisites((prev) => ({
                  ...prev,
                  paid_only: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-ink-900/20"
            />
            Paid collaborations only
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Excluded categories (comma separated)
            <input
              value={excludedCategoriesText}
              onChange={(event) => setExcludedCategoriesText(event.target.value)}
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink-900">Platforms</h2>
          <button
            type="button"
            onClick={() =>
              setPlatforms((prev) => [...prev, { ...emptyPlatform }])
            }
            className="rounded-full border border-ink-900/10 bg-white px-4 py-2 text-xs text-ink-700"
          >
            Add platform
          </button>
        </div>
        <div className="mt-4 grid gap-4">
          {platforms.map((platform, index) => (
            <div key={`platform-${index}`} className="grid gap-3 sm:grid-cols-3">
              <input
                value={platform.platform}
                onChange={(event) =>
                  updatePlatform(index, "platform", event.target.value)
                }
                className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900"
                placeholder="Platform"
              />
              <input
                value={platform.handle}
                onChange={(event) =>
                  updatePlatform(index, "handle", event.target.value)
                }
                className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900"
                placeholder="@handle"
              />
              <input
                value={platform.followers}
                onChange={(event) =>
                  updatePlatform(index, "followers", event.target.value)
                }
                className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900"
                placeholder="Followers"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl text-ink-900">Audience</h2>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Age range
            <input
              value={audience.age_range}
              onChange={(event) =>
                setAudience((prev) => ({ ...prev, age_range: event.target.value }))
              }
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Gender skew
            <input
              value={audience.gender}
              onChange={(event) =>
                setAudience((prev) => ({ ...prev, gender: event.target.value }))
              }
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Regions (comma separated)
            <input
              value={audienceRegionsText}
              onChange={(event) => setAudienceRegionsText(event.target.value)}
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Audience note
            <textarea
              value={audience.note}
              onChange={(event) =>
                setAudience((prev) => ({ ...prev, note: event.target.value }))
              }
              rows={2}
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl text-ink-900">Portfolio (3)</h2>
          {portfolioItems.map((item, index) => (
            <div key={`portfolio-${index}`} className="grid gap-3">
              <input
                value={item.title}
                onChange={(event) =>
                  updatePortfolio(index, "title", event.target.value)
                }
                className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900"
                placeholder="Title"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={item.platform}
                  onChange={(event) =>
                    updatePortfolio(index, "platform", event.target.value)
                  }
                  className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900"
                  placeholder="Platform"
                />
                <input
                  value={item.thumb_url}
                  onChange={(event) =>
                    updatePortfolio(index, "thumb_url", event.target.value)
                  }
                  className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900"
                  placeholder="Thumbnail URL"
                />
              </div>
              <input
                value={item.link_url}
                onChange={(event) =>
                  updatePortfolio(index, "link_url", event.target.value)
                }
                className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900"
                placeholder="Link URL"
              />
            </div>
          ))}
        </div>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-ink-700">{message}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save public profile"}
      </button>
    </form>
  );
}

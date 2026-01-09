"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { safeNextPath } from "@/lib/auth/redirect";

type Role = "creator" | "brand";

type ProfileSnapshot = {
  role: Role | "admin" | null;
  display_name: string | null;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  youtube_handle?: string | null;
};

type BrandSnapshot = {
  business_name: string;
  business_email: string;
  website: string;
} | null;

type ActionResult = { ok: boolean; message?: string; role?: Role };

type OnboardingFormProps = {
  initialProfile: ProfileSnapshot;
  initialBrand: BrandSnapshot;
  nextPath?: string | null;
  setRoleAction: (formData: FormData) => Promise<ActionResult>;
  saveBrandAction: (formData: FormData) => Promise<ActionResult>;
  saveCreatorAction: (formData: FormData) => Promise<ActionResult>;
};

export default function OnboardingForm({
  initialProfile,
  initialBrand,
  nextPath,
  setRoleAction,
  saveBrandAction,
  saveCreatorAction,
}: OnboardingFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(
    initialProfile.role === "brand" || initialProfile.role === "creator"
      ? initialProfile.role
      : "creator"
  );
  const [step, setStep] = useState(
    initialProfile.role === "brand" || initialProfile.role === "creator"
      ? 2
      : 1
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState(
    initialProfile.display_name ?? ""
  );
  const [instagram, setInstagram] = useState(
    initialProfile.instagram_handle ?? ""
  );
  const [tiktok, setTiktok] = useState(initialProfile.tiktok_handle ?? "");
  const [youtube, setYoutube] = useState(initialProfile.youtube_handle ?? "");

  const [businessName, setBusinessName] = useState(
    initialBrand?.business_name ?? ""
  );
  const [businessEmail, setBusinessEmail] = useState(
    initialBrand?.business_email ?? ""
  );
  const [website, setWebsite] = useState(initialBrand?.website ?? "");

  const handleRoleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.set("role", role);

    startTransition(async () => {
      const result = await setRoleAction(formData);
      if (!result.ok) {
        setError(result.message ?? "Unable to set role.");
        return;
      }

      setMessage("Role saved.");
      setStep(2);
    });
  };

  const handleDetailsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result =
        role === "brand"
          ? await saveBrandAction(formData)
          : await saveCreatorAction(formData);

      if (!result.ok) {
        setError(result.message ?? "Unable to save details.");
        return;
      }

      setMessage("Saved.");
      const fallbackTarget = role === "brand" ? "/app/brand" : "/app/creator";
      router.replace(safeNextPath(nextPath, fallbackTarget));
      router.refresh();
    });
  };

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft">
      <div>
        <h1 className="font-display text-2xl text-ink-900">
          {step === 1 ? "Choose your workspace" : "Complete your profile"}
        </h1>
        <p className="mt-2 text-sm text-ink-700">
          Update these details anytime in Settings.
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleRoleSubmit} className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {(["creator", "brand"] as Role[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
                  role === option
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-ink-900/10 bg-white text-ink-900"
                }`}
              >
                <p className="font-semibold capitalize">{option}</p>
                <p className="mt-1 text-xs opacity-80">
                  {option === "creator"
                    ? "Browse briefs and pitch brands."
                    : "Post contracts and review creators."}
                </p>
              </button>
            ))}
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-ink-700">{message}</p> : null}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleDetailsSubmit} className="grid gap-4">
          {role === "brand" ? (
            <>
              <label className="flex flex-col gap-2 text-sm text-ink-700">
                Business name
                <input
                  name="business_name"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-ink-700">
                Business email
                <input
                  name="business_email"
                  type="email"
                  value={businessEmail}
                  onChange={(event) => setBusinessEmail(event.target.value)}
                  className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-ink-700">
                Website
                <input
                  name="website"
                  type="url"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="https://example.com"
                  className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
                />
              </label>
            </>
          ) : (
            <>
              <label className="flex flex-col gap-2 text-sm text-ink-700">
                Display name
                <input
                  name="display_name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-ink-700">
                Instagram handle
                <input
                  name="instagram_handle"
                  value={instagram}
                  onChange={(event) => setInstagram(event.target.value)}
                  className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-ink-700">
                TikTok handle
                <input
                  name="tiktok_handle"
                  value={tiktok}
                  onChange={(event) => setTiktok(event.target.value)}
                  className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-ink-700">
                YouTube handle
                <input
                  name="youtube_handle"
                  value={youtube}
                  onChange={(event) => setYoutube(event.target.value)}
                  className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
                />
              </label>
            </>
          )}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-ink-700">{message}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save and continue"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-full border border-ink-900/20 bg-white px-6 py-3 text-sm font-semibold text-ink-900"
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

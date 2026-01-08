"use client";

import { useState, useTransition } from "react";

type CreatorSettingsFormProps = {
  initialDisplayName: string;
  initialInstagram: string;
  initialTiktok: string;
  initialYoutube: string;
  saveAction: (formData: FormData) => Promise<{ ok: boolean; message?: string }>;
};

export default function CreatorSettingsForm({
  initialDisplayName,
  initialInstagram,
  initialTiktok,
  initialYoutube,
  saveAction,
}: CreatorSettingsFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [instagram, setInstagram] = useState(initialInstagram);
  const [tiktok, setTiktok] = useState(initialTiktok);
  const [youtube, setYoutube] = useState(initialYoutube);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.set("display_name", displayName);
    formData.set("instagram_handle", instagram);
    formData.set("tiktok_handle", tiktok);
    formData.set("youtube_handle", youtube);

    startTransition(async () => {
      const result = await saveAction(formData);
      if (!result.ok) {
        setError(result.message ?? "Unable to save settings.");
        return;
      }
      setMessage("Settings saved.");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft"
    >
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
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-ink-700">{message}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";

type BrandSettingsFormProps = {
  initialBusinessName: string;
  initialBusinessEmail: string;
  initialWebsite: string;
  saveAction: (formData: FormData) => Promise<{ ok: boolean; message?: string }>;
};

export default function BrandSettingsForm({
  initialBusinessName,
  initialBusinessEmail,
  initialWebsite,
  saveAction,
}: BrandSettingsFormProps) {
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [businessEmail, setBusinessEmail] = useState(initialBusinessEmail);
  const [website, setWebsite] = useState(initialWebsite);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.set("business_name", businessName);
    formData.set("business_email", businessEmail);
    formData.set("website", website);

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

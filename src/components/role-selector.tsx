"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Role = "creator" | "brand";

export default function RoleSelector() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("creator");
  const [displayName, setDisplayName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    if (role === "brand") {
      if (!businessName.trim() || !website.trim() || !businessEmail.trim()) {
        setError("Add business name, website, and email to continue.");
        setLoading(false);
        return;
      }
    }

    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        role,
        display_name: displayName ? displayName : null,
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
      return;
    }

    if (role === "brand") {
      const { error: brandError } = await supabase.from("brands").upsert(
        {
          user_id: user.id,
          business_name: businessName.trim(),
          website: website.trim(),
          business_email: businessEmail.trim(),
        },
        { onConflict: "user_id" }
      );

      if (brandError) {
        setError(brandError.message);
        setLoading(false);
        return;
      }
    }

    router.replace(role === "creator" ? "/app/creator" : "/app/brand");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft"
    >
      <div>
        <h1 className="font-display text-2xl text-ink-900">
          Choose your path
        </h1>
        <p className="mt-2 text-sm text-ink-700">
          You can switch later, but we need to set up your first workspace.
        </p>
      </div>
      <label className="flex flex-col gap-2 text-sm text-ink-700">
        Display name
        <input
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Jordan Lee"
          className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
        />
      </label>
      {role === "brand" ? (
        <>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Business name
            <input
              type="text"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              placeholder="Brand Studio"
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Website
            <input
              type="url"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://"
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Business email
            <input
              type="email"
              value={businessEmail}
              onChange={(event) => setBusinessEmail(event.target.value)}
              placeholder="hello@brand.com"
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
        </>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {["creator", "brand"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setRole(option as Role)}
            className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
              role === option
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-ink-900/10 bg-white text-ink-900"
            }`}
          >
            <p className="font-semibold capitalize">{option}</p>
            <p className="mt-1 text-xs opacity-80">
              {option === "creator"
                ? "Browse contracts and pitch brands."
                : "Post contracts and hire creators."}
            </p>
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
}

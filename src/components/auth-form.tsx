"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handlePostAuth = async () => {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: user.id,
        role: null,
        display_name: null,
      });

      if (profileError) {
        setError(profileError.message);
        return;
      }
    }

    if (!profile?.role) {
      router.replace("/app/onboarding");
      return;
    }

    router.replace(profile.role === "creator" ? "/app/creator" : "/app/brand");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createBrowserSupabaseClient();

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (!data.session) {
          setMessage("Check your email to confirm your account.");
          return;
        }

        await handlePostAuth();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      await handlePostAuth();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft"
    >
      <div>
        <h1 className="font-display text-2xl text-ink-900">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-ink-700">
          {mode === "login"
            ? "Sign in to keep contracts moving."
            : "Join Creative First and choose your path."}
        </p>
      </div>
      <label className="flex flex-col gap-2 text-sm text-ink-700">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-ink-700">
        Password
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-ink-700">{message}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading
          ? "Please wait..."
          : mode === "login"
          ? "Sign in"
          : "Sign up"}
      </button>
    </form>
  );
}

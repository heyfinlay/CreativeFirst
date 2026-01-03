"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatCurrency } from "@/lib/format";

type ContractCardProps = {
  id: string;
  title: string;
  description: string;
  minValueCents: number;
  nicheTags: string[];
  platforms: string[];
  initiallySaved: boolean;
  initialApplicationStatus: "submitted" | "approved_to_bid" | "rejected" | null;
};

export default function ContractCard({
  id,
  title,
  description,
  minValueCents,
  nicheTags,
  platforms,
  initiallySaved,
  initialApplicationStatus,
}: ContractCardProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initiallySaved);
  const [saving, setSaving] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [pitch, setPitch] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState(
    initialApplicationStatus
  );

  const toggleSave = async () => {
    setSaving(true);
    const supabase = createBrowserSupabaseClient();

    if (saved) {
      await supabase.from("saved_contracts").delete().eq("contract_id", id);
      setSaved(false);
      setSaving(false);
      router.refresh();
      return;
    }

    const { error } = await supabase
      .from("saved_contracts")
      .insert({ contract_id: id });

    if (!error) {
      setSaved(true);
      router.refresh();
    }

    setSaving(false);
  };

  const submitApplication = async () => {
    if (!pitch.trim()) {
      setApplyError("Add a short pitch before submitting.");
      return;
    }

    setApplying(true);
    setApplyError(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("applications")
      .insert({ contract_id: id, pitch: pitch.trim() });

    if (error) {
      if (error.code === "23505") {
        setApplyError("You have already applied to this contract.");
      } else {
        setApplyError(error.message);
      }
      setApplying(false);
      return;
    }

    setApplicationStatus("submitted");
    setShowApply(false);
    setPitch("");
    setApplying(false);
    router.refresh();
  };

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft">
      <div>
        <h2 className="font-display text-xl text-ink-900">{title}</h2>
        <p className="mt-2 text-sm text-ink-700">{description}</p>
      </div>
      <div className="text-xs text-ink-700">
        <p>Minimum: {formatCurrency(minValueCents)}</p>
        <p>Tags: {nicheTags.length ? nicheTags.join(", ") : "—"}</p>
        <p>Platforms: {platforms.length ? platforms.join(", ") : "—"}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggleSave}
          disabled={saving}
          className="rounded-full border border-ink-900/20 bg-white px-4 py-2 text-xs font-semibold text-ink-900"
        >
          {saving ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setShowApply((prev) => !prev)}
          disabled={applicationStatus !== null}
          className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {applicationStatus ? "Applied" : "Apply"}
        </button>
        {applicationStatus ? (
          <span className="text-xs uppercase tracking-[0.2em] text-ink-700">
            {applicationStatus.replace(/_/g, " ")}
          </span>
        ) : null}
      </div>
      {showApply && !applicationStatus ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-ink-900/10 bg-white/90 p-4">
          <label className="flex flex-col gap-2 text-xs text-ink-700">
            Pitch
            <textarea
              rows={4}
              value={pitch}
              onChange={(event) => setPitch(event.target.value)}
              placeholder="Share your idea and timeline."
              className="rounded-xl border border-ink-900/10 bg-white px-3 py-2 text-sm text-ink-900"
            />
          </label>
          {applyError ? (
            <p className="text-xs text-red-600">{applyError}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={submitApplication}
              disabled={applying}
              className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {applying ? "Submitting..." : "Submit application"}
            </button>
            <button
              type="button"
              onClick={() => setShowApply(false)}
              className="rounded-full border border-ink-900/20 bg-white px-4 py-2 text-xs font-semibold text-ink-900"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

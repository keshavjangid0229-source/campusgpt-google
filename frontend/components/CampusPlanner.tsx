"use client";

import { useEffect, useState, type FormEvent } from "react";

type Entry = {
  id: string;
  title: string;
  date: string;
  details: string;
};

const emptyEntry: Entry = { id: "", title: "", date: "", details: "" };
const fieldClass = "w-full rounded-lg border border-[#a1efc725] bg-[#060d0b] px-3 py-2 text-sm";

export default function CampusPlanner({ kind }: { kind: "exam" | "notice" }) {
  const exam = kind === "exam";
  const label = exam ? "exam" : "notice";
  const storageKey = `campusgpt-${kind}-entries`;
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [draft, setDraft] = useState(emptyEntry);
  const [error, setError] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
        if (!Array.isArray(saved)) throw new Error("Invalid planner data");
        setEntries(saved.filter((entry) => entry && typeof entry.id === "string"
          && typeof entry.title === "string" && typeof entry.date === "string"
          && typeof entry.details === "string"));
      } catch {
        setError("Saved entries could not be loaded.");
        setEntries([]);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [storageKey]);

  function save(next: Entry[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setEntries(next);
      setError("");
      return true;
    } catch {
      setError("This browser could not save your changes.");
      return false;
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!entries || !draft.title.trim() || !draft.date) return;
    const entry = { ...draft, title: draft.title.trim(), details: draft.details.trim() };
    const next = draft.id
      ? entries.map((item) => item.id === draft.id ? entry : item)
      : [...entries, { ...entry, id: crypto.randomUUID() }];
    if (save(next)) setDraft(emptyEntry);
  }

  const sorted = [...(entries ?? [])].sort((a, b) =>
    exam ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
  );

  return (
    <div className="mt-6 grid max-w-5xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section aria-label={exam ? "Saved exams" : "Saved notices"} className="space-y-3">
        <p className="text-sm text-[#8fa69b]">
          {exam ? "Plan your exams and keep venue details handy." : "Save campus announcements and deadlines you want to track."}
          {" "}Entries are saved in this browser.
        </p>
        {entries === null && <p role="status">Loading saved entries…</p>}
        {entries?.length === 0 && <p className="rounded-xl border border-dashed border-[#a1efc725] p-5 text-sm">No {label}s saved yet.</p>}
        {sorted.map((entry) => (
          <article key={entry.id} className="rounded-xl border border-[#a1efc725] bg-[#10261f] p-4">
            <time dateTime={entry.date} className="text-xs text-[#a1efc7]">{entry.date}</time>
            <h2 className="mt-1 break-words font-semibold">{entry.title}</h2>
            {entry.details && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-[#8fa69b]">{entry.details}</p>}
            <div className="mt-3 flex gap-4 text-sm">
              <button type="button" onClick={() => setDraft(entry)} className="text-[#a1efc7]" aria-label={`Edit ${entry.title}`}>Edit</button>
              <button type="button" onClick={() => {
                if (save(sorted.filter((item) => item.id !== entry.id)) && draft.id === entry.id) setDraft(emptyEntry);
              }} className="text-red-300" aria-label={`Remove ${entry.title}`}>Remove</button>
            </div>
          </article>
        ))}
      </section>
      <form onSubmit={submit} className="space-y-3 rounded-xl border border-[#a1efc725] bg-[#10261f] p-4">
        <h2 className="font-semibold">{draft.id ? "Edit" : "Add"} {label}</h2>
        <label className="block space-y-1 text-sm">
          <span>{exam ? "Subject" : "Title"}</span>
          <input className={fieldClass} required maxLength={120} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </label>
        <label className="block space-y-1 text-sm">
          <span>{exam ? "Exam date" : "Notice date"}</span>
          <input className={fieldClass} type="date" required value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        </label>
        <label className="block space-y-1 text-sm">
          <span>{exam ? "Time, venue, or notes" : "Details or source link"}</span>
          <textarea className={fieldClass} rows={3} maxLength={1000} value={draft.details} onChange={(e) => setDraft({ ...draft, details: e.target.value })} />
        </label>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <div className="flex gap-3">
          <button disabled={!entries || !draft.title.trim() || !draft.date} className="rounded-lg bg-[#a1efc7] px-4 py-2 text-sm font-semibold text-[#060d0b] disabled:opacity-40">Save {label}</button>
          {draft.id && <button type="button" onClick={() => setDraft(emptyEntry)} className="text-sm">Cancel</button>}
        </div>
      </form>
    </div>
  );
}

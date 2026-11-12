"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ACCEPT } from "@/lib/media";
import { uploadFile } from "@/lib/upload-client";
import { createArchiveItem } from "./actions";

export function ArchiveForm() {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = new FormData(event.currentTarget);
      const file = fileInput.current?.files?.[0] ?? null;
      let path: string | null = null;
      if (file) {
        const uploaded = await uploadFile("archive", file);
        if (!uploaded.ok) {
          setError(uploaded.error);
          return;
        }
        path = uploaded.path;
      }
      const saved = await createArchiveItem({
        title: String(data.get("title") ?? ""),
        category: String(data.get("category") ?? ""),
        body: String(data.get("body") ?? ""),
        path,
        isPremium: data.get("is_premium") === "on",
        isPublished: data.get("is_published") === "on",
      });
      if (!saved.ok) {
        setError(saved.error);
        return;
      }
      form.current?.reset();
      router.refresh();
    } catch {
      setError("Das hat nicht geklappt. Bitte versuche es noch einmal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={form} className="card stack" onSubmit={onSubmit}>
      {error && <div className="card error" role="alert">{error}</div>}
      <label>
        Titel
        <input name="title" maxLength={120} required />
      </label>
      <label>
        Kategorie (optional)
        <input name="category" maxLength={60} placeholder="z. B. Geburtstag" />
      </label>
      <label>
        Text (optional, höchstens 2.000 Zeichen)
        <textarea name="body" maxLength={2000} />
      </label>
      <label>
        Bild, Audio oder Video (optional, höchstens 50 MB)
        <input ref={fileInput} type="file" accept={ACCEPT} />
      </label>
      <label className="check">
        <input type="checkbox" name="is_published" defaultChecked />
        Sofort veröffentlichen
      </label>
      <label className="check">
        <input type="checkbox" name="is_premium" />
        Nur für Abonnenten (Premium)
      </label>
      <div>
        <button disabled={busy}>{busy ? "Wird gespeichert …" : "Zum Archiv hinzufügen"}</button>
      </div>
    </form>
  );
}

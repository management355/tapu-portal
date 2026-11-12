"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ACCEPT } from "@/lib/media";
import { uploadFile } from "@/lib/upload-client";
import { createMessage } from "./actions";

export function MessageForm() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const file = fileInput.current?.files?.[0] ?? null;
      let path: string | null = null;
      if (file) {
        const uploaded = await uploadFile("user", file);
        if (!uploaded.ok) {
          setError(uploaded.error);
          return;
        }
        path = uploaded.path;
      }
      const saved = await createMessage({ body, path });
      if (!saved.ok) {
        setError(saved.error);
        return;
      }
      setBody("");
      if (fileInput.current) fileInput.current.value = "";
      router.refresh();
    } catch {
      setError("Das hat nicht geklappt. Bitte versuche es noch einmal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      {error && <div className="card error" role="alert">{error}</div>}
      <label>
        Text (optional, höchstens 2.000 Zeichen)
        <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} />
      </label>
      <label>
        Bild, Audio oder Video (optional, höchstens 50 MB)
        <input ref={fileInput} type="file" accept={ACCEPT} />
      </label>
      <div>
        <button disabled={busy}>{busy ? "Wird gespeichert …" : "Botschaft speichern"}</button>
      </div>
    </form>
  );
}

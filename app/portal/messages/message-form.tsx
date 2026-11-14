"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { ACCEPT, MAX_FILE_BYTES } from "@/lib/media";
import { clearDraft, readDraft } from "@/lib/draft";
import { uploadFile } from "@/lib/upload-client";
import { createMessage } from "./actions";

function megabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toLocaleString("de-DE", { maximumFractionDigits: 1 });
}

function subscribeNever() {
  return () => {};
}

export function MessageForm() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  // Text aus "Ausprobieren", falls dort einer geschrieben wurde. Bis zur ersten Eingabe zeigt
  // das Feld diesen Entwurf.
  const draft = useSyncExternalStore(subscribeNever, readDraft, () => "");
  const [typed, setTyped] = useState<string | null>(null);
  const body = typed ?? draft;
  const setBody = setTyped;
  const [file, setFile] = useState<File | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function replacePreview(url: string | null) {
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return url;
    });
  }

  function clearFile() {
    setFile(null);
    setRecorded(false);
    replacePreview(null);
    if (fileInput.current) fileInput.current.value = "";
    if (cameraInput.current) cameraInput.current.value = "";
  }

  function choose(next: File | null, fromCamera: boolean) {
    setError(null);
    if (!next) return;
    if (fromCamera && fileInput.current) fileInput.current.value = "";
    if (!fromCamera && cameraInput.current) cameraInput.current.value = "";
    setFile(next);
    setRecorded(fromCamera);
    replacePreview(fromCamera ? URL.createObjectURL(next) : null);
    if (next.size > MAX_FILE_BYTES) {
      setError(
        fromCamera
          ? `Das Video ist mit ${megabytes(next.size)} MB zu groß. Erlaubt sind höchstens 50 MB. Nimm es bitte kürzer auf, etwa 30 Sekunden.`
          : `Die Datei ist mit ${megabytes(next.size)} MB zu groß. Erlaubt sind höchstens 50 MB.`,
      );
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
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
      clearDraft();
      setBody("");
      clearFile();
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
      {typed === null && draft !== "" && (
        <div className="card notice" role="status">Dein Text aus „Ausprobieren“ ist übernommen. Wähle Foto, Audio oder Video hier noch einmal aus.</div>
      )}
      <label>
        Text (optional, höchstens 2.000 Zeichen)
        <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} />
      </label>

      <div className="stack">
        <div className="row">
          <button type="button" className="secondary" disabled={busy} onClick={() => cameraInput.current?.click()}>
            Video mit dem Handy aufnehmen
          </button>
          <input
            ref={cameraInput}
            type="file"
            accept="video/*"
            capture="user"
            hidden
            onChange={(e) => choose(e.target.files?.[0] ?? null, true)}
          />
        </div>
        <p className="muted small" style={{ margin: 0 }}>
          Öffnet auf dem Handy direkt die Kamera. Halte das Video kurz, etwa 30 Sekunden, damit es unter 50 MB bleibt.
          Am Rechner wählst du stattdessen eine Videodatei aus.
        </p>
      </div>

      <label>
        Oder Bild, Audio oder Video auswählen (optional, höchstens 50 MB)
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT}
          onChange={(e) => {
            const next = e.target.files?.[0] ?? null;
            if (next) choose(next, false);
            else clearFile();
          }}
        />
      </label>

      {file && recorded && (
        <div className="stack">
          {preview && <video className="media" src={preview} controls playsInline preload="metadata" style={{ margin: 0 }} />}
          <div className="row between">
            <span className="small">Aufgenommenes Video, {megabytes(file.size)} MB</span>
            <button type="button" className="secondary" disabled={busy} onClick={clearFile}>Verwerfen</button>
          </div>
        </div>
      )}

      <div>
        <button disabled={busy || (file !== null && file.size > MAX_FILE_BYTES)}>
          {busy ? "Wird gespeichert …" : "Botschaft speichern"}
        </button>
      </div>
    </form>
  );
}

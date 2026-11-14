"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ACCEPT, MAX_FILE_BYTES } from "@/lib/media";
import { saveDraft } from "@/lib/draft";
import { RotatableVideo } from "@/app/rotatable-video";
import { readVideoHint, type VideoHint } from "@/lib/video-rotation";

type Texts = {
  local: string; textLabel: string; fileLabel: string; record: string; remove: string; rotate: string; play: string;
  previewH: string; previewEmpty: string; saveH: string; saveP: string; save: string; haveAccount: string;
  carry: string; tooBig: string;
};

type Picked = { url: string; kind: "image" | "audio" | "video"; tooBig: boolean };

// Vorschau einer Botschaft, bevor es ein Konto gibt. Die Datei wird nur als lokaler
// Verweis im Browser geöffnet und verlässt das Gerät nicht.
export function TryIt({ t }: { t: Texts }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [picked, setPicked] = useState<Picked | null>(null);
  const [hint, setHint] = useState<VideoHint | null>(null);

  function choose(file: File | null) {
    setHint(null);
    if (file?.type.startsWith("video/")) void readVideoHint(file).then(setHint);
    setPicked((old) => {
      if (old) URL.revokeObjectURL(old.url);
      if (!file) return null;
      const kind = file.type.startsWith("image/") ? "image" : file.type.startsWith("audio/") ? "audio" : file.type.startsWith("video/") ? "video" : null;
      if (!kind) return null;
      return { url: URL.createObjectURL(file), kind, tooBig: file.size > MAX_FILE_BYTES };
    });
  }

  function clear() {
    choose(null);
    if (fileInput.current) fileInput.current.value = "";
    if (cameraInput.current) cameraInput.current.value = "";
  }

  function keep(target: string) {
    saveDraft(body);
    router.push(target);
  }

  const empty = body.trim() === "" && !picked;

  return (
    <>
      <div className="card try-local" role="note">{t.local}</div>
      <div className="try-grid">
        <div className="card stack">
          <label>
            {t.textLabel}
            <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} />
          </label>
          <div className="row">
            <button type="button" className="secondary" onClick={() => cameraInput.current?.click()}>{t.record}</button>
            <input ref={cameraInput} type="file" accept="video/*" capture="user" hidden onChange={(event) => choose(event.target.files?.[0] ?? null)} />
          </div>
          <label>
            {t.fileLabel}
            <input ref={fileInput} type="file" accept={ACCEPT} onChange={(event) => choose(event.target.files?.[0] ?? null)} />
          </label>
          {picked && <div><button type="button" className="secondary" onClick={clear}>{t.remove}</button></div>}
          {picked?.tooBig && <div className="card error" role="alert">{t.tooBig}</div>}
        </div>

        <div className="try-preview" aria-live="polite">
          <div className="try-preview-label">{t.previewH}</div>
          <div className="try-phone">
            <div className="scan-logo">taPu</div>
            {empty && <p className="muted">{t.previewEmpty}</p>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {picked?.kind === "image" && <img className="media" src={picked.url} alt="" />}
            {picked?.kind === "video" && <RotatableVideo key={picked.url} src={picked.url} rotation={hint?.rotation ?? 0} rotateLabel={t.rotate} playLabel={t.play} />}
            {picked?.kind === "audio" && <audio className="media" src={picked.url} controls preload="metadata" />}
            {body.trim() !== "" && <p className="message-body">{body}</p>}
          </div>
        </div>
      </div>

      <div className="card stack try-save">
        <h2>{t.saveH}</h2>
        <p>{t.saveP}</p>
        <div className="row">
          <button type="button" onClick={() => keep("/login?ansicht=neu&next=%2Fportal%2Fmessages")}>{t.save}</button>
          <Link className="button secondary" href="/login?next=%2Fportal%2Fmessages" onClick={() => saveDraft(body)}>{t.haveAccount}</Link>
        </div>
        <p className="muted small" style={{ margin: 0 }}>{t.carry}</p>
      </div>
    </>
  );
}

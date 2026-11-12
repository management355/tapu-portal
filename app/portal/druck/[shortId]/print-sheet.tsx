"use client";

import { useState } from "react";

const SIZES = [
  { cm: 3, name: "3 cm (Sticker)" },
  { cm: 5, name: "5 cm (Karte, Geschenk)" },
  { cm: 8, name: "8 cm (Aushang)" },
  { cm: 15, name: "15 cm (Plakat)" },
];

export function PrintSheet({ qrSrc, label, link }: { qrSrc: string; label: string; link: string }) {
  const [cm, setCm] = useState(5);
  const [count, setCount] = useState(1);
  const [showLink, setShowLink] = useState(false);

  return (
    <>
      <div className="card stack no-print">
        <div className="row">
          <label style={{ flex: "1 1 12rem" }}>
            Größe
            <select value={cm} onChange={(e) => setCm(Number(e.target.value))}>
              {SIZES.map((size) => (
                <option key={size.cm} value={size.cm}>{size.name}</option>
              ))}
            </select>
          </label>
          <label style={{ flex: "1 1 8rem" }}>
            Anzahl auf dem Blatt
            <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[1, 2, 4, 6, 12].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="check">
          <input type="checkbox" checked={showLink} onChange={(e) => setShowLink(e.target.checked)} />
          Adresse unter dem Code mitdrucken
        </label>
        <div>
          <button type="button" onClick={() => window.print()}>Drucken</button>
        </div>
        <p className="muted small" style={{ margin: 0 }}>
          Im Druckdialog „Tatsächliche Größe“ bzw. 100 % wählen, damit die Größe stimmt.
        </p>
      </div>

      <div className="print-sheet">
        {Array.from({ length: count }, (_, index) => (
          <div className="print-label" key={index} style={{ width: `${cm}cm`, fontSize: `${cm / 5}cm` }}>
            <div className="print-logo">taPu</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt={`QR-Code ${label}`} />
            <div className="print-code">{label}</div>
            {showLink && <div className="print-link">{link}</div>}
          </div>
        ))}
      </div>
    </>
  );
}

// Kurze Ladeanzeige beim Wechsel zwischen Seiten, statt eines leeren Bildschirms.
export default function Loading() {
  return (
    <main className="loading" role="status" aria-live="polite">
      <div className="loading-dot" aria-hidden="true" />
      <p>Einen Moment …</p>
    </main>
  );
}

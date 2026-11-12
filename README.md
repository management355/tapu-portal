# Tapu Portal

Portal für Knöpfe mit hinterlegten Botschaften: Antippen (NFC) oder Scannen (QR) öffnet `/q/<Kennung>` und zeigt, was der Besitzer hinterlegt hat.

## Stand

- Anmelden und Registrieren mit E-Mail und Passwort
- Knopf übernehmen, eigene Codes anlegen, Ziel aus dem Archiv wählen
- QR-Code je Code
- Öffentliche Scan-Seite mit Zählung der Aufrufe

Noch nicht enthalten: Uploads, Admin-Bereich, Abo-Zahlung, Zugangscode.

## Einrichtung bei Vercel

Unter „Settings → Environment Variables" drei Angaben eintragen:

| Name | Wert |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Projekt-Adresse aus Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Schlüssel „publishable" aus Supabase |
| `SUPABASE_SECRET_KEY` | Schlüssel „secret" aus Supabase. Geheim halten. |

Danach in Supabase unter „Authentication → URL Configuration" die Vercel-Adresse als „Site URL" eintragen und `https://<adresse>/auth/callback` als „Redirect URL" hinzufügen.

## Lokal starten

```bash
cp .env.example .env.local   # Werte eintragen
npm install
npm run dev
```

## Aufbau

- `app/q/[shortId]` Scan-Seite (öffentlich)
- `app/portal` Nutzerbereich
- `app/login`, `app/auth` Anmeldung
- `lib/supabase` Verbindung zur Datenbank
- `proxy.ts` frischt die Anmeldung auf

Die Datenbank (Tabellen und Zugriffsregeln) liegt in Supabase und wird dort über Migrationen gepflegt.

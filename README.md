# mad-osc

Eine **PWA zur Steuerung von MadMapper via OSC** – mit Editor zum Bauen eigener
Layouts (Raster + Snap), gängigen Bedienelementen (Fader, Buttons, XY-Pad,
Colorpicker, Dropdown, Label), nutzbar auf **Handy und Laptop**. Inspiriert von
TouchOSC und Open Stage Control.

> **Warum eine Bridge?** Browser können kein rohes UDP sprechen, MadMapper hört
> aber auf OSC über UDP. Deshalb startet ein kleiner Node-Server („Bridge"), der
> WebSocket ⇄ UDP übersetzt **und** die PWA gleich mit ausliefert. Ein Prozess,
> kein Extra-Setup.

## Schnellstart

Voraussetzung: [Node.js](https://nodejs.org) 18+ (inkl. npm).

```bash
git clone <repo-url> mad-osc
cd mad-osc
./start.sh
```

Das Skript installiert Abhängigkeiten (beim ersten Mal), baut die PWA und
startet die Bridge. Im Terminal erscheint dann:

```
  mad-osc bridge is running.
  Laptop : http://localhost:8080
  Phone  : http://192.168.x.y:8080   (scan the QR below)

  █▀▀▀▀▀█ ▀▄ ▄ █▀▀▀▀▀█
  █ ███ █ ▀█▀█ █ ███ █      <- mit dem Handy scannen
  ...
```

- **Laptop:** `http://localhost:8080` im Browser öffnen.
- **Handy:** den **QR-Code scannen** (gleiches WLAN) – die GUI öffnet sich direkt.
  In der GUI gibt es oben rechts auch einen **QR-Button**, um den Code am
  Laptop-Bildschirm zu zeigen und vom Handy abzuscannen.

Die PWA ist **installierbar** (Browser-Menü → „Zum Startbildschirm hinzufügen" /
„Installieren") und läuft dann wie eine native App im Vollbild.

## MadMapper einrichten

1. In MadMapper: **Preferences → OSC** aktivieren.
2. Ports prüfen – Standard:
   - MadMapper **Input** (wir senden dorthin): `8000`
   - MadMapper **Output/Feedback** (wir hören dort): `9000`
3. Läuft MadMapper auf einem **anderen Rechner** als die Bridge:
   ```bash
   MADMAPPER_HOST=192.168.1.50 ./start.sh
   ```

OSC-Adressen vergibst du pro Element im Editor (Inspector → „OSC Address"),
z. B. `/surfaces/Quad 1/opacity` oder `/surfaces/Quad 1/visible`.

## Bedienung

- **Edit / Run** (oben rechts): Im *Edit*-Modus baust du das Layout (Elemente aus
  der Palette links hinzufügen, ziehen, skalieren, im Inspector rechts
  konfigurieren). Im *Run*-Modus ist das Layout gesperrt und sendet OSC.
- **Raster + Snap:** Elemente rasten ins Gitter ein. Es gibt eigene Anordnungen
  für **Laptop** (breit) und **Handy** (schmal) – einfach das Fenster
  verkleinern bzw. am Handy öffnen und dort umsortieren.
- **Layouts:** mehrere Layouts und mehrere Seiten pro Layout. **Export/Import**
  als JSON-Datei; gespeichert wird lokal im Browser (IndexedDB).

## Konfiguration (Umgebungsvariablen)

| Variable         | Default     | Bedeutung                                  |
|------------------|-------------|--------------------------------------------|
| `HTTP_PORT`      | `8080`      | Port für PWA + WebSocket                    |
| `MADMAPPER_HOST` | `127.0.0.1` | Host, auf dem MadMapper läuft               |
| `OSC_OUT_PORT`   | `8000`      | MadMapper-Input-Port (wir senden dorthin)   |
| `OSC_IN_PORT`    | `9000`      | MadMapper-Feedback-Port (wir hören dort)    |

## Entwicklung

```bash
npm install
npm run dev     # Vite-Dev-Server (App) + Bridge parallel
```

Vite läuft auf `http://localhost:5173` und proxyt `/ws` an die Bridge (`:8080`).

```
mad-osc/
├─ start.sh                 # Build + Start in einem Schritt
├─ packages/
│  ├─ app/                  # PWA (React + TS + Vite + Tailwind)
│  └─ bridge/               # Node: WebSocket ⇄ UDP-OSC Relay + statischer Server
```

## Troubleshooting

- **Verbindungspunkt rot** (oben rechts): Bridge läuft nicht oder falscher Host.
  Auf dem Handy in der Verbindungsleiste die **Laptop-IP** und Port `8080`
  eintragen (am Laptop reicht `self`).
- **QR führt ins Leere:** Handy und Laptop müssen im **selben WLAN** sein; manche
  Gäste-/Firmennetze blockieren Geräte-zu-Geräte-Verbindungen.
- **MadMapper reagiert nicht:** OSC in MadMapper aktiviert? Ports stimmen? Bei
  entferntem Rechner `MADMAPPER_HOST` gesetzt?

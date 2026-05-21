import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useConnectionStore } from '../store/connectionStore';

export function QrButton() {
  const [open, setOpen] = useState(false);
  const lanUrl = useConnectionStore((s) => s.lanUrl);
  // Fall back to the current page URL (works when opened via the bridge).
  const url = lanUrl ?? window.location.origin;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Open on phone"
        className="rounded border border-edge bg-surface px-2.5 py-1.5 text-xs text-zinc-300 hover:border-accent hover:text-accent"
      >
        QR
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex flex-col items-center gap-3 rounded-lg border border-edge bg-panel p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-semibold text-zinc-200">Open on your phone</h2>
            <div className="rounded bg-white p-3">
              <QRCodeSVG value={url} size={200} />
            </div>
            <p className="font-mono text-xs text-zinc-400">{url}</p>
            <p className="max-w-[220px] text-center text-[11px] text-zinc-500">
              Scan with your phone (same Wi-Fi). The control surface opens in the browser
              and is installable as an app.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-1 rounded bg-accent px-4 py-1.5 text-sm font-medium text-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { useConnectionStore } from '../store/connectionStore';

const dot: Record<string, string> = {
  connected: 'bg-accent',
  connecting: 'bg-yellow-400',
  disconnected: 'bg-danger',
};

export function ConnectionBar() {
  const { config, status, setConfig, connect, disconnect } = useConnectionStore();
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState(config.host);
  const [port, setPort] = useState(config.port);

  // Auto-connect on first mount.
  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = () => {
    setConfig({ host, port });
    disconnect();
    setTimeout(connect, 50);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded border border-edge bg-surface px-3 py-1.5 text-xs text-zinc-300"
      >
        <span className={`h-2 w-2 rounded-full ${dot[status]}`} />
        <span className="font-mono">
          {config.host === 'self' ? 'bridge' : config.host}:{config.port}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-64 rounded border border-edge bg-panel p-3 shadow-xl">
          <p className="mb-2 text-[11px] text-zinc-500">
            Bridge host (use <span className="font-mono">self</span> when served by the bridge,
            or the laptop's LAN IP from a phone).
          </p>
          <input
            className="mb-2 w-full rounded bg-black/40 px-2 py-1 text-sm font-mono text-zinc-100 ring-1 ring-edge"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="self or 192.168.1.20"
          />
          <input
            type="number"
            className="mb-2 w-full rounded bg-black/40 px-2 py-1 text-sm font-mono text-zinc-100 ring-1 ring-edge"
            value={port}
            onChange={(e) => setPort(Number(e.target.value))}
          />
          <button
            onClick={apply}
            className="w-full rounded bg-accent px-2 py-1 text-sm font-medium text-black"
          >
            Connect
          </button>
        </div>
      )}
    </div>
  );
}

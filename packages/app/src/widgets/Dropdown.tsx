import type { Widget } from '../types';
import { oscClient } from '../osc/client';

export function Dropdown({ widget, interactive }: { widget: Widget; interactive: boolean }) {
  const options = widget.osc.options ?? [];

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!interactive) return;
    const value = Number(e.target.value);
    oscClient.send(widget.osc.address, [{ type: 'f', value }]);
  };

  return (
    <div className="flex h-full w-full flex-col justify-center">
      <div className="truncate px-1 pb-1 text-[11px] text-zinc-400">{widget.label}</div>
      <select
        disabled={!interactive}
        onChange={onChange}
        className="w-full rounded bg-black/40 px-2 py-1 text-sm text-zinc-100 ring-1 ring-edge focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

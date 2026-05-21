import type { Widget } from '../types';

export function Label({ widget }: { widget: Widget }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center truncate px-2 text-sm font-medium"
      style={{ color: widget.style?.color ?? '#cbd5e1' }}
    >
      {widget.label}
    </div>
  );
}

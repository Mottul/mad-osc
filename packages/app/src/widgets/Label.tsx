import type { Widget } from '../types';

export function Label({ widget }: { widget: Widget }) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden px-2">
      <span
        className="w-full whitespace-pre-wrap break-words text-center text-sm font-medium leading-snug"
        style={{ color: widget.style?.color ?? '#cbd5e1' }}
      >
        {widget.label}
      </span>
    </div>
  );
}

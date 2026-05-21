import { useRef, useState } from 'react';
import type { Widget } from '../types';
import { scale, sendFloats } from './oscSend';

export function XYPad({ widget, interactive }: { widget: Widget; interactive: boolean }) {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const ref = useRef<HTMLDivElement>(null);
  const color = widget.style?.color ?? '#2d9cdb';

  const update = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, 1 - (clientY - r.top) / r.height));
    setPos({ x, y });
    sendFloats(widget.osc.address, [scale(widget, x), scale(widget, y)]);
  };

  const onDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    update(e.clientX, e.clientY);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!interactive || e.buttons === 0) return;
    update(e.clientX, e.clientY);
  };

  return (
    <div className="flex h-full w-full select-none flex-col">
      <div className="truncate px-1 pb-1 text-[11px] text-zinc-400">{widget.label}</div>
      <div
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        className="relative flex-1 overflow-hidden rounded bg-black/40 ring-1 ring-edge"
        style={{
          touchAction: 'none',
          backgroundImage:
            'linear-gradient(#ffffff10 1px, transparent 1px), linear-gradient(90deg, #ffffff10 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div
          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2"
          style={{
            left: `${pos.x * 100}%`,
            top: `${(1 - pos.y) * 100}%`,
            background: color,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

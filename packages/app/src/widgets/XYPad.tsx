import { useRef, useState } from 'react';
import type { Widget } from '../types';
import { scale, sendFloats } from './oscSend';

export function XYPad({ widget, interactive }: { widget: Widget; interactive: boolean }) {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef({ px: 0, py: 0, x: 0.5, y: 0.5 });
  const color = widget.style?.color ?? '#2d9cdb';
  const sensitivity = widget.sensitivity && widget.sensitivity > 0 ? widget.sensitivity : 1;

  const onDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
  };

  const onMove = (e: React.PointerEvent) => {
    if (!interactive || e.buttons === 0) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - start.current.px) / (r.width * sensitivity);
    const dy = (start.current.py - e.clientY) / (r.height * sensitivity);
    const x = Math.min(1, Math.max(0, start.current.x + dx));
    const y = Math.min(1, Math.max(0, start.current.y + dy));
    setPos({ x, y });
    sendFloats(widget.osc.address, [scale(widget, x), scale(widget, y)]);
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

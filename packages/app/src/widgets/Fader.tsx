import { useRef, useState } from 'react';
import type { Widget } from '../types';
import { scale, sendFloat } from './oscSend';

export function Fader({ widget, interactive }: { widget: Widget; interactive: boolean }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  // Relative-drag anchors captured on pointer down.
  const start = useRef({ x: 0, y: 0, value: 0 });
  const horizontal = widget.orientation === 'horizontal';
  const color = widget.style?.color ?? '#3ddc97';
  const sensitivity = widget.sensitivity && widget.sensitivity > 0 ? widget.sensitivity : 1;

  const onDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, value };
  };

  const onMove = (e: React.PointerEvent) => {
    if (!interactive || e.buttons === 0) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Move relative to the touch point; full control length == full range.
    const deltaPx = horizontal ? e.clientX - start.current.x : start.current.y - e.clientY;
    const span = horizontal ? r.width : r.height;
    const delta = deltaPx / (span * sensitivity);
    const next = Math.min(1, Math.max(0, start.current.value + delta));
    setValue(next);
    sendFloat(widget, next);
  };

  return (
    <div className="flex h-full w-full select-none flex-col">
      <div className="truncate px-1 pb-1 text-[11px] text-zinc-400">{widget.label}</div>
      <div
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        className="relative flex-1 overflow-hidden rounded bg-black/40 ring-1 ring-edge"
        style={{ touchAction: 'none' }}
      >
        <div
          className="absolute"
          style={
            horizontal
              ? { left: 0, top: 0, bottom: 0, width: `${value * 100}%`, background: color }
              : { left: 0, right: 0, bottom: 0, height: `${value * 100}%`, background: color }
          }
        />
        <div className="absolute bottom-0.5 right-1 font-mono text-[10px] text-zinc-200/80">
          {scale(widget, value).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

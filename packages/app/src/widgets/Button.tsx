import { useState } from 'react';
import type { Widget } from '../types';
import { sendBool } from './oscSend';

export function Button({ widget, interactive }: { widget: Widget; interactive: boolean }) {
  const [on, setOn] = useState(false);
  const color = widget.style?.color ?? '#3ddc97';

  const setState = (next: boolean) => {
    setOn(next);
    sendBool(widget.osc.address, next);
    if (navigator.vibrate) navigator.vibrate(8);
  };

  const handlers =
    widget.mode === 'toggle'
      ? { onPointerDown: () => interactive && setState(!on) }
      : {
          onPointerDown: () => interactive && setState(true),
          onPointerUp: () => interactive && setState(false),
          onPointerLeave: () => interactive && on && setState(false),
        };

  return (
    <button
      {...handlers}
      className="flex h-full w-full select-none items-center justify-center rounded text-sm font-medium ring-1 ring-edge transition-colors"
      style={{
        background: on ? color : 'rgba(0,0,0,0.4)',
        color: on ? '#0b0e13' : '#cbd5e1',
        touchAction: 'none',
      }}
    >
      {widget.label}
    </button>
  );
}

import { useState } from 'react';
import { RgbaColorPicker, type RgbaColor } from 'react-colorful';
import type { Widget } from '../types';
import { sendFloats } from './oscSend';

export function ColorPickerWidget({
  widget,
  interactive,
}: {
  widget: Widget;
  interactive: boolean;
}) {
  const [color, setColor] = useState<RgbaColor>({ r: 61, g: 220, b: 151, a: 1 });

  const onChange = (c: RgbaColor) => {
    setColor(c);
    if (!interactive) return;
    sendFloats(widget.osc.address, [c.r / 255, c.g / 255, c.b / 255, c.a]);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="truncate px-1 pb-1 text-[11px] text-zinc-400">{widget.label}</div>
      <div className="madosc-color flex-1" style={{ pointerEvents: interactive ? 'auto' : 'none' }}>
        <RgbaColorPicker color={color} onChange={onChange} />
      </div>
    </div>
  );
}

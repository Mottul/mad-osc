import { oscClient } from '../osc/client';
import type { OscArg, Widget } from '../types';

// Scale a normalized 0..1 value into the widget's min..max range.
export function scale(widget: Widget, norm: number): number {
  const min = widget.osc.min ?? 0;
  const max = widget.osc.max ?? 1;
  return min + (max - min) * norm;
}

export function sendFloat(widget: Widget, norm: number): void {
  const args: OscArg[] = [{ type: 'f', value: scale(widget, norm) }];
  oscClient.send(widget.osc.address, args);
}

export function sendFloats(address: string, values: number[]): void {
  oscClient.send(
    address,
    values.map((v) => ({ type: 'f', value: v }) as OscArg)
  );
}

export function sendBool(address: string, on: boolean): void {
  oscClient.send(address, [{ type: on ? 'T' : 'F', value: on }]);
}

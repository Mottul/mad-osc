import type { WidgetType } from '../types';

export interface WidgetMeta {
  type: WidgetType;
  label: string;
  icon: string; // simple unicode glyph for the palette
}

export const WIDGETS: WidgetMeta[] = [
  { type: 'fader', label: 'Fader', icon: '⊟' },
  { type: 'button', label: 'Button', icon: '⏺' },
  { type: 'xypad', label: 'XY Pad', icon: '✛' },
  { type: 'colorpicker', label: 'Color', icon: '◑' },
  { type: 'dropdown', label: 'Dropdown', icon: '▾' },
  { type: 'label', label: 'Label', icon: 'T' },
];

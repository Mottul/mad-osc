export type WidgetType =
  | 'fader'
  | 'button'
  | 'xypad'
  | 'colorpicker'
  | 'dropdown'
  | 'label';

export type Breakpoint = 'lg' | 'xs';

export interface GridItem {
  i: string; // == widget id
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface OscArg {
  type: 'f' | 'i' | 's' | 'T' | 'F';
  value: number | string | boolean;
}

export interface WidgetOsc {
  address: string;
  min?: number;
  max?: number;
  // For dropdowns: option label -> value sent
  options?: { label: string; value: number }[];
}

export interface WidgetStyle {
  color?: string;
}

export interface Widget {
  id: string;
  type: WidgetType;
  label: string;
  osc: WidgetOsc;
  style?: WidgetStyle;
  // Orientation for faders
  orientation?: 'vertical' | 'horizontal';
  // Button behaviour
  mode?: 'momentary' | 'toggle';
}

export interface Page {
  id: string;
  name: string;
  widgets: Widget[];
  layouts: Record<Breakpoint, GridItem[]>;
}

export interface Layout {
  id: string;
  name: string;
  grid: { cols: Record<Breakpoint, number>; rowHeight: number };
  pages: Page[];
}

export interface ConnectionConfig {
  host: string; // bridge host
  port: number; // bridge http/ws port
}

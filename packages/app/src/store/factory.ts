import type { GridItem, Layout, Page, Widget, WidgetType } from '../types';

let counter = 0;
export function uid(prefix = 'w'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

const DEFAULT_SIZE: Record<WidgetType, { w: number; h: number }> = {
  fader: { w: 2, h: 6 },
  button: { w: 2, h: 2 },
  xypad: { w: 4, h: 6 },
  colorpicker: { w: 4, h: 6 },
  dropdown: { w: 3, h: 1 },
  label: { w: 3, h: 1 },
};

export function createWidget(type: WidgetType): Widget {
  const base: Widget = {
    id: uid(),
    type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
    osc: { address: `/${type}`, min: 0, max: 1 },
    style: { color: '#3ddc97' },
  };
  if (type === 'fader') base.orientation = 'vertical';
  if (type === 'button') base.mode = 'momentary';
  if (type === 'dropdown') {
    base.osc.options = [
      { label: 'Option A', value: 0 },
      { label: 'Option B', value: 1 },
    ];
  }
  return base;
}

export function gridSizeFor(type: WidgetType): { w: number; h: number } {
  return DEFAULT_SIZE[type];
}

export function createPage(name = 'Page 1'): Page {
  return {
    id: uid('p'),
    name,
    widgets: [],
    layouts: { lg: [], xs: [] },
  };
}

export function createLayout(name = 'New Layout'): Layout {
  return {
    id: uid('l'),
    name,
    grid: { cols: { lg: 24, xs: 8 }, rowHeight: 32 },
    pages: [createPage()],
  };
}

// Find a free slot for a new widget: drop it at the bottom-left.
export function placeItem(existing: GridItem[]): { x: number; y: number } {
  const maxY = existing.reduce((m, it) => Math.max(m, it.y + it.h), 0);
  return { x: 0, y: maxY };
}

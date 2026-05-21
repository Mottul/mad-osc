import { create } from 'zustand';
import type { Breakpoint, GridItem, Layout, Page, Widget, WidgetType } from '../types';
import { deleteLayout, loadLayouts, saveLayout } from '../db/storage';
import { createLayout, createWidget, gridSizeFor, placeItem, uid } from './factory';

type Mode = 'edit' | 'run';

interface EditorState {
  ready: boolean;
  mode: Mode;
  layouts: Layout[];
  currentLayoutId: string | null;
  currentPageId: string | null;
  selectedId: string | null;
  activeBreakpoint: Breakpoint;

  init: () => Promise<void>;
  setMode: (mode: Mode) => void;
  setActiveBreakpoint: (bp: Breakpoint) => void;

  newLayout: () => void;
  selectLayout: (id: string) => void;
  renameLayout: (name: string) => void;
  removeCurrentLayout: () => void;
  importLayout: (layout: Layout) => void;

  addPage: () => void;
  selectPage: (id: string) => void;

  addWidget: (type: WidgetType) => void;
  updateWidget: (id: string, patch: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  select: (id: string | null) => void;

  applyGridChange: (bp: Breakpoint, items: GridItem[]) => void;
}

function persist(layout: Layout | undefined): void {
  if (layout) void saveLayout(layout);
}

export const useEditorStore = create<EditorState>((set, get) => {
  const current = (): Layout | undefined =>
    get().layouts.find((l) => l.id === get().currentLayoutId);

  const currentPage = (): Page | undefined =>
    current()?.pages.find((p) => p.id === get().currentPageId);

  // Replace the current layout immutably, persist it, and update state.
  const mutateLayout = (fn: (l: Layout) => Layout): void => {
    const id = get().currentLayoutId;
    if (!id) return;
    let updated: Layout | undefined;
    const layouts = get().layouts.map((l) => {
      if (l.id !== id) return l;
      updated = fn(l);
      return updated;
    });
    set({ layouts });
    persist(updated);
  };

  const mutatePage = (fn: (p: Page) => Page): void => {
    const pageId = get().currentPageId;
    mutateLayout((l) => ({
      ...l,
      pages: l.pages.map((p) => (p.id === pageId ? fn(p) : p)),
    }));
  };

  return {
    ready: false,
    mode: 'edit',
    layouts: [],
    currentLayoutId: null,
    currentPageId: null,
    selectedId: null,
    activeBreakpoint: 'lg',

    init: async () => {
      let layouts = await loadLayouts();
      if (layouts.length === 0) {
        const fresh = createLayout('My First Layout');
        await saveLayout(fresh);
        layouts = [fresh];
      }
      const first = layouts[0];
      set({
        layouts,
        currentLayoutId: first.id,
        currentPageId: first.pages[0]?.id ?? null,
        ready: true,
      });
    },

    setMode: (mode) => set({ mode, selectedId: mode === 'run' ? null : get().selectedId }),
    setActiveBreakpoint: (bp) => set({ activeBreakpoint: bp }),

    newLayout: () => {
      const layout = createLayout(`Layout ${get().layouts.length + 1}`);
      void saveLayout(layout);
      set({
        layouts: [...get().layouts, layout],
        currentLayoutId: layout.id,
        currentPageId: layout.pages[0].id,
        selectedId: null,
      });
    },

    selectLayout: (id) => {
      const layout = get().layouts.find((l) => l.id === id);
      if (!layout) return;
      set({
        currentLayoutId: id,
        currentPageId: layout.pages[0]?.id ?? null,
        selectedId: null,
      });
    },

    renameLayout: (name) => mutateLayout((l) => ({ ...l, name })),

    removeCurrentLayout: () => {
      const id = get().currentLayoutId;
      if (!id) return;
      void deleteLayout(id);
      const remaining = get().layouts.filter((l) => l.id !== id);
      const next = remaining[0] ?? createLayout('My First Layout');
      if (remaining.length === 0) void saveLayout(next);
      set({
        layouts: remaining.length ? remaining : [next],
        currentLayoutId: next.id,
        currentPageId: next.pages[0]?.id ?? null,
        selectedId: null,
      });
    },

    importLayout: (layout) => {
      // Give imported layout a fresh id to avoid clobbering.
      const copy: Layout = { ...layout, id: uid('l') };
      void saveLayout(copy);
      set({
        layouts: [...get().layouts, copy],
        currentLayoutId: copy.id,
        currentPageId: copy.pages[0]?.id ?? null,
        selectedId: null,
      });
    },

    addPage: () => {
      const layout = current();
      if (!layout) return;
      const page: Page = {
        id: uid('p'),
        name: `Page ${layout.pages.length + 1}`,
        widgets: [],
        layouts: { lg: [], xs: [] },
      };
      mutateLayout((l) => ({ ...l, pages: [...l.pages, page] }));
      set({ currentPageId: page.id, selectedId: null });
    },

    selectPage: (id) => set({ currentPageId: id, selectedId: null }),

    addWidget: (type) => {
      const layout = current();
      const page = currentPage();
      if (!layout || !page) return;
      const widget = createWidget(type);
      const { w, h } = gridSizeFor(type);
      const next: Record<Breakpoint, GridItem[]> = { lg: [], xs: [] };
      (['lg', 'xs'] as Breakpoint[]).forEach((bp) => {
        const cols = layout.grid.cols[bp];
        const pos = placeItem(page.layouts[bp]);
        next[bp] = [
          ...page.layouts[bp],
          { i: widget.id, x: pos.x, y: pos.y, w: Math.min(w, cols), h },
        ];
      });
      mutatePage((p) => ({
        ...p,
        widgets: [...p.widgets, widget],
        layouts: next,
      }));
      set({ selectedId: widget.id });
    },

    updateWidget: (id, patch) =>
      mutatePage((p) => ({
        ...p,
        widgets: p.widgets.map((w) =>
          w.id === id ? { ...w, ...patch, osc: { ...w.osc, ...patch.osc } } : w
        ),
      })),

    removeWidget: (id) =>
      mutatePage((p) => ({
        ...p,
        widgets: p.widgets.filter((w) => w.id !== id),
        layouts: {
          lg: p.layouts.lg.filter((it) => it.i !== id),
          xs: p.layouts.xs.filter((it) => it.i !== id),
        },
      })),

    select: (id) => set({ selectedId: id }),

    applyGridChange: (bp, items) =>
      mutatePage((p) => ({
        ...p,
        layouts: { ...p.layouts, [bp]: items },
      })),
  };
});

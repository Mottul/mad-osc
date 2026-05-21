import { Responsive, WidthProvider, type Layout as RGLItem } from 'react-grid-layout';
import { useEditorStore } from '../store/editorStore';
import { WidgetView } from '../widgets/WidgetView';
import type { Breakpoint } from '../types';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function Canvas() {
  const layout = useEditorStore((s) => s.layouts.find((l) => l.id === s.currentLayoutId));
  const currentPageId = useEditorStore((s) => s.currentPageId);
  const page = layout?.pages.find((p) => p.id === currentPageId);
  const mode = useEditorStore((s) => s.mode);
  const selectedId = useEditorStore((s) => s.selectedId);
  const select = useEditorStore((s) => s.select);
  const removeWidget = useEditorStore((s) => s.removeWidget);
  const applyGridChange = useEditorStore((s) => s.applyGridChange);
  const setActiveBreakpoint = useEditorStore((s) => s.setActiveBreakpoint);

  if (!layout || !page) return null;
  const editing = mode === 'edit';

  const onLayoutChange = (_current: RGLItem[], all: Record<string, RGLItem[]>) => {
    (['lg', 'xs'] as Breakpoint[]).forEach((bp) => {
      const items = all[bp];
      if (items) {
        applyGridChange(
          bp,
          items.map((it) => ({ i: it.i, x: it.x, y: it.y, w: it.w, h: it.h }))
        );
      }
    });
  };

  return (
    <div
      className="h-full w-full overflow-auto"
      onPointerDown={(e) => {
        if (editing && e.target === e.currentTarget) select(null);
      }}
    >
      <ResponsiveGridLayout
        className="min-h-full"
        layouts={page.layouts}
        breakpoints={{ lg: 768, xs: 0 }}
        cols={layout.grid.cols}
        rowHeight={layout.grid.rowHeight}
        margin={[8, 8]}
        isDraggable={editing}
        isResizable={editing}
        compactType={null}
        preventCollision
        onLayoutChange={onLayoutChange}
        onBreakpointChange={(bp) => setActiveBreakpoint(bp as Breakpoint)}
      >
        {page.widgets.map((w) => (
          <div
            key={w.id}
            className={`group relative rounded ${
              editing ? 'cursor-move ring-1 ring-edge/60' : ''
            } ${selectedId === w.id ? 'outline outline-2 outline-accent' : ''}`}
            onPointerDown={() => editing && select(w.id)}
          >
            <div className="absolute inset-0 p-1">
              <WidgetView widget={w} interactive={!editing} />
            </div>
            {editing && selectedId === w.id && (
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  removeWidget(w.id);
                }}
                className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs text-white shadow"
                title="Delete"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}

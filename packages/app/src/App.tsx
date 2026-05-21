import { useEffect, useState } from 'react';
import { useEditorStore } from './store/editorStore';
import { Toolbar } from './editor/Toolbar';
import { Palette } from './editor/Palette';
import { Inspector } from './editor/Inspector';
import { Canvas } from './editor/Canvas';

type MobilePanel = 'none' | 'palette' | 'inspector';

export default function App() {
  const ready = useEditorStore((s) => s.ready);
  const mode = useEditorStore((s) => s.mode);
  const init = useEditorStore((s) => s.init);
  const [panel, setPanel] = useState<MobilePanel>('none');

  useEffect(() => {
    void init();
  }, [init]);

  // Close any mobile sheet when leaving edit mode.
  useEffect(() => {
    if (mode !== 'edit') setPanel('none');
  }, [mode]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-panel text-zinc-500">
        Loading…
      </div>
    );
  }

  const editing = mode === 'edit';

  return (
    <div className="flex h-screen flex-col bg-panel text-zinc-100">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        {editing && (
          <aside className="hidden w-44 shrink-0 overflow-auto border-r border-edge bg-panel md:block">
            <Palette />
          </aside>
        )}
        <main className="min-w-0 flex-1 bg-[#0c0f14]">
          <Canvas />
        </main>
        {editing && (
          <aside className="hidden w-64 shrink-0 overflow-auto border-l border-edge bg-panel md:block">
            <Inspector />
          </aside>
        )}
      </div>

      {/* Mobile-only controls: side panels are hidden on small screens. */}
      {editing && (
        <footer className="flex shrink-0 gap-2 border-t border-edge bg-panel p-2 md:hidden">
          <button
            className="flex-1 rounded bg-accent py-2 text-sm font-medium text-black"
            onClick={() => setPanel('palette')}
          >
            + Element
          </button>
          <button
            className="flex-1 rounded border border-edge bg-surface py-2 text-sm text-zinc-200"
            onClick={() => setPanel('inspector')}
          >
            Properties
          </button>
        </footer>
      )}

      {panel !== 'none' && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setPanel('none')}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[65vh] overflow-auto rounded-t-xl border-t border-edge bg-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-edge bg-panel px-3 py-2">
              <span className="text-sm font-medium text-zinc-200">
                {panel === 'palette' ? 'Add Element' : 'Properties'}
              </span>
              <button
                className="rounded px-2 py-1 text-sm text-zinc-400"
                onClick={() => setPanel('none')}
              >
                Close
              </button>
            </div>
            {panel === 'palette' ? (
              <Palette onAdd={() => setPanel('inspector')} />
            ) : (
              <Inspector />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

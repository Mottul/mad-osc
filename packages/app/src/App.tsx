import { useEffect } from 'react';
import { useEditorStore } from './store/editorStore';
import { Toolbar } from './editor/Toolbar';
import { Palette } from './editor/Palette';
import { Inspector } from './editor/Inspector';
import { Canvas } from './editor/Canvas';

export default function App() {
  const ready = useEditorStore((s) => s.ready);
  const mode = useEditorStore((s) => s.mode);
  const init = useEditorStore((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-panel text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-panel text-zinc-100">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        {mode === 'edit' && (
          <aside className="hidden w-44 shrink-0 overflow-auto border-r border-edge bg-panel md:block">
            <Palette />
          </aside>
        )}
        <main className="min-w-0 flex-1 bg-[#0c0f14]">
          <Canvas />
        </main>
        {mode === 'edit' && (
          <aside className="hidden w-64 shrink-0 overflow-auto border-l border-edge bg-panel md:block">
            <Inspector />
          </aside>
        )}
      </div>
    </div>
  );
}

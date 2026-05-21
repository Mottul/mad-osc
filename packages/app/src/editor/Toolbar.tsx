import { useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import { ConnectionBar } from './ConnectionBar';
import type { Layout } from '../types';

export function Toolbar() {
  const {
    layouts,
    currentLayoutId,
    currentPageId,
    mode,
    setMode,
    newLayout,
    selectLayout,
    renameLayout,
    addPage,
    selectPage,
    importLayout,
  } = useEditorStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const layout = layouts.find((l) => l.id === currentLayoutId);

  const onExport = () => {
    if (!layout) return;
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${layout.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        importLayout(JSON.parse(text) as Layout);
      } catch {
        alert('Invalid layout file');
      }
    });
    e.target.value = '';
  };

  const btn =
    'rounded border border-edge bg-surface px-2.5 py-1.5 text-xs text-zinc-300 hover:border-accent hover:text-accent';

  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-edge bg-panel px-3 py-2">
      <span className="mr-1 font-mono text-sm font-bold text-accent">mad·osc</span>

      <select
        className="rounded border border-edge bg-surface px-2 py-1.5 text-xs text-zinc-200"
        value={currentLayoutId ?? ''}
        onChange={(e) => selectLayout(e.target.value)}
      >
        {layouts.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>

      <button className={btn} onClick={newLayout}>
        + Layout
      </button>
      <button
        className={btn}
        onClick={() => {
          const name = prompt('Layout name', layout?.name);
          if (name) renameLayout(name);
        }}
      >
        Rename
      </button>

      <div className="mx-1 h-5 w-px bg-edge" />

      {layout && (
        <select
          className="rounded border border-edge bg-surface px-2 py-1.5 text-xs text-zinc-200"
          value={currentPageId ?? ''}
          onChange={(e) => selectPage(e.target.value)}
        >
          {layout.pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}
      <button className={btn} onClick={addPage}>
        + Page
      </button>

      <div className="mx-1 h-5 w-px bg-edge" />

      <button className={btn} onClick={onExport}>
        Export
      </button>
      <button className={btn} onClick={() => fileRef.current?.click()}>
        Import
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={onImportFile}
      />

      <div className="ml-auto flex items-center gap-2">
        <div className="flex overflow-hidden rounded border border-edge">
          <button
            className={`px-3 py-1.5 text-xs ${
              mode === 'edit' ? 'bg-accent text-black' : 'bg-surface text-zinc-300'
            }`}
            onClick={() => setMode('edit')}
          >
            Edit
          </button>
          <button
            className={`px-3 py-1.5 text-xs ${
              mode === 'run' ? 'bg-accent text-black' : 'bg-surface text-zinc-300'
            }`}
            onClick={() => setMode('run')}
          >
            Run
          </button>
        </div>
        <ConnectionBar />
      </div>
    </header>
  );
}

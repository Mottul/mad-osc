import { useEditorStore } from '../store/editorStore';
import { WIDGETS } from '../widgets/registry';

export function Palette({ onAdd }: { onAdd?: () => void }) {
  const addWidget = useEditorStore((s) => s.addWidget);
  const add = (type: Parameters<typeof addWidget>[0]) => {
    addWidget(type);
    onAdd?.();
  };
  return (
    <div className="flex flex-col gap-2 p-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        Add Element
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {WIDGETS.map((w) => (
          <button
            key={w.type}
            onClick={() => add(w.type)}
            className="flex flex-col items-center gap-1 rounded border border-edge bg-surface px-2 py-3 text-zinc-300 transition-colors hover:border-accent hover:text-accent"
          >
            <span className="text-lg leading-none">{w.icon}</span>
            <span className="text-xs">{w.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

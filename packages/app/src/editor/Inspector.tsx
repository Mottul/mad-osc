import { useEditorStore } from '../store/editorStore';
import type { Widget } from '../types';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded bg-black/40 px-2 py-1 text-sm text-zinc-100 ring-1 ring-edge focus:outline-none focus:ring-accent';

export function Inspector() {
  const layout = useEditorStore((s) => s.layouts.find((l) => l.id === s.currentLayoutId));
  const currentPageId = useEditorStore((s) => s.currentPageId);
  const selectedId = useEditorStore((s) => s.selectedId);
  const update = useEditorStore((s) => s.updateWidget);

  const page = layout?.pages.find((p) => p.id === currentPageId);
  const widget = page?.widgets.find((w) => w.id === selectedId);

  if (!widget) {
    return (
      <div className="p-3 text-sm text-zinc-500">
        Select an element to edit its properties.
      </div>
    );
  }

  const patch = (p: Partial<Widget>) => update(widget.id, p);

  return (
    <div className="flex flex-col gap-3 p-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {widget.type} properties
      </h2>

      <Field label="Label">
        {widget.type === 'label' ? (
          <textarea
            className={`${inputCls} h-20 resize-y`}
            value={widget.label}
            placeholder="Multi-line text is supported"
            onChange={(e) => patch({ label: e.target.value })}
          />
        ) : (
          <input
            className={inputCls}
            value={widget.label}
            onChange={(e) => patch({ label: e.target.value })}
          />
        )}
      </Field>

      {widget.type !== 'label' && (
        <Field label="OSC Address">
          <input
            className={`${inputCls} font-mono`}
            value={widget.osc.address}
            placeholder="/surfaces/Quad 1/opacity"
            onChange={(e) => patch({ osc: { ...widget.osc, address: e.target.value } })}
          />
        </Field>
      )}

      {(widget.type === 'fader' || widget.type === 'xypad') && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Min">
            <input
              type="number"
              className={inputCls}
              value={widget.osc.min ?? 0}
              onChange={(e) => patch({ osc: { ...widget.osc, min: Number(e.target.value) } })}
            />
          </Field>
          <Field label="Max">
            <input
              type="number"
              className={inputCls}
              value={widget.osc.max ?? 1}
              onChange={(e) => patch({ osc: { ...widget.osc, max: Number(e.target.value) } })}
            />
          </Field>
        </div>
      )}

      {(widget.type === 'fader' || widget.type === 'xypad') && (
        <Field label="Sensitivity (higher = finer)">
          <input
            type="number"
            min={0.25}
            step={0.25}
            className={inputCls}
            value={widget.sensitivity ?? 1}
            onChange={(e) => patch({ sensitivity: Number(e.target.value) })}
          />
        </Field>
      )}

      {widget.type === 'fader' && (
        <Field label="Orientation">
          <select
            className={inputCls}
            value={widget.orientation}
            onChange={(e) =>
              patch({ orientation: e.target.value as 'vertical' | 'horizontal' })
            }
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </Field>
      )}

      {widget.type === 'button' && (
        <Field label="Mode">
          <select
            className={inputCls}
            value={widget.mode}
            onChange={(e) => patch({ mode: e.target.value as 'momentary' | 'toggle' })}
          >
            <option value="momentary">Momentary</option>
            <option value="toggle">Toggle</option>
          </select>
        </Field>
      )}

      {widget.type === 'dropdown' && (
        <Field label="Options (label=value per line)">
          <textarea
            className={`${inputCls} h-24 font-mono`}
            value={(widget.osc.options ?? [])
              .map((o) => `${o.label}=${o.value}`)
              .join('\n')}
            onChange={(e) =>
              patch({
                osc: {
                  ...widget.osc,
                  options: e.target.value
                    .split('\n')
                    .map((line) => line.split('='))
                    .filter((parts) => parts[0]?.trim())
                    .map((parts) => ({
                      label: parts[0].trim(),
                      value: Number(parts[1] ?? 0),
                    })),
                },
              })
            }
          />
        </Field>
      )}

      <Field label="Color">
        <input
          type="color"
          className="h-8 w-full rounded bg-black/40 ring-1 ring-edge"
          value={widget.style?.color ?? '#3ddc97'}
          onChange={(e) => patch({ style: { ...widget.style, color: e.target.value } })}
        />
      </Field>
    </div>
  );
}

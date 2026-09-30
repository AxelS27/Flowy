import { RoutineStep } from "../../types";
import { PALETTE_BLOCKS } from "../../data/actionCatalog";

export function ActionFields({ step, onChange }: {
  step: RoutineStep;
  onChange: (changes: Partial<RoutineStep>) => void;
}) {
  const definition = PALETTE_BLOCKS.find((block) => block.action === step.action);
  if (!definition) return null;
  const fieldClass = "w-full px-3 py-2 rounded-xl bg-cream border border-cream-border text-xs font-semibold text-ink focus:outline-none focus:border-mint";
  return (
    <div className="w-full space-y-2">
      {definition.available === false && (
        <p className="text-amber-700">Not executable yet. Runs stop here instead of reporting fake success.</p>
      )}
      {!definition.noParam && (
        <label className="block space-y-1">
          <span className="text-ink-muted">{definition.paramLabel || "Value"}</span>
          {definition.action === "audio.volume" ? (
            <div className="flex items-center gap-3">
              <input type="range" min="0" max="100" step="1" value={step.param}
                aria-label="Volume (%)" className="flex-1 accent-strawberry"
                onChange={(event) => onChange({ param: event.target.value })} />
              <span className="font-mono w-12 text-right">{step.param}%</span>
            </div>
          ) : definition.action === "audio.mute" || definition.action === "focus.mode" ? (
            <select className={fieldClass} value={step.param} onChange={(event) => onChange({ param: event.target.value })}>
              {definition.action === "audio.mute" ? <>
                <option value="mute_mic">Mute microphone</option>
                <option value="unmute_mic">Unmute microphone</option>
                <option value="mute_audio">Mute speaker</option>
                <option value="unmute_audio">Unmute speaker</option>
              </> : <>
                <option value="PriorityOnly">Do not disturb ON</option>
                <option value="Off">Do not disturb OFF</option>
              </>}
            </select>
          ) : ["web.multiple", "clipboard.copy", "powershell.custom"].includes(definition.action) ? (
            <textarea className={fieldClass} rows={3} value={step.param}
              placeholder={definition.placeholder}
              onChange={(event) => onChange({ param: event.target.value })} />
          ) : (
            <input className={fieldClass} value={step.param}
              type={definition.action === "utility.wait" ? "number" : "text"}
              min={0} max={300} step="0.1"
              placeholder={definition.placeholder || (step.type === "file" ? "C:\\Users\\you\\Documents\\..." : "")}
              onChange={(event) => onChange({ param: event.target.value })} />
          )}
        </label>
      )}
      {definition.secondaryLabel && (
        <label className="block space-y-1">
          <span className="text-ink-muted">{definition.secondaryLabel}</span>
          <input className={fieldClass} value={step.secondaryParam || ""}
            onChange={(event) => onChange({ secondaryParam: event.target.value })} />
        </label>
      )}
      {definition.action === "focus.mode" && <p role="note" className="text-amber-700">Temporarily unavailable. This block is skipped and the routine continues. Windows Settings will not be opened.</p>}
      {definition.noParam && <p className="text-ink-muted">{definition.subtitle}</p>}
    </div>
  );
}

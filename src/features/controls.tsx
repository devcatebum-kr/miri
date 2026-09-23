import { cn } from "@/lib/utils"

export function Chips({ pool, selected, onToggle }: {
  pool: [string, string, string?][]
  selected: Record<string, boolean>
  onToggle: (k: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {pool.map(([k, label, emoji]) => (
        <button key={k} type="button" onClick={() => onToggle(k)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[13px] border-[1.5px] px-4 py-2.5 text-[15px] font-bold transition-colors",
            selected[k] ? "bg-primary border-primary text-white" : "bg-card border-input text-secondary-foreground hover:border-primary/60"
          )}>
          {emoji && <span className="text-base leading-none">{emoji}</span>}{label}
        </button>
      ))}
    </div>
  )
}

export function Options({ opts, value, onChange }: {
  opts: [string, string, string?][]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {opts.map(([val, label, sub]) => {
        const on = value === val
        return (
          <button key={val} type="button" onClick={() => onChange(val)}
            className={cn(
              "flex items-center gap-3 rounded-[15px] border-[1.5px] px-4 py-3.5 text-left text-[15.5px] font-bold text-ink transition-colors",
              on ? "border-primary bg-accent" : "border-input bg-card"
            )}>
            <span className={cn("size-[21px] rounded-full border-2 grid place-items-center shrink-0", on ? "border-primary bg-primary" : "border-input")}>
              {on && <span className="size-[7px] rounded-full bg-white" />}
            </span>
            <span>{label}{sub && <span className="block text-[12.5px] font-medium text-sub mt-0.5">{sub}</span>}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Stepper({ steps, idx }: { steps: [string, string][]; idx: number }) {
  return (
    <div className="flex gap-1.5">
      {steps.map(([, label], i) => (
        <div key={i} className="flex-1">
          <div className={cn("h-[5px] rounded-full transition-colors", i <= idx ? "bg-primary" : "bg-[#E9EDF1]")} />
          <div className={cn("mt-1.5 text-center text-[10.5px] font-bold tracking-tight",
            i === idx ? "text-[color:var(--primary)]" : i < idx ? "text-sub" : "text-faint")}>{label}</div>
        </div>
      ))}
    </div>
  )
}

const TONE: Record<string, string> = {
  alert: "bg-[var(--miss-bg)] border-[#F3CACB]",
  warn: "bg-[var(--time-bg)] border-[#F0DDB0]",
  chk: "bg-[var(--check-bg)] border-[var(--check-line)]",
}
const TONE_LABEL: Record<string, string> = {
  alert: "text-miss", warn: "text-time", chk: "text-check",
}
export function Insight({ tone, html }: { tone: string; html: string }) {
  return (
    <div className={cn("mt-6 rounded-[14px] border p-4", TONE[tone] || "bg-muted border-input")}>
      <p className={cn("mb-1.5 text-xs font-extrabold", TONE_LABEL[tone] || "text-sub")}>미리 보이는 것</p>
      <p className="text-sm leading-relaxed text-ink" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

export function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-[26px] font-black text-ink tracking-tight leading-tight mb-2 text-balance">{children}</h1>
}
export function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] font-medium text-sub mb-6">{children}</p>
}

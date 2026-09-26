import { useMemo, useState } from "react"
import { emptyState, type State } from "./features/types"
import { Stepper } from "./features/controls"
import { Intro } from "./features/Intro"
import { Scope, Existing, Context } from "./features/WizardSteps"
import { Report } from "./features/Report"
import { Button } from "@/components/ui/button"

const SEQ = ["intro", "scope", "existing", "context", "report"] as const
const WIZ: [string, string][] = [["scope", "공간·공정"], ["existing", "지금 상태"], ["context", "연식·발주"]]

export default function App() {
  const [S, setS] = useState<State>(emptyState())
  const [cur, setCur] = useState(0)
  const name = SEQ[cur]

  const toggle = (group: keyof State, key: string) =>
    setS((p) => ({ ...p, [group]: { ...(p[group] as Record<string, boolean>), [key]: !(p[group] as Record<string, boolean>)[key] } }))
  const setField = (field: keyof State, value: string) => setS((p) => ({ ...p, [field]: value }))
  const go = (i: number) => { setCur(i); window.scrollTo(0, 0) }
  // 물어볼 게 없는 '지금 상태' 화면은 건너뜀
  const hasExisting = !!(S.spaces.bath || S.spaces.kitchen || S.spaces.living)
  const step = (d: 1 | -1) => { let n = cur + d; if (SEQ[n] === "existing" && !hasExisting) n += d; go(n) }
  const goTo = (n: string) => go(SEQ.indexOf(n as typeof SEQ[number]))

  const wizIdx = WIZ.findIndex((w) => w[0] === name)
  const canNext = useMemo(() => {
    if (name === "scope") return Object.values(S.spaces).some(Boolean) && Object.values(S.works).some(Boolean)
    if (name === "context") return !!S.order
    return true
  }, [name, S])

  const screen = () => {
    switch (name) {
      case "intro": return <Intro />
      case "scope": return <Scope S={S} toggle={toggle} />
      case "existing": return <Existing S={S} toggle={toggle} setField={setField} />
      case "context": return <Context S={S} setField={setField} />
      case "report": return <Report S={S} goTo={goTo} wiz={WIZ} />
    }
  }

  const nextLabel = name === "context" ? "결과 보기" : "다음"

  return (
    <div className="mx-auto flex min-h-full max-w-[480px] flex-col px-[18px]">
      {wizIdx >= 0 && (
        <div className="sticky top-0 z-10 bg-background pb-3 pt-4">
          <Stepper steps={WIZ} idx={wizIdx} />
        </div>
      )}

      <main key={name} className="flex-1 animate-in fade-in slide-in-from-right-3 duration-200 pb-5 pt-3.5">
        {screen()}
      </main>

      {name === "intro" && (
        <div className="sticky bottom-0 flex gap-2.5 bg-background py-3 [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]">
          <Button size="lg" className="cta-anim" onClick={() => go(1)}>내 공사로 점검 시작</Button>
        </div>
      )}

      {wizIdx >= 0 ? (
        <div className="sticky bottom-0 flex gap-2.5 bg-background py-3 [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]">
          <Button variant="outline" size="lg" className="w-auto flex-none px-5" onClick={() => step(-1)}>이전</Button>
          <Button size="lg" disabled={!canNext} onClick={() => canNext && step(1)}>{nextLabel}</Button>
        </div>
      ) : null}

      {name === "report" && (
        <div className="py-4 text-center">
          <button type="button" onClick={() => { setS(emptyState()); go(0) }} className="p-2 text-sm font-extrabold text-[color:var(--primary)]">처음부터 다시</button>
        </div>
      )}
    </div>
  )
}

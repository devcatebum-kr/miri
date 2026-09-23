import { useMemo, useState } from "react"
import { emptyState, type State } from "./features/types"
import { Stepper } from "./features/controls"
import { Intro } from "./features/Intro"
import { Space, Existing, Age, Works, Order, Review } from "./features/WizardSteps"
import { Report } from "./features/Report"
import { Button } from "@/components/ui/button"

const SEQ = ["intro", "space", "existing", "age", "works", "order", "review", "report"] as const
const WIZ: [string, string][] = [["space", "공간"], ["existing", "상태"], ["age", "연식"], ["works", "공정"], ["order", "발주"]]

export default function App() {
  const [S, setS] = useState<State>(emptyState())
  const [cur, setCur] = useState(0)
  const name = SEQ[cur]

  const toggle = (group: keyof State, key: string) =>
    setS((p) => ({ ...p, [group]: { ...(p[group] as Record<string, boolean>), [key]: !(p[group] as Record<string, boolean>)[key] } }))
  const setField = (field: keyof State, value: string) => setS((p) => ({ ...p, [field]: value }))
  const go = (i: number) => { setCur(i); window.scrollTo(0, 0) }
  const goTo = (n: string) => go(SEQ.indexOf(n as typeof SEQ[number]))

  const wizIdx = WIZ.findIndex((w) => w[0] === name)
  const canNext = useMemo(() => {
    if (name === "space") return Object.values(S.spaces).some(Boolean)
    if (name === "works") return Object.values(S.works).some(Boolean)
    if (name === "order") return !!S.order
    return true
  }, [name, S])

  const screen = () => {
    switch (name) {
      case "intro": return <Intro />
      case "space": return <Space S={S} toggle={toggle} />
      case "existing": return <Existing S={S} toggle={toggle} setField={setField} />
      case "age": return <Age S={S} setField={setField} />
      case "works": return <Works S={S} toggle={toggle} />
      case "order": return <Order S={S} setField={setField} />
      case "review": return <Review S={S} goTo={goTo} wiz={WIZ} />
      case "report": return <Report S={S} />
    }
  }

  const nextLabel = name === "review" ? "결과 보기" : name === "order" ? "입력 확인" : "다음"

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
          <Button size="lg" onClick={() => go(1)}>내 공사로 점검 시작</Button>
        </div>
      )}

      {wizIdx >= 0 || name === "review" ? (
        <div className="sticky bottom-0 flex gap-2.5 bg-background py-3 [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]">
          <Button variant="outline" size="lg" className="w-auto flex-none px-5" onClick={() => go(cur - 1)}>이전</Button>
          <Button size="lg" disabled={!canNext} onClick={() => canNext && go(cur + 1)}>{nextLabel}</Button>
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

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { EX, EXIC } from "./data"
import type { State } from "./types"
import { Report } from "./Report"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const emptyS = (): State => ({ spaces: {}, bathDeot: "", kitchenMove: "", floorType: {}, age: "", prevReno: "", works: {}, tileWhere: {}, order: "" })
// 예시는 진짜 엔진으로 생성 — 고정 샘플 입력을 실제 결과 화면(Report preview)에 그대로 흘림 (예시=실물 항상 일치)
const SAMPLE_1: State = { ...emptyS(), spaces: { bath: true, kitchen: true }, bathDeot: "모름", kitchenMove: "볼수전", age: "구축", works: { demo: true, tile: true, cabinet: true }, tileWhere: { bath: true, kit: true }, order: "반셀프" }
const SAMPLE_2: State = { ...emptyS(), spaces: { living: true, expand: true }, floorType: { 모름: true }, age: "구축", works: { demo: true, carpent: true, insul: true, paper: true, floor: true }, order: "턴키" }

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduceMotion() || typeof IntersectionObserver === "undefined") { el.classList.add("in"); return }
    const show = () => el.classList.add("in")
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { show(); io.disconnect() } },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    )
    io.observe(el)
    const fallback = setTimeout(() => { show(); io.disconnect() }, 1600) // never leave content hidden
    return () => { io.disconnect(); clearTimeout(fallback) }
  }, [])
  return <div ref={ref} className={cn("reveal", className)}>{children}</div>
}

export function Intro() {
  const [pick, setPick] = useState("욕실")
  const keys = Object.keys(EX)
  const d = EX[pick]
  return (
    <div>
      <span className="mb-3.5 inline-block rounded-full bg-accent px-3 py-1.5 text-[12.5px] font-extrabold text-[color:var(--accent-foreground)]">이 공사, 이대로 맡겨도 될까?</span>
      <h1 className="text-[27px] font-black text-ink tracking-tight leading-tight mb-2">내 공사 미리보기</h1>
      <p className="text-[15px] font-medium text-sub mb-5">맡기기 전에, 공정 순서대로 뭐가 빠졌고 어디서 꼬이는지 짚어드려요.</p>

      <p className="mt-6 mb-2.5 text-[15px] font-extrabold text-ink">예정 중인 시공, 하나만 눌러보세요</p>
      <div className="flex flex-wrap gap-2">
        {keys.map((k, i) => (
          <button key={k} type="button" onClick={() => setPick(k)} style={{ animationDelay: `${i * 55}ms` }}
            className={cn("chip-in flex cursor-pointer items-center gap-1.5 rounded-2xl border-[1.5px] px-3.5 py-2.5 text-[14.5px] font-bold transition-all active:scale-[0.97]",
              pick === k
                ? "border-primary bg-accent text-[color:var(--primary)] shadow-[0_3px_14px_rgba(0,100,255,0.18)] scale-[1.03]"
                : "border-border bg-card text-secondary-foreground shadow-[0_1px_3px_rgba(28,27,24,0.05)] hover:border-[color:var(--primary)]/45")}>
            <span className="text-[16px] leading-none">{EXIC[k]}</span>{k}
          </button>
        ))}
      </div>
      <div key={pick} className="card-swap mt-3.5 rounded-2xl border bg-card p-5 shadow-[0_1px_3px_rgba(28,27,24,0.05)]">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-muted text-[15px]">{EXIC[pick]}</span>
          <p className="text-[12.5px] font-bold text-sub">{pick}, 이런 걸 놓치기 쉬워요</p>
        </div>
        <p className="rounded-[13px] bg-muted px-4 py-3.5 text-[16.5px] font-semibold leading-[1.5] text-ink [&_b]:text-[color:var(--primary)]"
          dangerouslySetInnerHTML={{ __html: d[0] }} />
        <ul className="mt-1.5">
          {d.slice(1).map((t, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr] gap-2.5 border-t border-border py-2.5 text-[13.5px] leading-relaxed text-secondary-foreground first:border-t-0 [&_b]:font-semibold [&_b]:text-ink">
              <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-[5px] bg-muted text-[10px] font-black text-[color:var(--primary)]">✓</span>
              <span dangerouslySetInnerHTML={{ __html: t }} />
            </li>
          ))}
        </ul>
      </div>

      <Reveal>
        <div className="mt-8 mb-4 flex items-center gap-2.5">
          <span className="h-px flex-1 bg-input" />
          <span className="text-[11.5px] font-extrabold text-faint">아래는 실제 결과 화면 예시</span>
          <span className="h-px flex-1 bg-input" />
        </div>
        <div className="rounded-2xl border bg-muted p-3.5">
          <p className="mb-0.5 flex items-center gap-2 px-0.5 text-[12.5px] font-extrabold text-sub">
            예시로 살펴보기
            <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-[color:var(--accent-foreground)]">국민평형 84㎡(34평)</span>
          </p>
          <Tabs defaultValue="0" className="mt-3">
            <TabsList>
              <TabsTrigger value="0">① 욕실·주방 부분</TabsTrigger>
              <TabsTrigger value="1">② 발코니 확장 전체</TabsTrigger>
            </TabsList>
            <TabsContent value="0" className="mt-3.5"><Report S={SAMPLE_1} goTo={() => {}} wiz={[]} preview /></TabsContent>
            <TabsContent value="1" className="mt-3.5"><Report S={SAMPLE_2} goTo={() => {}} wiz={[]} preview /></TabsContent>
          </Tabs>
        </div>
      </Reveal>

    </div>
  )
}

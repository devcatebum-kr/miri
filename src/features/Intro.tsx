import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { EX, EXIC, CASES, type CaseEx } from "./data"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

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

function useCountUp(target: number) {
  const [n, setN] = useState(reduceMotion() ? target : 0)
  useEffect(() => {
    if (reduceMotion()) { setN(target); return }
    let raf = 0
    const t0 = performance.now()
    const dur = 700
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur)
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return n
}

function CaseView({ c }: { c: CaseEx }) {
  const must = useCountUp(c.must)
  const check = useCountUp(c.check)
  const total = c.must + c.check || 1
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 80)
    return () => clearTimeout(t)
  }, [])
  return (
    <div>
      {/* input */}
      <div className="flex flex-wrap gap-1.5">
        {c.pin.map((p, i) => {
          const [label, miss] = Array.isArray(p) ? [p[0], true] : [p, false]
          return (
            <span key={i} className={cn(
              "rounded-full border px-2.5 py-1 text-[11.5px] font-bold",
              miss ? "text-miss border-[#F3CACB] bg-[var(--miss-bg)]" : "text-secondary-foreground border-border bg-card"
            )}>{label}</span>
          )
        })}
      </div>
      {/* divider */}
      <div className="my-3 flex items-center gap-2">
        <span className="h-px flex-1 bg-input" />
        <b className="text-[11px] font-semibold text-faint">그래서 이렇게 나와요</b>
        <span className="h-px flex-1 bg-input" />
      </div>
      {/* summary */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-[11px] border bg-card p-2.5 text-center">
          <div className="text-[20px] font-black leading-none text-miss">{must}</div>
          <div className="mt-1 text-[10.5px] font-bold text-sub">꼭 챙길 것</div>
        </div>
        <div className="flex-1 rounded-[11px] border bg-card p-2.5 text-center">
          <div className="text-[20px] font-black leading-none text-check">{check}</div>
          <div className="mt-1 text-[10.5px] font-bold text-sub">확인 필요</div>
        </div>
      </div>
      <div className="mt-2 flex h-2 gap-1 overflow-hidden rounded-full bg-muted">
        {c.must > 0 && <span className="bar-seg rounded-full bg-[var(--miss)]" style={{ width: grown ? `${(c.must / total) * 100}%` : "0%" }} />}
        {c.check > 0 && <span className="bar-seg rounded-full bg-[var(--check)]" style={{ width: grown ? `${(c.check / total) * 100}%` : "0%" }} />}
      </div>
      {/* hero */}
      <p className="mt-3.5 mb-2 px-0.5 text-[11px] font-extrabold text-sub">지금 꼭 챙길 것</p>
      <div className="overflow-hidden rounded-[12px] border bg-card">
        {[...c.hero, ...c.rest].map(([t], i) => (
          <div key={i} className={cn("grid grid-cols-[auto_1fr] items-start gap-2.5 px-3 py-2.5", i > 0 && "border-t")}>
            <span className="mt-px grid size-[18px] shrink-0 place-items-center rounded-full bg-muted text-[10px] font-black text-sub">{i + 1}</span>
            <span className="text-[12.5px] leading-snug text-secondary-foreground [&_b]:font-semibold [&_b]:text-ink" dangerouslySetInnerHTML={{ __html: t }} />
          </div>
        ))}
      </div>
      {/* check */}
      <p className="mt-3.5 mb-2 px-0.5 text-[11px] font-extrabold text-check">확인 필요 · 착공 전 숙제</p>
      <div className="overflow-hidden rounded-[11px] border border-[var(--check-line)] bg-[var(--check-bg)]">
        {c.chk.map((t, i) => (
          <div key={i} className={cn("grid grid-cols-[auto_1fr] items-start gap-2 px-3 py-2.5 text-[12.5px] leading-snug text-secondary-foreground [&_b]:font-semibold [&_b]:text-ink", i > 0 && "border-t border-[var(--check-line)]")}>
            <span className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border border-[var(--check-line)] bg-white text-[11px] font-black text-check">?</span>
            <span dangerouslySetInnerHTML={{ __html: t }} />
          </div>
        ))}
      </div>
      {/* timeline strip */}
      <p className="mt-3.5 mb-2 px-0.5 text-[11px] font-extrabold text-sub">공사 순서로 자세히</p>
      <div className="flex items-center rounded-[11px] border bg-card px-2 py-2.5">
        {c.tl.map((s, i) => (
          <div key={i} className="flex items-center flex-1 justify-center">
            {i > 0 && <span className="px-0.5 pb-3.5 text-[9px] text-input">›</span>}
            <div className="flex flex-col items-center gap-1">
              <div className={cn("grid size-[27px] place-items-center rounded-lg text-[13px]", s[2] ? "bg-[var(--miss-bg)] border border-[#F3CACB]" : "bg-muted")}>{s[0]}</div>
              <div className="text-[9px] font-bold text-faint">{s[1]}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 px-0.5 text-center text-[10.5px] font-semibold text-faint">각 공정을 펼치면 공정별 체크포인트까지 나와요</p>
    </div>
  )
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
        {keys.map((k) => (
          <button key={k} type="button" onClick={() => setPick(k)}
            className={cn("flex cursor-pointer items-center gap-1.5 rounded-2xl border-[1.5px] px-3.5 py-2.5 text-[14.5px] font-bold transition-all active:scale-[0.97]",
              pick === k
                ? "border-primary bg-accent text-[color:var(--primary)] shadow-[0_2px_12px_rgba(0,100,255,0.14)]"
                : "border-border bg-card text-secondary-foreground shadow-[0_1px_3px_rgba(28,27,24,0.05)] hover:border-[color:var(--primary)]/45")}>
            <span className="text-[16px] leading-none">{EXIC[k]}</span>{k}
          </button>
        ))}
      </div>
      <div className="mt-3.5 rounded-2xl border bg-card p-5 shadow-[0_1px_3px_rgba(28,27,24,0.05)]">
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
            <TabsContent value="0" className="mt-3.5"><CaseView c={CASES[0]} /></TabsContent>
            <TabsContent value="1" className="mt-3.5"><CaseView c={CASES[1]} /></TabsContent>
          </Tabs>
        </div>
      </Reveal>

    </div>
  )
}

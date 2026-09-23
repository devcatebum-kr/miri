import { useState } from "react"
import { cn } from "@/lib/utils"
import { EX, EXIC, CASES, type CaseEx } from "./data"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

function CaseView({ c }: { c: CaseEx }) {
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
        <b className="text-[11px] font-extrabold text-faint">그래서 이렇게 나와요</b>
        <span className="h-px flex-1 bg-input" />
      </div>
      {/* summary */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-[11px] border bg-card p-2.5 text-center">
          <div className="text-[20px] font-black leading-none text-miss">{c.must}</div>
          <div className="mt-1 text-[10.5px] font-bold text-sub">꼭 챙길 것</div>
        </div>
        <div className="flex-1 rounded-[11px] border bg-card p-2.5 text-center">
          <div className="text-[20px] font-black leading-none text-check">{c.check}</div>
          <div className="mt-1 text-[10.5px] font-bold text-sub">확인 필요</div>
        </div>
      </div>
      {/* hero */}
      <p className="mt-3.5 mb-2 px-0.5 text-[11px] font-extrabold text-sub">지금 꼭 챙길 것</p>
      <div className="flex flex-col gap-2">
        {c.hero.map((h, i) => (
          <div key={i} className="rounded-[11px] border border-l-[3px] bg-card px-3 py-2.5 text-[12.5px] leading-relaxed text-secondary-foreground"
            style={{ borderLeftColor: `var(--${h[1]})` }}
            dangerouslySetInnerHTML={{ __html: h[0] }} />
        ))}
      </div>
      {c.more && <p className="mt-2 px-0.5 text-[11px] font-bold text-faint">…{c.more}</p>}
      {/* check */}
      <p className="mt-3.5 mb-2 px-0.5 text-[11px] font-extrabold text-check">확인 필요 · 착공 전 숙제</p>
      <div className="grid grid-cols-[auto_1fr] items-start gap-2 rounded-[11px] border border-[var(--check-line)] bg-[var(--check-bg)] px-3 py-2.5 text-[12.5px] leading-relaxed text-secondary-foreground">
        <span className="mt-0.5 grid size-[18px] place-items-center rounded-full border border-[var(--check-line)] bg-white text-[11px] font-black text-check">?</span>
        <span dangerouslySetInnerHTML={{ __html: c.chk }} />
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
            className={cn("cursor-pointer rounded-xl border-[1.5px] px-3.5 py-2.5 text-[14.5px] font-bold transition-colors",
              pick === k ? "border-primary text-[color:var(--primary)] bg-card" : "border-input text-secondary-foreground bg-card")}>{k}</button>
        ))}
      </div>
      <div className="mt-3.5 rounded-2xl border bg-card p-4 shadow-[0_1px_3px_rgba(25,31,40,0.06)]">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-[11px] bg-muted text-[19px]">{EXIC[pick]}</span>
          <p className="text-[14.5px] font-black text-ink">{pick}, 이런 걸 놓치기 쉬워요</p>
        </div>
        <p className="rounded-[13px] border-l-[3px] border-primary bg-muted px-3.5 py-3 text-[14.5px] font-bold leading-relaxed text-ink [&_b]:text-[color:var(--primary)]"
          dangerouslySetInnerHTML={{ __html: d[0] }} />
        <ul className="mt-1">
          {d.slice(1).map((t, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr] gap-2.5 border-t border-border py-2.5 text-sm leading-relaxed text-secondary-foreground first:border-t-0 [&_b]:font-extrabold [&_b]:text-ink">
              <span className="mt-0.5 grid size-4 place-items-center rounded-[5px] bg-muted text-[10px] font-black text-[color:var(--primary)]">✓</span>
              <span dangerouslySetInnerHTML={{ __html: t }} />
            </li>
          ))}
        </ul>
      </div>

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
      <p className="mt-4 text-center text-[13px] font-bold text-faint">1분이면 돼요 · 5단계 · 무료</p>
    </div>
  )
}

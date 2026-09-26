import { useEffect } from "react"
import type { State } from "./types"
import { STAGES } from "./data"
import { evaluate, activeStages } from "./engine"
import { Summary } from "./WizardSteps"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { trackSubmission } from "@/lib/track"

export function Report({ S, goTo, wiz }: { S: State; goTo: (n: string) => void; wiz: [string, string][] }) {
  const F = evaluate(S)
  const active = activeStages(S)
  // 고르지 않은 공정에 걸린 경고 → 타임라인이 아니라 별도 칸으로
  const stageName = (k: string) => STAGES.find((s) => s[0] === k)?.[2] || k
  const sureMust = F.filter((f) => f.conf === "sure" && f.sev === "must")
  const checks = F.filter((f) => f.conf === "check" && active[f.stage])
  const hero = sureMust.slice(0, 4)
  const orphans = F.filter((f) => !active[f.stage] && !hero.includes(f))
  const stages = STAGES.filter((s) => active[s[0]])

  // 결과 도달 시 케이스 저장(세션·입력조합당 1회, 비차단)
  useEffect(() => {
    trackSubmission(S, { must: sureMust.length, check: checks.length, orphan: orphans.length })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <p className="pt-1 pb-4 text-[13px] font-bold tracking-wide text-faint">미리보기 결과</p>
      <Summary S={S} goTo={goTo} wiz={wiz} />

      {/* 진단 히어로 (C) */}
      <div className="mb-5 rounded-[calc(var(--radius)-2px)] border bg-card p-6 shadow-[0_2px_12px_rgba(28,27,24,0.05)]">
        <p className="text-[13.5px] font-bold text-sub">이 계획, 지금 이대로면</p>
        {sureMust.length > 0 ? (
          <div className="mt-1 flex items-end gap-2">
            <span className="text-[46px] font-black leading-none text-ink">{sureMust.length}</span>
            <span className="pb-1.5 text-base font-extrabold text-ink">가지, 꼭 챙길 게 있어요</span>
          </div>
        ) : checks.length > 0 ? (
          <div className="mt-1 flex items-end gap-2">
            <span className="text-[46px] font-black leading-none text-ink">{checks.length}</span>
            <span className="pb-1.5 text-base font-extrabold text-ink">가지, 확인할 게 있어요</span>
          </div>
        ) : (
          <div className="mt-1 text-[22px] font-black text-ink">짚을 게 없어요 👍</div>
        )}
        <div className="mt-4 flex h-2.5 gap-1">
          {sureMust.length > 0 && <span style={{ flexGrow: sureMust.length }} className="rounded-full bg-[var(--miss)]" />}
          {checks.length > 0 && <span style={{ flexGrow: checks.length }} className="rounded-full bg-[var(--check)]" />}
          {sureMust.length + checks.length === 0 && <span className="flex-1 rounded-full bg-[color:var(--primary)]/25" />}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-bold text-sub">
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--miss)]" />꼭 챙길 것 {sureMust.length}</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--check)]" />확인 필요 {checks.length}</span>
        </div>
        <p className="mt-3.5 text-[13.5px] font-medium leading-relaxed text-sub">
          {sureMust.length > 0
            ? "큰 리스크부터 아래에서 확인하세요."
            : checks.length > 0
              ? "큰 문제는 없어요. 확인할 것 몇 가지만 착공 전에 짚으면 돼요."
              : "지금 입력 기준으론 큰 문제는 없어요. 공정별 체크포인트는 살펴보세요."}
        </p>
      </div>

      {/* 1층 */}
      {hero.length ? (
        <>
          <p className="mb-2.5 text-base font-black text-ink">지금 꼭 챙길 것</p>
          <div className="mb-5 overflow-hidden rounded-[calc(var(--radius)-6px)] border bg-card shadow-[0_1px_3px_rgba(28,27,24,0.05)]">
            {hero.map((f, i) => (
              <div key={i} className={cn("grid grid-cols-[auto_1fr] gap-3 px-4 py-4", i > 0 && "border-t")}>
                <span className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[12px] font-black text-sub">{i + 1}</span>
                <span className="text-[14.5px] leading-relaxed text-secondary-foreground [&_b]:font-semibold [&_b]:text-ink" dangerouslySetInnerHTML={{ __html: f.t }} />
              </div>
            ))}
          </div>
          {sureMust.length > hero.length && (
            <p className="-mt-3 mb-5 text-center text-[13px] font-bold text-sub">나머지 {sureMust.length - hero.length}개는 아래 '공사 순서로 자세히 보기'에 있어요</p>
          )}
        </>
      ) : (
        <div className="mb-5 rounded-[calc(var(--radius)-6px)] border bg-card px-4 py-4 text-[14.5px] leading-relaxed text-secondary-foreground [&_b]:font-semibold [&_b]:text-ink">
          지금 입력 기준으론 <b>꼭 짚어야 할 큰 문제</b>는 없어요. 아래 '확인 필요'와 공정별 체크포인트를 살펴보세요.
        </div>
      )}

      {orphans.length > 0 && (
        <div className="mb-5 rounded-[14px] border border-dashed border-input bg-card p-4">
          <p className="text-[15px] font-black text-ink">고르지 않으셨지만, 빠졌을 수 있어요</p>
          <p className="mb-3 mt-1 text-[12.5px] font-medium text-sub">고르신 공간·상태를 보면 보통 같이 들어가는 공정이에요. 계획에 없으면 업체와 확인하세요.</p>
          <ul className="flex flex-col gap-3">
            {orphans.map((f, i) => (
              <li key={i} className="grid grid-cols-[auto_1fr] items-start gap-2.5 text-[13.5px] leading-snug text-secondary-foreground [&_b]:font-semibold [&_b]:text-ink">
                <span className="mt-px shrink-0 rounded-[6px] bg-muted px-1.5 py-0.5 text-[11px] font-extrabold text-sub">{stageName(f.stage)}</span>
                <span dangerouslySetInnerHTML={{ __html: f.t }} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 2층 + 3층 */}
      <Accordion type="single" collapsible className="flex flex-col gap-3">
        {checks.length > 0 && (
          <AccordionItem value="checks" className="rounded-[14px] border bg-[var(--check-bg)] shadow-[0_1px_3px_rgba(25,31,40,0.06)]">
            <AccordionTrigger>
              확인 필요
              <span className="rounded-full bg-[var(--check-line)] px-2.5 py-0.5 text-xs font-extrabold text-check">{checks.length}</span>
              <span className="text-[13px] font-semibold text-check">착공 전 숙제</span>
            </AccordionTrigger>
            <AccordionContent>
              {checks.map((f, i) => (
                <div key={i} className={cn("grid grid-cols-[auto_1fr] gap-2.5 py-3", i > 0 && "border-t border-[var(--check-line)]/60")}>
                  <span className="grid size-[22px] place-items-center rounded-full border border-[var(--check-line)] bg-white text-[13px] font-black text-check">?</span>
                  <span className="text-sm leading-relaxed text-secondary-foreground [&_b]:font-semibold [&_b]:text-ink" dangerouslySetInnerHTML={{ __html: f.t }} />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="timeline" className="rounded-[14px] border bg-card shadow-[0_1px_3px_rgba(25,31,40,0.06)]">
          <AccordionTrigger>공사 순서로 자세히 보기</AccordionTrigger>
          <AccordionContent>
            <p className="mb-3.5 rounded-[10px] bg-muted px-3 py-2.5 text-[12.5px] leading-snug text-sub">
              고르신 공정을 순서대로 폈어요. 방수·타일↔목공, 조명 같은 구간은 현장에서 겹치거나 바뀔 수 있어요.
            </p>
            <div className="mb-3.5 flex flex-wrap gap-2.5">
              {([["miss", "빠진 공정"], ["order", "순서"], ["time", "일정"], ["resp", "책임"]] as const).map(([c, l]) => (
                <span key={c} className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-sub">
                  <span className="size-2 rounded-full" style={{ background: `var(--${c})` }} />{l}
                </span>
              ))}
            </div>
            <div className="relative ml-0.5">
              {stages.map((s, si) => {
                const items = F.filter((f) => f.stage === s[0])
                const hot = items.some((f) => f.sev === "must" && f.conf === "sure")
                const last = si === stages.length - 1
                return (
                  <div key={s[0]} className="relative pl-10 pb-4">
                    {!last && <span className="absolute left-[14px] top-[30px] bottom-[-2px] w-0.5 bg-input" />}
                    <span className={cn("absolute left-0 top-0 z-[1] grid size-[30px] place-items-center rounded-[9px] border-[1.5px] bg-card text-[14px]", hot ? "border-miss bg-[var(--miss-bg)]" : "border-input")}>{s[1]}</span>
                    <p className="mt-1 text-[15px] font-black text-ink">{s[2]}</p>
                    <p className="mb-2.5 text-xs font-semibold text-faint">{s[3]}</p>
                    {items.length ? (
                      <ul className="mb-2.5 flex flex-col gap-2.5">
                        {items.map((f, i) => (
                          <li key={i} className="grid grid-cols-[auto_1fr] gap-2.5 text-[13.5px] leading-snug text-secondary-foreground">
                            <span className="mt-1.5 size-[7px] shrink-0 rounded-full" style={{ background: `var(--${f.cat})` }} />
                            <span className="[&_b]:font-semibold [&_b]:text-ink">
                              {f.conf === "check" ? <span className="mr-1.5 inline-block rounded-[5px] bg-[var(--check-bg)] px-1.5 py-px text-[10px] font-extrabold text-check align-[1px]">확인 필요</span>
                                : f.sev === "must" ? <span className="mr-1.5 inline-block rounded-[5px] bg-[var(--miss-bg)] px-1.5 py-px text-[10px] font-extrabold text-miss align-[1px]">꼭 확인</span> : null}
                              <span dangerouslySetInnerHTML={{ __html: f.t }} />
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="pl-0.5 text-[12.5px] font-semibold text-faint">이 단계는 지금 입력 기준으론 특별한 경고 없음.</p>
                    )}
                    {s[4]?.length > 0 && (
                      <Accordion type="single" collapsible className="mt-1">
                        <AccordionItem value={`cp-${s[0]}`}>
                          <AccordionTrigger className="rounded-[10px] bg-muted px-3 py-2.5 text-[12.5px] font-bold text-sub data-[state=open]:bg-accent data-[state=open]:text-[color:var(--accent-foreground)] [&>svg]:size-3.5">
                            이 공정에서 챙길 것 {s[4].length}가지
                          </AccordionTrigger>
                          <AccordionContent className="px-0 pb-0 pt-1.5">
                            <ul className="flex flex-col gap-2 rounded-[10px] border border-border bg-[color:var(--card)] px-3.5 py-3">
                              {s[4].map((c, i) => (
                                <li key={i} className="grid grid-cols-[auto_1fr] gap-2.5 text-[12.5px] leading-relaxed text-secondary-foreground">
                                  <span className="mt-[6px] size-[5px] shrink-0 rounded-full bg-[color:var(--primary)]/70" /><span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </div>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-4 rounded-[13px] bg-muted px-4 py-3.5 text-xs leading-relaxed text-sub [&_b]:text-secondary-foreground">
        <b>인테리어는 변수가 많아 모든 걸 짚을 순 없어요.</b> 위 '확인 필요'와 뜯어봐야 아는 부분은 현장에서 전문가와 꼭 확인하세요.
      </div>
    </div>
  )
}

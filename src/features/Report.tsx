import type { State } from "./types"
import { STAGES } from "./data"
import { evaluate, activeStages } from "./engine"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export function Report({ S }: { S: State }) {
  const F = evaluate(S)
  const active = activeStages(S, F)
  const sureMust = F.filter((f) => f.conf === "sure" && f.sev === "must")
  const checks = F.filter((f) => f.conf === "check")
  const hero = sureMust.slice(0, 4)
  const stages = STAGES.filter((s) => active[s[0]])

  return (
    <div>
      <div className="pt-2 pb-4 text-center">
        <div className="mx-auto mb-3 grid size-[52px] place-items-center rounded-2xl bg-primary text-2xl font-black text-white">✓</div>
        <h2 className="text-[22px] font-black text-ink mb-1">미리보기 결과</h2>
        <p className="text-[13.5px] font-medium text-sub">맡기기 전에 이것만 짚고 가세요.</p>
      </div>

      {/* 0층 */}
      <div className="mb-[18px] flex gap-2.5">
        <div className="flex-1 rounded-[14px] border bg-card p-3.5 text-center shadow-[0_1px_3px_rgba(25,31,40,0.06)]">
          <div className="text-[26px] font-black leading-none text-miss">{sureMust.length}</div>
          <div className="mt-1.5 text-xs font-bold text-sub">꼭 챙길 것</div>
        </div>
        <div className="flex-1 rounded-[14px] border bg-card p-3.5 text-center shadow-[0_1px_3px_rgba(25,31,40,0.06)]">
          <div className="text-[26px] font-black leading-none text-check">{checks.length}</div>
          <div className="mt-1.5 text-xs font-bold text-sub">확인 필요</div>
        </div>
      </div>

      {/* 1층 */}
      {hero.length ? (
        <>
          <p className="mb-2.5 text-base font-black text-ink">지금 꼭 챙길 것</p>
          <div className="mb-5 flex flex-col gap-2.5">
            {hero.map((f, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr] gap-2.5 rounded-[14px] border border-l-4 bg-card px-4 py-3.5 shadow-[0_1px_3px_rgba(25,31,40,0.06)]"
                style={{ borderLeftColor: `var(--${f.cat})` }}>
                <span className="mt-1.5 size-[9px] shrink-0 rounded-full" style={{ background: `var(--${f.cat})` }} />
                <span className="text-[14.5px] leading-relaxed text-secondary-foreground [&_b]:font-extrabold [&_b]:text-ink" dangerouslySetInnerHTML={{ __html: f.t }} />
              </div>
            ))}
          </div>
          {sureMust.length > hero.length && (
            <p className="-mt-3 mb-5 text-center text-[13px] font-bold text-[color:var(--primary)]">그 외 {sureMust.length - hero.length}개는 아래 '공사 순서'에서</p>
          )}
        </>
      ) : (
        <div className="mb-5 rounded-[14px] border border-l-4 border-l-primary bg-card px-4 py-3.5 text-[14.5px] leading-relaxed text-secondary-foreground [&_b]:font-extrabold [&_b]:text-ink">
          지금 입력 기준으론 <b>꼭 짚어야 할 큰 문제</b>는 없어요. 아래 '확인 필요'와 공정별 체크포인트를 살펴보세요.
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
                  <span className="text-sm leading-relaxed text-secondary-foreground [&_b]:font-extrabold [&_b]:text-ink" dangerouslySetInnerHTML={{ __html: f.t }} />
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
                            <span className="[&_b]:font-extrabold [&_b]:text-ink">
                              {f.conf === "check" ? <span className="mr-1.5 inline-block rounded-[5px] bg-[var(--check-bg)] px-1.5 py-px text-[10px] font-extrabold text-check align-[1px]">확인</span>
                                : f.sev === "must" ? <span className="mr-1.5 inline-block rounded-[5px] bg-[var(--miss-bg)] px-1.5 py-px text-[10px] font-extrabold text-miss align-[1px]">꼭</span> : null}
                              <span dangerouslySetInnerHTML={{ __html: f.t }} />
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="pl-0.5 text-[12.5px] font-semibold text-faint">이 단계는 지금 입력 기준으론 특별한 경고 없음.</p>
                    )}
                    {s[4]?.length > 0 && (
                      <Accordion type="single" collapsible>
                        <AccordionItem value={`cp-${s[0]}`}>
                          <AccordionTrigger className="rounded-[10px] bg-muted px-3 py-2 text-[12.5px] font-bold text-sub">이 공정에서 챙길 것</AccordionTrigger>
                          <AccordionContent className="px-1 pb-0 pt-2">
                            <ul className="flex flex-col gap-[7px]">
                              {s[4].map((c, i) => (
                                <li key={i} className="grid grid-cols-[auto_1fr] gap-2 text-[12.5px] leading-snug text-sub">
                                  <span className="mt-[7px] size-1 shrink-0 rounded-full bg-faint" /><span>{c}</span>
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
        <b>인테리어는 변수가 많아 다 맞출 순 없어요.</b> 위 '확인 필요'와 뜯어봐야 아는 건 현장·전문가와 꼭 짚으세요. 이건 예측할 수 있었던 실수를 미리 짚는 <b>점검·경고</b>이지 보증이 아니고, 업체 소개·수수료도 없어요.
      </div>
    </div>
  )
}

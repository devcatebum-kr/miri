import type { State } from "./types"
import { SPACES, WORKS, TILEW, FLOOROPT, SPACE_WORKS, WORK_ORDER, WORK_EMOJI } from "./data"
import { Chips, Options, Insight, H1, Sub } from "./controls"

type Toggle = (group: keyof State, key: string) => void
type SetField = (field: keyof State, value: string) => void

const tip = (html: string) => (
  <div className="mt-3 rounded-xl bg-muted px-3.5 py-3 text-[12.5px] leading-relaxed text-sub [&_b]:text-secondary-foreground" dangerouslySetInnerHTML={{ __html: html }} />
)
const blockLabel = (t: string) => <p className="mb-2.5 text-[15px] font-extrabold text-ink">{t}</p>

function insightFor(name: string, S: State): { tone: string; html: string } | null {
  if (name === "existing") {
    if (S.spaces.bath && S.bathDeot === "있음") return { tone: "alert", html: "욕실에 <b>덧방 이력</b>이 있으면 그 위에 또 덧방하긴 어려워요. 착공 후 <b>완전철거</b>로 갈 확률이 높아 예산·일정이 크게 바뀌어요." }
    if (S.spaces.bath && S.bathDeot === "모름") return { tone: "chk", html: "욕실 덧방 이력이 <b>모름</b>이면 리스크가 열려 있어요. 결과에서 '확인 필요'로 잡아둘게요. 위 확인법으로 착공 전 꼭 체크하세요." }
    if (S.spaces.kitchen && S.kitchenMove === "볼수전") return { tone: "warn", html: "싱크대 <b>물 자리</b>를 옮기면 배관 이동 + 몰탈이 따라와요. 온수 분배기 위치 때문에 못 옮기기도 하니 실측 때 확인하세요." }
    return null
  }
  if (name === "age") {
    if (S.age === "구축" || S.prevReno === "있음") return { tone: "warn", html: `<b>${S.age === "구축" ? "구축" : "이전 인테리어 이력"}</b>이면 겉이 멀쩡해도 뜯으면 추가금이 거의 확실해요. <b>예비비</b>를 예산의 10~15%쯤 미리 잡아두세요.` }
    return null
  }
  return null
}

const WLABEL: Record<string, string> = Object.fromEntries(WORKS.map(([k, l]) => [k, l]))

// 상단 고정 '내 공사 순서' 레일 — 고른 공정을 공사 순서대로 쌓아 보여줌(잠금 없음)
function OrderRail({ S }: { S: State }) {
  const ordered = WORK_ORDER.filter((k) => S.works[k])
  return (
    <div className="sticky top-[64px] z-[9] -mx-[18px] mb-5 border-b bg-background/95 px-[18px] py-2.5 backdrop-blur">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-[11px] font-extrabold tracking-wide text-sub">내 공사 순서</span>
        {ordered.length > 0 && <span className="text-[11px] font-bold text-faint">{ordered.length}개 · 왼쪽부터 진행</span>}
      </div>
      {ordered.length === 0 ? (
        <p className="py-1 text-[12.5px] font-medium text-faint">아래에서 공정을 고르면 여기에 <b className="font-bold text-sub">공사 순서대로</b> 쌓여요.</p>
      ) : (
        <div className="flex items-center gap-0 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ordered.map((k, i) => (
            <div key={k} className="flex shrink-0 items-center">
              {i > 0 && <span className="mx-0.5 h-px w-3 bg-input" />}
              <span className="animate-in fade-in zoom-in-95 duration-200 inline-flex items-center gap-1 rounded-full border border-primary/25 bg-accent px-2.5 py-1 text-[12.5px] font-bold text-[color:var(--accent-foreground)]">
                <span className="text-[13px] leading-none">{WORK_EMOJI[k]}</span>{WLABEL[k]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 공간 + 공정 한 화면. 공간을 고르면 그 공간에서 주로 하는 공정을 묶어서 보여줌(미리 체크는 안 함)
export function Scope({ S, toggle }: { S: State; toggle: Toggle }) {
  const picked = SPACES.filter(([k]) => S.spaces[k])
  const byOrder = (keys: string[]) => [...keys].sort((a, b) => WORK_ORDER.indexOf(a) - WORK_ORDER.indexOf(b))
  // 각 공정이 '선택한 공간' 중 몇 곳에 걸리는지 — 2곳 이상이면 공통, 1곳이면 그 공간 전용
  const count: Record<string, number> = {}
  picked.forEach(([k]) => (SPACE_WORKS[k] || []).forEach((w) => { count[w] = (count[w] || 0) + 1 }))
  const commonKeys = byOrder(Object.keys(count).filter((w) => count[w] >= 2))
  const groups = picked.map(([k, label, emoji]) => ({
    k, label, emoji, keys: byOrder((SPACE_WORKS[k] || []).filter((w) => count[w] === 1)),
  })).filter((g) => g.keys.length)
  const rest = WORKS.map(([k]) => k).filter((k) => !(k in count))
  const pool = (keys: string[]) => keys.map((k) => [k, WLABEL[k]] as [string, string, string?])
  const multi = picked.length > 1
  return (<div><H1>어디를, 뭘 하시나요?</H1><Sub>공간을 고르면 그 공간에서 주로 하는 공정이 아래에 나와요.</Sub>
    <div className="mb-7">{blockLabel("공간")}
      <Chips pool={SPACES} selected={S.spaces} onToggle={(k) => toggle("spaces", k)} /></div>
    {picked.length > 0 && <>
      <OrderRail S={S} />
      {blockLabel("계획·견적에 들어 있는 공정을 골라주세요")}
      <div className="flex flex-col gap-5">
        {commonKeys.length > 0 && (
          <div>
            <p className="mb-2 text-[13px] font-bold text-sub">🧩 여러 공간에 공통</p>
            <Chips pool={pool(commonKeys)} selected={S.works} onToggle={(k) => toggle("works", k)} />
          </div>
        )}
        {groups.map((g) => (
          <div key={g.k}>
            <p className="mb-2 text-[13px] font-bold text-sub">{g.emoji} {multi ? `${g.label}만` : g.label}에서 주로 하는 것</p>
            <Chips pool={pool(g.keys)} selected={S.works} onToggle={(k) => toggle("works", k)} />
          </div>
        ))}
        {rest.length > 0 && <div>
          <p className="mb-2 text-[13px] font-bold text-sub">그 밖의 공정</p>
          <Chips pool={pool(rest)} selected={S.works} onToggle={(k) => toggle("works", k)} />
        </div>}
      </div>
      {tip(multi ? "여러 공간에 공통으로 들어가는 공정은 <b>공통</b>에 한 번만 모았어요. 철거·타일 같은 건 공간마다 또 고를 필요 없어요." : "계획이나 견적에 있는 것만 고르면 돼요.")}
      {S.works.tile && <div className="mt-6">{blockLabel("타일은 어디에 하시나요?")}
        <Chips pool={TILEW as [string, string, string?][]} selected={S.tileWhere} onToggle={(k) => toggle("tileWhere", k)} /></div>}
    </>}
  </div>)
}

export function Existing({ S, toggle, setField }: { S: State; toggle: Toggle; setField: SetField }) {
  const any = S.spaces.bath || S.spaces.kitchen || S.spaces.living
  const ins = insightFor("existing", S)
  return (<div><H1>지금 상태는 어떤가요?</H1><Sub>모르면 '모름'을 고르세요. 모름도 결과에 반영돼요.</Sub>
    {S.spaces.bath && <div className="mb-6">{blockLabel("욕실. 예전에 덧방(기존 타일 위 새 타일)한 적 있나요?")}
      <Options value={S.bathDeot} onChange={(v) => setField("bathDeot", v)} opts={[["있음", "있다, 또는 그런 것 같다"], ["없음", "없다 (뼈대까지 철거했었다)"], ["모름", "모르겠다"]]} />
      {tip("확인법. 타일을 두드려 <b>텅텅</b> 소리가 나거나, 문틀과 타일 사이 <b>단차가 유난히 없으면</b> 이미 덧방된 것일 수 있어요.")}</div>}
    {S.spaces.kitchen && <div className="mb-6">{blockLabel("주방. 싱크대를 옮기시나요?")}
      <Options value={S.kitchenMove} onChange={(v) => setField("kitchenMove", v)} opts={[["안옮김", "안 옮긴다"], ["가구만", "가구만 옮긴다 (물 자리는 그대로)"], ["볼수전", "볼·수전(물 쓰는 자리)까지 옮긴다"], ["모름", "모르겠다"]]} /></div>}
    {S.spaces.living && <div className="mb-6">{blockLabel("거실·방. 지금 바닥재가 무엇인가요? (여러 개면 다 선택)")}
      <Chips pool={FLOOROPT} selected={S.floorType} onToggle={(k) => toggle("floorType", k)} /></div>}
    {!any && <p className="text-sm font-medium text-faint">고르신 공간엔 따로 물어볼 게 없어요. 다음으로 넘어가셔도 돼요.</p>}
    {ins && <Insight tone={ins.tone} html={ins.html} />}</div>)
}

export function Context({ S, setField }: { S: State; setField: SetField }) {
  const ins = insightFor("age", S)
  return (<div><H1>마지막으로, 집과 맡기는 방식</H1><Sub>겉이 멀쩡해도 배관·전선은 연식을 따라가요.</Sub>
    <div className="mb-6">{blockLabel("준공 연식")}
      <Options value={S.age} onChange={(v) => setField("age", v)} opts={[["구축", "구축, 약 20년 이상"], ["준신축", "준신축, 10~20년"], ["신축", "신축, 10년 이내"], ["모름", "모르겠다"]]} />
      {tip("모르면 <b>호갱노노·네이버부동산</b>에서 준공연도를 확인할 수 있어요.")}</div>
    <div className="mb-6">{blockLabel("예전에 인테리어(리모델링)한 적 있나요?")}
      <Options value={S.prevReno} onChange={(v) => setField("prevReno", v)} opts={[["있음", "있다 (전 주인이 했든, 내가 했든)"], ["없음", "없다, 원래 상태"], ["모름", "모르겠다"]]} /></div>
    <div className="mb-2">{blockLabel("어떻게 맡기시나요?")}
      <Options value={S.order} onChange={(v) => setField("order", v)}
        opts={[["턴키", "한 업체에 통째로 (턴키)", "한 곳이 전 공정을 맡음"], ["반셀프", "공정별로 따로 (반셀프)", "도배·타일·목공을 각각 다른 곳에"]]} /></div>
    {ins && <Insight tone={ins.tone} html={ins.html} />}</div>)
}

// ---- Review ----
function Tag({ children, empty }: { children: React.ReactNode; empty?: boolean }) {
  return <span className={empty
    ? "inline-flex items-center rounded-full border border-dashed border-border px-2.5 py-1 text-[13px] font-bold text-faint"
    : "inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-[13px] font-bold text-ink"}>{children}</span>
}
function tagsFor(name: string, S: State) {
  const el: React.ReactNode[] = []
  if (name === "space") {
    const v = SPACES.filter((s) => S.spaces[s[0]])
    return v.length ? v.map((s) => <Tag key={s[0]}>{s[2]} {s[1]}</Tag>) : [<Tag key="e" empty>선택 안 함</Tag>]
  }
  if (name === "existing") {
    if (S.spaces.bath) el.push(<Tag key="b">🛁 덧방 {S.bathDeot || "미정"}</Tag>)
    if (S.spaces.kitchen) el.push(<Tag key="k">🍳 싱크대 {S.kitchenMove || "미정"}</Tag>)
    if (S.spaces.living) { const f = FLOOROPT.filter((x) => S.floorType[x[0]]).map((x) => x[1]); el.push(<Tag key="l">🛋 바닥 {f.length ? f.join("·") : "미정"}</Tag>) }
    return el.length ? el : [<Tag key="e" empty>해당 없음</Tag>]
  }
  if (name === "age") return [<Tag key="a">🏢 {S.age || "연식 미정"}</Tag>, <Tag key="p">🕓 이전 인테리어 {S.prevReno || "미정"}</Tag>]
  if (name === "works") {
    const w = WORKS.filter((x) => S.works[x[0]])
    w.forEach((x) => el.push(<Tag key={x[0]}>{x[1]}</Tag>))
    if (!w.length) el.push(<Tag key="e" empty>선택 안 함</Tag>)
    if (S.works.tile) { const tw = TILEW.filter((x) => S.tileWhere[x[0]]).map((x) => x[1]); if (tw.length) el.push(<Tag key="tw">🧱 타일:{tw.join(",")}</Tag>) }
    return el
  }
  if (name === "order") return S.order ? [<Tag key="o">{S.order === "턴키" ? "📦" : "🧩"} {S.order}</Tag>] : [<Tag key="e" empty>선택 안 함</Tag>]
  return el
}

export function Summary({ S, goTo, wiz }: { S: State; goTo: (name: string) => void; wiz: [string, string][] }) {
  const parts: [string, string][] = [["space", "scope"], ["works", "scope"], ["existing", "existing"], ["age", "context"], ["order", "context"]]
  return (
    <div className="mb-5 rounded-[14px] border bg-card p-4 shadow-[0_1px_3px_rgba(25,31,40,0.06)]">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[12.5px] font-extrabold text-sub">넣으신 내용</span>
        <div className="flex gap-3">
          {wiz.map(([k, l]) => <button key={k} type="button" onClick={() => goTo(k)} className="text-[12.5px] font-extrabold text-[color:var(--primary)]">{l} 수정</button>)}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">{parts.flatMap(([n]) => tagsFor(n, S)).map((t, i) => <span key={i}>{t}</span>)}</div>
    </div>)
}

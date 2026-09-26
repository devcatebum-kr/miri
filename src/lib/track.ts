import { createClient } from "@supabase/supabase-js"
import type { State } from "@/features/types"

// 공개 anon 키 — 웹페이지에 노출되는 게 정상. RLS(insert-only)로 읽기·수정·삭제 차단됨.
const SUPABASE_URL = "https://pqllhtvwveecnkhntezk.supabase.co"
const SUPABASE_ANON = "sb_publishable_-Q1DNqGSAZzSQtvOMuUiqg_4sdSB724"

const enabled = !SUPABASE_URL.startsWith("__")
const sb = enabled ? createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } }) : null

// 익명 세션 id (브라우저별). 실패해도 무해.
function sessionId(): string {
  try {
    let s = localStorage.getItem("ng_sid")
    if (!s) { s = crypto.randomUUID(); localStorage.setItem("ng_sid", s) }
    return s
  } catch { return "nostore" }
}

// 결과 도달 시 케이스 저장 — 세션·입력조합당 1회(재평가로 중복 저장 방지)
const submitted = new Set<string>()
export function trackSubmission(S: State, counts: { must: number; check: number; orphan: number }) {
  if (!sb) return
  const key = JSON.stringify([S.spaces, S.works, S.bathDeot, S.kitchenMove, S.floorType, S.age, S.prevReno, S.order])
  if (submitted.has(key)) return
  submitted.add(key)
  void sb.from("submissions").insert({
    session_id: sessionId(),
    spaces: S.spaces, works: S.works,
    bath_deot: S.bathDeot || null, kitchen_move: S.kitchenMove || null, floor_type: S.floorType,
    age: S.age || null, prev_reno: S.prevReno || null, order_type: S.order || null,
    must_count: counts.must, check_count: counts.check, orphan_count: counts.orphan,
  }).then(() => {}, () => {})
}

// 행동 이벤트 (already_have / dismiss / cta_click 등)
export function trackEvent(type: string, stage?: string, payload?: unknown) {
  if (!sb) return
  void sb.from("events").insert({
    session_id: sessionId(), type, stage: stage || null, payload: payload ?? null,
  }).then(() => {}, () => {})
}

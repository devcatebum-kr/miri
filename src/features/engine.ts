import type { Cat, Sev, Conf, Finding, State } from "./types"

export function evaluate(S: State): Finding[] {
  const sp = S.spaces, W = S.works, split = S.order === "반셀프"
  // 선택한 공간의 하위질문을 안 골랐으면(빈값) '모름'으로 취급 — 결과에서 조용히 누락되지 않게
  const bathDeot = sp.bath && !S.bathDeot ? "모름" : S.bathDeot
  const km = sp.kitchen && !S.kitchenMove ? "모름" : S.kitchenMove
  const age = S.age || "모름"
  const F: Finding[] = []
  const A = (cat: Cat, sev: Sev, conf: Conf, stage: string, t: string) => F.push({ cat, sev, conf, stage, t })
  const floors = Object.keys(S.floorType).filter((k) => S.floorType[k] && k !== "모름")

  // 철거
  if ((age === "구축" || S.prevReno === "있음") && W.demo)
    A("miss", "must", "sure", "demo", "구축이나 이전 인테리어 이력이 있으면 철거 후 <b>추가금</b>이 거의 확실해요. 예비비를 예산의 10~15%쯤 잡으세요.")
  if (age === "모름" && W.demo)
    A("time", "normal", "check", "demo", "집 <b>연식이 '모름'</b>이에요. 구축(20년 이상)이면 철거 후 추가금·노후 배관 리스크가 커지니 준공연도를 확인하세요.")
  if (sp.bath && bathDeot === "있음")
    A("order", "must", "sure", "demo", "욕실 <b>덧방 이력 있음</b>. 그 위 재덧방은 같이 떨어질 위험이 커요. 완전철거 기준으로 예산·순서를 잡으세요.")
  if (sp.bath && bathDeot === "모름")
    A("order", "normal", "check", "demo", "<b>욕실 덧방 이력을 확인하세요.</b> 두드려 텅텅 소리, 문틀·타일 단차가 유난히 없으면 이미 덧방됐을 수 있어요. 덧방이면 완전철거로 갈 확률이 높아요.")
  // 욕실 덧방: 치수 누적 (덧방 이력 없음 = 덧방으로 갈 가능성)
  if (sp.bath && bathDeot === "없음") {
    A("order", "must", "sure", "tile", "<b>덧방하면 타일이 1cm쯤 두꺼워져요.</b> 문틀보다 타일이 튀어나오거나, 좁은 욕실은 변기 때문에 문이 안 닫히기도 해요. 기존 타일에 큰 균열·들뜸이 있으면 덧방 말고 철거하세요.")
    A("miss", "normal", "check", "tile", "덧방 전에 <b>기존 바닥 구배(물 빠지는 기울기)</b>를 확인하세요. 그대로 덮으면 물고임이 그대로 남아요. 젠다이(욕조·세면대 옆 선반)가 있으면 배관 연장이 필요한지도 물어보세요.")
  }
  // 구축 철거 예산 폭탄
  if (age === "구축" && W.demo && W.floor)
    A("miss", "normal", "check", "demo", "구축은 <b>바닥 밑 보일러 배관이 얕게 묻힌</b> 경우가 있어요. 바닥 철거 중 깨지면 배관 재공사가 붙으니 예비비에 넣어두세요.")
  if (age === "구축" && W.demo && W.paper)
    A("miss", "normal", "check", "paper", "구축은 벽지를 뜯으면 <b>벽면이 성하지 않은</b> 경우가 많아요. 도배만으로 못 덮으면 미장·면 고르기가 추가돼요.")
  if (W.floor && S.floorType["장판"])
    A("miss", "normal", "check", "floor", "기존이 <b>장판</b>이면 몇 겹 깔렸는지, 한지장판인지에 따라 철거비와 시공 가능 여부가 크게 달라져요. 철거 전에 모서리를 들춰 확인하세요.")
  // 설비·미장
  if (W.plumb || km === "볼수전")
    A("miss", "must", "sure", "plumb", "배관을 건드린 자리는 <b>몰탈·미장</b>으로 되메우고 평탄을 잡아야 해요. 견적에 미장이 들어 있나요?")
  if (km === "볼수전")
    A("order", "must", "sure", "plumb", "싱크대 <b>물 자리(볼·수전)</b>를 옮기면 급배수 배관이 따라와요. 뒤에 온수 분배기가 있으면 못 옮기기도 하니 실측 때 확인하세요.")
  if (km === "모름" && sp.kitchen)
    A("order", "normal", "check", "plumb", "싱크대를 <b>가구만 옮기는지, 물 자리까지 옮기는지</b> 정해야 해요. 물 자리를 옮기면 배관·몰탈이 따라와 공사가 커져요.")
  // 창호
  if (W.win)
    A("time", "normal", "sure", "win", "<b>창호(샷시)</b>는 납기가 길어요. 미리 발주하고, 교체 날은 다른 공정을 안 넣는 별도 시공일로 잡으세요.")
  if (W.win && W.carpent)
    A("order", "normal", "check", "win", "<b>목공과 샷시 선후는 케이스별</b>이에요. 보통 샷시를 먼저 하지만 확장·구조에 따라 달라지니 업체와 확인하세요.")
  // 확장·단열
  if (sp.expand || W.insul) {
    A("miss", "must", "sure", "expand", "<b>확장은 단열·바닥 난방 연장·창호 하부 방수·결로 대비</b>가 다 따라와요. 하나만 빠지면 겨울에 결로·곰팡이나 난방 사각이 생겨요.")
    if (split)
      A("resp", "normal", "sure", "expand", "확장을 <b>여러 업체</b>로 나누면 나중에 결로·누수가 나도 단열 탓인지 창호 탓인지 책임이 흐려져요. 경계를 못박으세요.")
  }
  // 전기
  if ((sp.kitchen || sp.bath) && !W.elec)
    A("miss", "normal", "check", "elec", "주방·욕실을 하는데 <b>전기</b>가 안 보여요. 콘센트·조명 위치를 바꾸면 전기 공정이 필요할 수 있으니 확인하세요.")
  if (W.light && !W.elec)
    A("miss", "normal", "sure", "elec", "<b>조명</b>을 넣는데 전기가 없어요. 매입등·위치 변경은 배선·타공이 따라와요.")
  // 목공
  if (W.light)
    A("order", "normal", "sure", "carpent", "<b>조명을 따로 잡으면 배선(전기)·타공(목공)이 앞 단계에서 같이 물려요.</b> 매입등 위치를 목공·전기 때 미리 잡아야 마감 후 안 뜯어요.")
  if (W.paper && W.carpent)
    A("miss", "normal", "sure", "paper", "목공 뒤 <b>빠대(면처리)</b>가 도배 전에 들어가야 해요. 무몰딩이면 특히 필수인데 견적에서 잘 빠져요.")
  if (W.carpent && W.paper && split)
    A("resp", "must", "sure", "carpent", "<b>목공과 도배 사이.</b> 목공이 세운 면을 도배가 덮어요. 목공이 대충 하면 하자는 도배가 뒤집어써요. 목공 계약에 면 평탄도 기준을 적어두세요.")
  // 방수
  if (sp.bath && !W.water)
    A("miss", "must", "sure", "water", "욕실인데 <b>방수</b>가 안 보여요. 방수가 빠지면 아랫집 누수로 이어져요.")
  if (W.water)
    A("time", "normal", "sure", "water", "<b>방수는 여러 겹 바르고 말리느라 며칠 걸려요</b>(액체 여러 회 + 도막). 다 마른 뒤에 타일을 붙여야 하자가 안 나요. 일정에 이 며칠이 잡혀 있나요?")
  // 타일
  if (W.tile && S.tileWhere.bath)
    A("order", "normal", "sure", "tile", "<b>욕실 타일</b>은 방수·구배(물매)를 잡고 벽→바닥 순으로 붙여요. 구배가 틀리면 물이 안 빠져요.")
  if (W.tile && S.tileWhere.kit)
    A("order", "normal", "sure", "tile", "<b>주방 벽타일(상하부장 사이)</b>은 상부장 설치·콘센트·후드 위치와 물려요. 타일 전에 그 위치부터 확정하세요.")
  if (W.tile || sp.bath)
    A("miss", "normal", "sure", "final", "<b>코킹(실리콘 마감)</b>이 견적에 있는지 보세요. 타일·도기 이음새 물샘을 막는 마무리인데 자주 빠져요.")
  // 도배·바닥
  if (W.floor && W.paper) {
    if (floors.length > 1)
      A("order", "normal", "check", "floor", `바닥재가 <b>${floors.join("·")}</b>로 섞여 있어요. 재질마다 도배·바닥 순서가 다르고, 만나는 곳 마감이 달라지니 확인이 필요해요.`)
    else {
      const ft = floors[0] || ""
      let b = "<b>도배와 바닥 순서</b>는 바닥재가 좌우해요. "
      let cf: Conf = "sure"
      if (ft === "강마루") b += "지금 강마루라 걸레받이·마루를 먼저 잡는 흐름이에요."
      else if (ft === "장판") b += "지금 장판이라 도배를 먼저 하고 장판으로 덮는 흐름이에요."
      else { b += "기존 바닥이 정해지면 순서도 정해져요. 먼저 확인하세요."; cf = "check" }
      A("order", "normal", cf, "floor", b)
    }
  }
  if (W.floor && !W.mold)
    A("miss", "normal", "sure", "floor", "바닥을 새로 하는데 <b>걸레받이·몰딩</b>이 안 보여요. 벽·바닥 마무리를 누가 하는지 확인하세요.")
  if (W.floor && floors.length > 1)
    A("resp", "normal", "sure", "floor", "<b>바닥재가 여러 개면 만나는 곳(문턱·경계)</b>의 높이차·마감 책임을 정해두세요. 안 정하면 단차·틈이 생겨요.")
  // 누수 책임: 명목 책임 ≠ 실제 원인
  if (sp.bath && split && (W.water || W.tile))
    A("resp", "must", "sure", "dogi", "<b>욕실 누수는 방수보다 변기·세면대 설치나 덧방 때 충격에서 더 많이 나요.</b> 업체가 나뉘면 서로 방수 탓을 해요. 도기 설치 업체에도 누수 책임 범위를 적어두세요.")
  // 일정
  if (split)
    A("time", "normal", "sure", "final", "업체가 공정별로 다르면 한 곳만 밀려도 뒤가 다 밀려요. 공정 사이에 <b>버퍼</b>를 두고, 앞 공정 완료를 확인하고 다음을 부르세요.")
  if (age === "구축" || S.prevReno === "있음")
    A("time", "normal", "sure", "final", "뜯고 나서 추가 공정이 생기면 일정도 같이 밀려요. 며칠 여유를 두세요.")
  // 책임
  if (split) {
    if (W.tile && W.paper)
      A("resp", "normal", "sure", "tile", "<b>타일과 도배 경계</b>(모서리 마감)는 서로 내 일이 아니라 하기 쉬워요. 마감 책임자를 미리 정하세요.")
    if (W.floor && (W.paper || W.tile))
      A("resp", "normal", "sure", "floor", "<b>벽과 바닥 이음새</b>(걸레받이·코킹)를 누가 마무리할지 정해두세요.")
    if (sp.kitchen && W.tile)
      A("resp", "normal", "sure", "kitchenfit", "<b>주방</b>은 가구·타일·전기가 서로 물려요. 순서와 실측 책임을 한 사람에게 묶어두세요.")
  } else if (S.order === "턴키") {
    A("resp", "normal", "sure", "final", "한 업체에 맡기면 책임은 단순해요. 대신 <b>무엇까지 포함인지</b>를 계약서에 구체적으로 쓰세요. 빠진 공정은 나중에 추가금으로 돌아와요.")
  }
  return F
}

// 타임라인엔 '고른 것'만: 선택 공정 + 선택 공간에 딸린 단계(욕실 기구·주방 가구) + 마감
export function activeStages(S: State): Record<string, boolean> {
  const a: Record<string, boolean> = {}
  const W = S.works, sp = S.spaces
  ;["demo", "plumb", "win", "elec", "carpent", "water", "tile", "paper", "floor", "light", "film", "paint"].forEach((k) => { if (W[k]) a[k] = true })
  if (sp.expand || W.insul) a.expand = true
  if (sp.bath) a.dogi = true
  if (sp.kitchen) a.kitchenfit = true
  a.final = true
  return a
}

export const strip = (s: string) => s.replace(/<[^>]+>/g, "").trim()

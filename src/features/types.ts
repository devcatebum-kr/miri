export type Cat = "miss" | "order" | "time" | "resp"
export type Sev = "must" | "normal"
export type Conf = "sure" | "check"

export interface Finding {
  cat: Cat
  sev: Sev
  conf: Conf
  stage: string
  t: string
}

export interface State {
  spaces: Record<string, boolean>
  bathDeot: string
  kitchenMove: string
  floorType: Record<string, boolean>
  age: string
  prevReno: string
  works: Record<string, boolean>
  tileWhere: Record<string, boolean>
  order: string
}

export const emptyState = (): State => ({
  spaces: {}, bathDeot: "", kitchenMove: "", floorType: {},
  age: "", prevReno: "", works: {}, tileWhere: {}, order: "",
})

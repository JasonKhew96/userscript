import VM from "@violentmonkey/dom"

declare global {
  interface Response {
    __json(): Promise<any>
  }
  interface HTMLLIElement {
    [key: string]: any
  }
}

const dateTimeformatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Tokyo",
})
const whitelist = [
  "com-contentlist-ContentlistContainer",
  "com-contentlist-ContentlistSectionList",
]
const episodeMap = new Map()

Response.prototype.__json = Response.prototype.json
Response.prototype.json = function () {
  const __this: globalThis.Response = this
  let jsonPromise: Promise<any> = __this.__json.apply(__this)
  jsonPromise = jsonPromise.then((res) => {
    if ("episodeGroupContents" in res) {
      for (const content of res.episodeGroupContents) {
        episodeMap.set(content.id, content)
      }
    }
    return res
  })
  return jsonPromise
}

VM.observe(
  document.body,
  (mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      const target: Node = mutation.target
      const addedNodes = mutation.addedNodes
      if (!addedNodes.length) continue
      if (!(target instanceof HTMLDivElement)) continue
      if (!whitelist.includes(target.classList[0])) continue
      const episodes: NodeListOf<Element> = target.querySelectorAll(
        ".com-contentlist-ItemListForContentlistContent__item",
      )
      for (const episode of episodes) {
        if (!(episode instanceof HTMLLIElement)) continue
        const keys = Object.keys(episode).filter((key) =>
          key.startsWith("__reactFiber"),
        )
        if (keys.length <= 0) {
          console.error("couldn't find any key starts with __reactFiber")
          continue
        }
        const key = keys.at(0) as string
        const id = episode[key].key
        const contents = episodeMap.get(id)
        const term = contents.video.terms[0]
        const endAt = dateTimeformatter.format(new Date(term.endAt * 1000))
        const onDemandType = term.onDemandType == 1 ? "プレミアム" : "無料"
        const span: HTMLSpanElement | null = episode.querySelector(
          ".com-shared-viewing_type-ViewingTypeLabel__text",
        )
        if (!span) continue
        span.textContent = onDemandType + " ～ " + endAt
      }
    }
  },
)

// ==UserScript==
// @name        Abema premium/free ends time
// @match       https://abema.tv/*
// @grant       none
// @version     1.4
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @author      JasonKhew96
// @description shows abema premium/free ends time
// ==/UserScript==

;(() => {
  const dateTimeformatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  })
  const whitelist = [
    "com-content-list-ContentListEpisodeItem__overview",
    "com-content-list-ContentListItemList",
    "c-application-DesktopAppContainer__main",
    "com-content-list-ContentListItemList",
  ]

  const episodeMap = new Map()
  /** @type {globalThis.Window} */
  const win =
    typeof unsafeWindow === "object"
      ? unsafeWindow
      : typeof window === "object"
      ? window
      : this
  ;((Response) => {
    Response.prototype.__json = Response.prototype.json
    Response.prototype.json = function () {
      /** @type {globalThis.Response} */
      const __this = this
      /** @type {Promise<any>} */
      let jsonPromise = __this.__json.apply(__this, arguments)
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
  })(win.Response)

  VM.observe(
    document.body,
    (
      /** @type {MutationRecord[]} */ mutations,
      /** @type {MutationObserver} */ observer
    ) => {
      for (const mutation of mutations) {
        /** @type {HTMLElement} */
        const target = mutation.target
        const addedNodes = mutation.addedNodes
        if (!addedNodes.length) continue
        if (
          !whitelist.includes(target.classList[0]) &&
          target.tagName != "MAIN"
        )
          continue
        const episodes = target.className.includes(
          "com-content-list-ContentListEpisodeItem__overview"
        )
          ? [target]
          : target.querySelectorAll(
              ".com-content-list-ContentListEpisodeItem__overview"
            )
        for (const episode of episodes) {
          const url = new URL(
            episode.querySelector(
              ".com-content-list-ContentListEpisodeItem__link"
            ).href
          )
          const id = url.pathname.split("/").reverse()[0]
          const contents = episodeMap.get(id)
          const term = contents.video.terms[0]
          const endAt = dateTimeformatter.format(new Date(term.endAt * 1000))
          const onDemandType = term.onDemandType == 1 ? "プレミアム" : "無料"
          const span = episode.querySelector(".com-vod-VODLabel__text")
          span.textContent = onDemandType + " ～ " + endAt
        }
      }
    }
  )
})()

// ==UserScript==
// @name        Abema premium/free ends time
// @match       https://abema.tv/*
// @grant       none
// @version     1.2
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @author      JasonKhew96
// @description shows abema premium/free ends time
// ==/UserScript==

;(() => {
  const episodeMap = new Map()
  /** @type {globalThis.Window} */
  const win =
    typeof unsafeWindow === 'object'
      ? unsafeWindow
      : typeof window === 'object'
      ? window
      : this
  ;(Response => {
    Response.prototype.__json = Response.prototype.json
    Response.prototype.json = function () {
      /** @type {globalThis.Response} */
      const __this = this
      /** @type {Promise<any>} */
      let jsonPromise = __this.__json.apply(__this, arguments)
      jsonPromise = jsonPromise.then(res => {
        if ('episodeGroupContents' in res) {
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
        const addedNode = addedNodes[0]
        const whitelist = [
          'com-content-list-ContentListEpisodeItem__overview',
          'com-content-list-ContentListItemList com-content-list-ContentListItemList--rounded-bottom',
          'c-application-DesktopAppContainer__main',
          'com-content-list-ContentListItemList'
        ]
        if (!whitelist.includes(target.className)) continue
        const episodes =
          target.className ==
          'com-content-list-ContentListEpisodeItem__overview'
            ? [target]
            : target.querySelectorAll(
                '.com-content-list-ContentListEpisodeItem__overview'
              )
        for (const episode of episodes) {
          const id = episode
            .querySelector('.com-content-list-ContentListEpisodeItem__link')
            .href.split('/')
            .reverse()[0]
          const contents = episodeMap.get(id)
          const term = contents.video.terms[0]
          const endAt = term.endAt
          const onDemandType = term.onDemandType == 1 ? 'プレミアム' : '無料'
          const span = episode.querySelector('.com-vod-VODLabel__text')
          span.textContent =
            onDemandType + ' - ' + new Date(endAt * 1000).toLocaleString()
        }
      }
    },
    // {
    //   childList: true
    // }
  )
})()

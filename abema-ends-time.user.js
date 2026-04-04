// ==UserScript==
// @name        Abema premium/free ends time
// @match       https://abema.tv/*
// @grant       none
// @version     1.8
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @author      JasonKhew96
// @description shows abema premium/free ends time
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/abema-ends-time.user.js
// ==/UserScript==

;(() => {
  const dateTimeformatter = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo'
  })
  const whitelist = [
    'com-contentlist-ContentlistContainer',
    'com-contentlist-ContentlistSectionList'
  ]

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
        if (!whitelist.includes(target.classList[0]) || target.tagName != 'DIV')
          continue

        const episodes = target.querySelectorAll(
          '.com-contentlist-SectionItemList__item'
        )
        for (const episode of episodes) {
          const id =
            episode[
              Object.keys(episode).filter(key =>
                key.startsWith('__reactFiber')
              )[0]
            ].key
          const contents = episodeMap.get(id)
          const term = contents.video.terms[0]
          const endAt = dateTimeformatter.format(new Date(term.endAt * 1000))
          const onDemandType = term.onDemandType == 1 ? 'プレミアム' : '無料'
          const span = episode.querySelector(
            '.com-shared-viewing_type-ViewingTypeLabel__text'
          )
          span.textContent = onDemandType + ' ～ ' + endAt
        }
      }
    }
  )
})()

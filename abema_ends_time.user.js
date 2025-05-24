// ==UserScript==
// @name        Abema premium/free ends time
// @match       https://abema.tv/video/*
// @grant       none
// @version     1.0
// @author      JasonKhew96
// @description shows abema premium/free ends time
// ==/UserScript==

;(() => {
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
          const contents = res.episodeGroupContents
          setTimeout(() => {
            for (const content of contents) {
              const term = content.video.terms[0]
              const id = content.id
              const span = document
                .querySelector(
                  `.com-content-list-ContentListEpisodeItem__link[href$="${id}"]`
                )
                .closest('.com-content-list-ContentListEpisodeItem__overview')
                .querySelector('.com-vod-VODLabel > span')
              const endAt = new Date()
              endAt.setTime(term.endAt * 1000)
              span.textContent =
                span.textContent + ' ' + endAt.toLocaleString()
            }
          }, 500)
        }
        return res
      })
      return jsonPromise
    }
  })(win.Response)
})()

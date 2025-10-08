// ==UserScript==
// @name        Better Crunchyroll simulcast calendar
// @match       https://www.crunchyroll.com/simulcastcalendar*
// @grant       none
// @version     2.0
// @author      JasonKhew96
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/crunchyroll-calendar.user.js
// ==/UserScript==

;(() => {
  const releases = document.querySelectorAll('.releases > li')
  releases.forEach(r => {
    const name = r.querySelector("cite[itemprop='name']").textContent
    if (name.includes('Dub')) {
      r.remove()
      return
    }
    const link = r.querySelector('.available-episode-link').href
    const match = link.match(/\/watch\/([A-Z,0-9]{9,})+\//)
    if (match && match[1].length > 9 && !match[1].endsWith('JAJP')) {
      r.remove()
      return
    }
  })

  var shortTime = new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short'
  })
  const times = document.querySelectorAll('time')
  times.forEach(t => {
    t.textContent = shortTime.format(Date.parse(t.getAttribute('datetime')))
  })
})()

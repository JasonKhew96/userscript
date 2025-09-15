// ==UserScript==
// @name        新番授權情報助手
// @match       https://ani.gamer.com.tw/seasonal.php*
// @grant       none
// @version     1.0
// @author      JasonKhew96
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/anigamer-seasonal.user.js
// ==/UserScript==

(() => {
  const s = document.createElement("style")
  s.innerHTML = ".btn-details{display:flex;text-align:center;align-items:center;justify-content:center;padding:8px 12px;border:1px solid var(--anime-tertiary-color);border-radius:6px;color:var(--anime-tertiary-color);background-color:transparent;cursor:pointer;white-space:nowrap;word-break:keep-all;width:100%}.btn-details:hover{background-color:var(--anime-tertiary-color);color:rgba(255,255,255,.95)}";
  document.head.appendChild(s)

  const btns = document.querySelectorAll(".btn-subscribe")
  for (btn of btns) {
    const id = btn.dataset.gtmVar1

    const c = document.createElement('div')
    c.classList.add('btn-details')
    c.textContent = "作品資料"
    c.onclick = () => { window.open('https://acg.gamer.com.tw/acgDetail.php?s=' + id, '_blank') }

    const span = document.createElement("span")
    span.classList.add("material-icons-round")
    span.textContent = "info"
    span.style = "font-size:18px;margin-right:4px"
    c.prepend(span)

    btn.parentElement.style.gap = '0.5em'
    btn.parentElement.style.alignItems = 'stretch'
    btn.parentElement.append(c)
  }
})()

// ==UserScript==
// @name        新番授權情報助手
// @match       https://ani.gamer.com.tw/seasonal.php*
// @version     1.0
// @author      JasonKhew96
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/dist/anigamer-seasonal.user.js
// @grant       none
// ==/UserScript==

(function () {
'use strict';

function _createForOfIteratorHelperLoose(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (t) return (t = t.call(r)).next.bind(t); if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) { t && (r = t); var o = 0; return function () { return o >= r.length ? { done: true } : { done: false, value: r[o++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var s = document.createElement("style");
s.innerHTML = ".btn-details{display:flex;text-align:center;align-items:center;justify-content:center;padding:8px 12px;border:1px solid var(--anime-tertiary-color);border-radius:6px;color:var(--anime-tertiary-color);background-color:transparent;cursor:pointer;white-space:nowrap;word-break:keep-all;width:100%}.btn-details:hover{background-color:var(--anime-tertiary-color);color:rgba(255,255,255,.95)}";
document.head.appendChild(s);
var btns = document.querySelectorAll(".btn-subscribe");
var _loop = function _loop() {
    var btn = _step.value;
    if (!(btn instanceof HTMLDivElement)) return 0; // continue
    var id = btn.dataset.gtmVar1;
    var c = document.createElement("div");
    c.classList.add("btn-details");
    c.textContent = "作品資料";
    c.onclick = function () {
      window.open("https://acg.gamer.com.tw/acgDetail.php?s=" + id, "_blank");
    };
    var span = document.createElement("span");
    span.classList.add("material-icons-round");
    span.textContent = "info";
    span.style = "font-size:18px;margin-right:4px";
    c.prepend(span);
    if (!btn.parentElement) return 0; // continue
    btn.parentElement.style.gap = "0.5em";
    btn.parentElement.style.alignItems = "stretch";
    btn.parentElement.append(c);
  },
  _ret;
for (var _iterator = _createForOfIteratorHelperLoose(btns), _step; !(_step = _iterator()).done;) {
  _ret = _loop();
  if (_ret === 0) continue;
}

})();

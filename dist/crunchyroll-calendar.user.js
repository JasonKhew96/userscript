// ==UserScript==
// @name        Better Crunchyroll simulcast calendar
// @match       https://www.crunchyroll.com/simulcastcalendar*
// @version     2.1
// @author      JasonKhew96
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/dist/crunchyroll-calendar.user.js
// @grant       none
// ==/UserScript==

(function () {
'use strict';

var releases = document.querySelectorAll(".releases > li");
releases.forEach(function (r) {
  var _r$querySelector;
  var name = (_r$querySelector = r.querySelector("cite[itemprop='name']")) == null ? void 0 : _r$querySelector.textContent;
  if (name != null && name.includes("Dub")) {
    r.remove();
    return;
  }
  var element = r.querySelector(".available-episode-link");
  if (!(element instanceof HTMLAnchorElement)) return;
  var link = element.href;
  var match = link.match(/\/watch\/([A-Z,0-9]{9,})+\//);
  if (match && match[1].length > 9 && !match[1].endsWith("JAJP")) {
    r.remove();
    return;
  }
});
var shortTime = new Intl.DateTimeFormat("en-US", {
  timeStyle: "short"
});
var times = document.querySelectorAll("time.available-time");
times.forEach(function (t) {
  var dt = t.getAttribute("datetime");
  if (!dt) return;
  t.textContent = shortTime.format(Date.parse(dt));
});

})();

// ==UserScript==
// @name        Better Crunchyroll simulcast calendar
// @match       https://www.crunchyroll.com/simulcastcalendar*
// @match       https://www.crunchyroll.com/*/simulcastcalendar*
// @version     2.2
// @author      JasonKhew96
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/dist/crunchyroll-calendar.user.js
// @grant       none
// ==/UserScript==

!function(){"use strict";document.querySelectorAll(".releases > li").forEach(function(e){var t,r=null==(t=e.querySelector("cite[itemprop='name']"))?void 0:t.textContent;if(null!=r&&r.includes("Dub"))e.remove();else{var n=e.querySelector(".available-episode-link");if(n instanceof HTMLAnchorElement){var l=n.href.match(/\/watch\/([A-Z,0-9]{9,})+\//);l&&l[1].length>9&&!l[1].endsWith("JAJP")&&e.remove()}}});var e=new Intl.DateTimeFormat("en-US",{timeStyle:"short"});document.querySelectorAll("time.available-time").forEach(function(t){var r=t.getAttribute("datetime");r&&(t.textContent=e.format(Date.parse(r)))})}();

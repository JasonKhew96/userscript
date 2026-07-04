// ==UserScript==
// @name        BiliBili.tv Tools
// @match       https://www.bilibili.tv/*
// @version     0.3
// @require     https://unpkg.com/gm-compat@1.1.0
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @run-at      document-start
// @author      JasonKhew96
// @description none
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/dist/bilibili-tv-tools.user.js
// @grant       unsafeWindow
// ==/UserScript==

(function () {
'use strict';

var xhr_proto = GMCompat.unsafeWindow.XMLHttpRequest.prototype;
var backup_xhr_open = xhr_proto.open;
function new_xhr_open() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  var method = args[0],
    url = args[1],
    async = args[2],
    user = args[3],
    password = args[4];
  if (typeof url != "string") return GMCompat.apply(this, backup_xhr_open, [method, url, async, user, password]);
  var newUrl = url;
  if (newUrl.startsWith("//")) {
    newUrl = "https:" + newUrl;
  }
  var parsedUrl = URL.parse(newUrl);
  if (!(parsedUrl != null && parsedUrl.search)) return GMCompat.apply(this, backup_xhr_open, [method, url, async, user, password]);
  var params = new URLSearchParams(parsedUrl == null ? void 0 : parsedUrl.search);
  if (params.get("s_locale")) params.set("s_locale", "zh_SG");
  parsedUrl.search = "?" + params.toString();
  newUrl = parsedUrl.toString();
  GMCompat.apply(this, backup_xhr_open, [method, newUrl, async, user, password]);
}
xhr_proto.open = GMCompat["export"](new_xhr_open);
document.addEventListener("click", function (event) {
  if (!event.target || !(event.target instanceof Element)) return;
  var link = event.target.closest("a");
  if (link && link.getAttribute("target") === "_blank") {
    link.setAttribute("target", "_self");
  }
}, true);

})();

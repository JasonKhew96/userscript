// ==UserScript==
// @name        Nuke feibanyama
// @match       *://mikanani.me/*
// @match       *://bangumi.moe/*
// @match       *://nyaa.si/*
// @require     https://unpkg.com/gm-compat@1.1.0
// @version     0.1
// @author      JasonKhew96
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/dist/nuke-feibanyama.user.js
// @grant       unsafeWindow
// ==/UserScript==

(function () {
'use strict';

function _createForOfIteratorHelperLoose(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (t) return (t = t.call(r)).next.bind(t); if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) { t && (r = t); var o = 0; return function () { return o >= r.length ? { done: true } : { done: false, value: r[o++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var handleMikanClassic = function handleMikanClassic() {
  var nukes = document.querySelectorAll("tr:has(a[href='/Home/PublishGroup/1004'])");
  for (var _iterator = _createForOfIteratorHelperLoose(nukes), _step; !(_step = _iterator()).done;) {
    var nuke = _step.value;
    nuke.remove();
  }
};
var handleMikanBangumi = function handleMikanBangumi() {
  function getNextNElements(element, n) {
    var result = [];
    var current = element.nextElementSibling; // Get the immediate next element

    while (current && result.length < n) {
      result.push(current);
      current = current.nextElementSibling; // Move to the next sibling
    }
    return result;
  }
  var top = document.querySelector(".subgroup-scroll-top-1231");
  if (top) {
    var nukes = [top];
    nukes.push.apply(nukes, getNextNElements(top, 3));
    for (var _i = 0, _nukes = nukes; _i < _nukes.length; _i++) {
      var nuke = _nukes[_i];
      nuke.remove();
    }
  }
  var leftbarItem = document.querySelector("li.leftbar-item:has(a[data-anchor='#1231'])");
  leftbarItem == null || leftbarItem.remove();
};
var handleNyaaSi = function handleNyaaSi() {
  var nukes = document.querySelectorAll("tr:has(a[title^='[Feibanyama]'])");
  for (var _iterator2 = _createForOfIteratorHelperLoose(nukes), _step2; !(_step2 = _iterator2()).done;) {
    var nuke = _step2.value;
    nuke.remove();
  }
};
var parsedUrl = URL.parse(document.location.href);
if ((parsedUrl == null ? void 0 : parsedUrl.host) === "mikanani.me" && parsedUrl.pathname === "/Home/Classic") {
  handleMikanClassic();
}
if ((parsedUrl == null ? void 0 : parsedUrl.host) === "mikanani.me" && parsedUrl.pathname.startsWith("/Home/Bangumi/")) {
  handleMikanBangumi();
}
if ((parsedUrl == null ? void 0 : parsedUrl.host) === "nyaa.si" && parsedUrl.pathname === "/") {
  handleNyaaSi();
}
if ((parsedUrl == null ? void 0 : parsedUrl.host) === "bangumi.moe") {
  var new_xhr_send = function new_xhr_send(body) {
    var backup_onreadystatechange = this.onreadystatechange;
    this.onreadystatechange = function (event) {
      if (this.readyState === this.DONE && this.responseURL && this.status === 200) {
        onResponse(this);
      }
      if (backup_onreadystatechange) {
        backup_onreadystatechange.call(this, event);
      }
    };
    GMCompat.apply(this, backup_xhr_send, [body]);
  };
  var xhr_proto = GMCompat.unsafeWindow.XMLHttpRequest.prototype;
  var backup_xhr_send = xhr_proto.send;
  var onResponse = function onResponse(xhr) {
    var contentType = xhr.getResponseHeader("Content-Type");
    if (!(contentType != null && contentType.includes("application/json"))) return;
    var url = URL.parse(xhr.responseURL);
    if ((url == null ? void 0 : url.pathname) == "/api/torrent/latest" || url != null && url.pathname.startsWith("/api/torrent/page/") || (url == null ? void 0 : url.pathname) == "/api/torrent/search") {
      var obj = xhr.responseType == "json" ? xhr.response : JSON.parse(xhr.response);
      var torrents = obj.torrents;
      obj.torrents = torrents.filter(function (e) {
        return e.uploader_id != "68019f62c7f647000737a317" && e.team_id != "6941bae25394e5000709d5ec";
      });
      var descriptor = {
        value: JSON.stringify(obj)
      };
      var clone = GMCompat["export"](descriptor);
      GMCompat.unsafeWindow.Object.defineProperty(xhr, "response", clone);
    }
  };
  xhr_proto.send = GMCompat["export"](new_xhr_send);
}

})();

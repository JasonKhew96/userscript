// ==UserScript==
// @name        bgm.wiki Tools
// @match       *://bgm.wiki/*
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @version     0.1
// @author      JasonKhew96
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/dist/bgm-wiki-tools.user.js
// @grant       GM_addStyle
// ==/UserScript==

(function (VM) {
'use strict';

function _createForOfIteratorHelperLoose(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (t) return (t = t.call(r)).next.bind(t); if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) { t && (r = t); var o = 0; return function () { return o >= r.length ? { done: true } : { done: false, value: r[o++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
GM_addStyle("\n:is(#scheduleWrap, #scheduleRangeEditorWrap, #scheduleInsertPreviewBody, #generateEpisodesPreviewBody) .schedule-platform-episode-grid {\n  grid-template-columns: minmax(32px, 64px) minmax(240px, 1.2fr) minmax(180px, 1fr);\n}\n");
VM.observe(document.body, function (mutations) {
  for (var _iterator = _createForOfIteratorHelperLoose(mutations), _step; !(_step = _iterator()).done;) {
    var mutation = _step.value;
    var target = mutation.target;
    if (!(target instanceof HTMLDivElement)) continue;
    if (target.id != "scheduleWrap") continue;
    var onAirs = document.querySelectorAll(".f-onair-premiere");
    for (var _iterator2 = _createForOfIteratorHelperLoose(onAirs), _step2; !(_step2 = _iterator2()).done;) {
      var onAir = _step2.value;
      if (!(onAir instanceof HTMLInputElement)) continue;
      onAir.type = "datetime-local";
    }
  }
});

})(VM);

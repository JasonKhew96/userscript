// ==UserScript==
// @name        Abema premium/free ends time
// @match       https://abema.tv/*
// @version     1.9
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @author      JasonKhew96
// @description shows abema premium/free ends time
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/dist/abema-ends-time.user.js
// @grant       none
// ==/UserScript==

(function (VM) {
'use strict';

function _createForOfIteratorHelperLoose(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (t) return (t = t.call(r)).next.bind(t); if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) { t && (r = t); var o = 0; return function () { return o >= r.length ? { done: true } : { done: false, value: r[o++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var dateTimeformatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Tokyo"
});
var whitelist = ["com-contentlist-ContentlistContainer", "com-contentlist-ContentlistSectionList"];
var episodeMap = new Map();
Response.prototype.__json = Response.prototype.json;
Response.prototype.json = function () {
  var __this = this;
  var jsonPromise = __this.__json.apply(__this);
  jsonPromise = jsonPromise.then(function (res) {
    if ("episodeGroupContents" in res) {
      for (var _iterator = _createForOfIteratorHelperLoose(res.episodeGroupContents), _step; !(_step = _iterator()).done;) {
        var content = _step.value;
        episodeMap.set(content.id, content);
      }
    }
    return res;
  });
  return jsonPromise;
};
VM.observe(document.body, function (mutations) {
  for (var _iterator2 = _createForOfIteratorHelperLoose(mutations), _step2; !(_step2 = _iterator2()).done;) {
    var mutation = _step2.value;
    var target = mutation.target;
    var addedNodes = mutation.addedNodes;
    if (!addedNodes.length) continue;
    if (!(target instanceof HTMLDivElement)) continue;
    if (!whitelist.includes(target.classList[0])) continue;
    var episodes = target.querySelectorAll(".com-contentlist-ItemListForContentlistContent__item");
    for (var _iterator3 = _createForOfIteratorHelperLoose(episodes), _step3; !(_step3 = _iterator3()).done;) {
      var episode = _step3.value;
      if (!(episode instanceof HTMLLIElement)) continue;
      var keys = Object.keys(episode).filter(function (key) {
        return key.startsWith("__reactFiber");
      });
      if (keys.length <= 0) {
        console.error("couldn't find any key starts with __reactFiber");
        continue;
      }
      var _key = keys.at(0);
      var id = episode[_key].key;
      var contents = episodeMap.get(id);
      var term = contents.video.terms[0];
      var endAt = dateTimeformatter.format(new Date(term.endAt * 1000));
      var onDemandType = term.onDemandType == 1 ? "プレミアム" : "無料";
      var span = episode.querySelector(".com-shared-viewing_type-ViewingTypeLabel__text");
      if (!span) continue;
      span.textContent = onDemandType + " ～ " + endAt;
    }
  }
});

})(VM);

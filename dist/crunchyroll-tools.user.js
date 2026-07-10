// ==UserScript==
// @name        Crunchyroll Tools
// @match       *://www.crunchyroll.com/*
// @require     https://unpkg.com/gm-compat@1.1.0
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @version     0.1
// @author      JasonKhew96
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/dist/crunchyroll-tools.user.js
// @grant       unsafeWindow
// ==/UserScript==

(function (VM) {
'use strict';

function _createForOfIteratorHelperLoose(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (t) return (t = t.call(r)).next.bind(t); if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) { t && (r = t); var o = 0; return function () { return o >= r.length ? { done: true } : { done: false, value: r[o++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var custom_data = {
  series_id: "",
  season_id: "",
  episode_id: "",
  premium_available_date: "",
  thumbnail: ""
};
var buildRow = function buildRow(table, el, data) {
  for (var _i = 0, _Object$entries = Object.entries(data); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _Object$entries[_i],
      k = _Object$entries$_i[0],
      v = _Object$entries$_i[1];
    var clone = el.cloneNode(true);
    if (!(clone instanceof HTMLDivElement)) return;
    delete clone.dataset["t"];
    var col = clone.querySelector("[data-t=details-table-column-name]");
    var desc = clone.querySelector("[data-t=details-table-description]");
    if (!col || !desc) return;
    col.textContent = k;
    desc.textContent = v;
    table.appendChild(clone);
  }
};
var insertData = function insertData(target) {
  var table = target.querySelector(".languages-table-details");
  var el = table == null ? void 0 : table.firstElementChild;
  if (!el) return;
  buildRow(table, el, custom_data);
};
VM.observe(document.body, function (mutations) {
  for (var _iterator = _createForOfIteratorHelperLoose(mutations), _step; !(_step = _iterator()).done;) {
    var mutation = _step.value;
    var target = mutation.target;
    if (!(target instanceof HTMLDivElement) || !("t" in target.dataset) || target.dataset["t"] != "expandable-section") continue;
    insertData(target);
  }
});
var xhr_proto = GMCompat.unsafeWindow.XMLHttpRequest.prototype;
var backup_xhr_send = xhr_proto.send;
var onResponse = function onResponse(xhr) {
  var contentType = xhr.getResponseHeader("Content-Type");
  if (!(contentType != null && contentType.includes("application/json"))) return;
  var url = URL.parse(xhr.responseURL);
  if (url != null && url.pathname.startsWith("/content/v2/cms/objects/")) {
    var obj = JSON.parse(xhr.responseText);
    var data = obj["data"][0];
    var episode_metadata = data["episode_metadata"];
    custom_data["series_id"] = episode_metadata["series_id"];
    custom_data["season_id"] = episode_metadata["season_id"];
    custom_data["episode_id"] = data["id"];
    custom_data["thumbnail"] = data["images"]["thumbnail"][0].at(-1)["source"];
    custom_data["premium_available_date"] = episode_metadata["premium_available_date"];
  }
};
function new_xhr_send(body) {
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
}
xhr_proto.send = GMCompat["export"](new_xhr_send);

})(VM);

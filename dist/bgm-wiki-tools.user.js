// ==UserScript==
// @name        bgm.wiki Tools
// @match       *://bgm.wiki/*
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @version     0.1
// @author      JasonKhew96
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/dist/bgm-wiki-tools.user.js
// @grant       GM_addStyle
// ==/UserScript==

!function(e){"use strict";function r(e,r){var n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(n)return(n=n.call(e)).next.bind(n);if(Array.isArray(e)||(n=function(e,r){if(e){if("string"==typeof e)return t(e,r);var n={}.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?t(e,r):void 0}}(e))||r){n&&(e=n);var o=0;return function(){return o>=e.length?{done:!0}:{done:!1,value:e[o++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function t(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,n=Array(r);t<r;t++)n[t]=e[t];return n}GM_addStyle("\n:is(#scheduleWrap, #scheduleRangeEditorWrap, #scheduleInsertPreviewBody, #generateEpisodesPreviewBody) .schedule-platform-episode-grid {\n  grid-template-columns: minmax(32px, 64px) minmax(240px, 1.2fr) minmax(180px, 1fr);\n}\n"),e.observe(document.body,function(e){for(var t,n=r(e);!(t=n()).done;){var o=t.value.target;if(o instanceof HTMLDivElement&&"scheduleWrap"==o.id)for(var a,i=r(document.querySelectorAll(".f-onair-premiere"));!(a=i()).done;){var l=a.value;l instanceof HTMLInputElement&&(l.type="datetime-local")}}})}(VM);

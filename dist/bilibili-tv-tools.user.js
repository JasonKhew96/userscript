// ==UserScript==
// @name        BiliBili.tv Tools
// @match       https://www.bilibili.tv/*
// @version     0.3
// @require     https://unpkg.com/gm-compat@1.1.0
// @run-at      document-start
// @author      JasonKhew96
// @description none
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/dist/bilibili-tv-tools.user.js
// @grant       unsafeWindow
// ==/UserScript==

!function(){"use strict";var t=GMCompat.unsafeWindow.XMLHttpRequest.prototype,e=t.open;t.open=GMCompat.export(function(){for(var t=arguments.length,a=new Array(t),r=0;r<t;r++)a[r]=arguments[r];var n=a[0],s=a[1],o=a[2],i=a[3],p=a[4];if("string"!=typeof s)return GMCompat.apply(this,e,[n,s,o,i,p]);var l=s;l.startsWith("//")&&(l="https:"+l);var c=URL.parse(l);if(null==c||!c.search)return GMCompat.apply(this,e,[n,s,o,i,p]);var u=new URLSearchParams(null==c?void 0:c.search);u.get("s_locale")&&u.set("s_locale","zh_SG"),c.search="?"+u.toString(),l=c.toString(),GMCompat.apply(this,e,[n,l,o,i,p])}),document.addEventListener("click",function(t){if(t.target&&t.target instanceof Element){var e=t.target.closest("a");e&&"_blank"===e.getAttribute("target")&&e.setAttribute("target","_self")}},!0)}();

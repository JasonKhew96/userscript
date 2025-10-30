// ==UserScript==
// @name        Fuck mikanani
// @match       https://mikanani.me/*
// @grant       none
// @version     1.0
// @author      JasonKhew96
// @description disable mikan mobile ui
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/fuck-mikanani.user.js
// ==/UserScript==

(()=>{
	for (e of document.getElementsByClassName("hidden-lg")) {
		e.style.display = "none"
	}
	for (e of document.getElementsByClassName("hidden-xs")) {
		e.classList.remove("hidden-xs")
		e.classList.remove("hidden-sm")
	}
})()

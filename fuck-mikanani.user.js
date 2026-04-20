// ==UserScript==
// @name        Fuck mikanani
// @match       https://mikanani.me/*
// @grant       none
// @version     2.0
// @author      JasonKhew96
// @description fix mikan mobile ui
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/fuck-mikanani.user.js
// ==/UserScript==

(()=>{
  const addClassic = () => {
     const a = document.createElement("a")
    a.classList.add("link")
    a.href = "/Home/Classic"
    a.textContent = "列表"
    const li = document.createElement("li")
    li.classList.add("m-tool-search-change")
    li.append(a)
    const mToolListUl = document.querySelector(".m-tool-list > ul")
    const mToolSearchChange = document.querySelector(".m-tool-search-change[onclick]")
    mToolListUl.insertBefore(li, mToolSearchChange)
  }

  const fixClassic = () => {
    const skContainer = document.getElementById("sk-container")
    if (!skContainer) return
    skContainer.style.width = "100%"
    skContainer.style.paddingTop = "3.9rem"
  }

  addClassic()
  fixClassic()
})()

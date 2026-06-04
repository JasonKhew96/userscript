const releases = document.querySelectorAll(".releases > li")
releases.forEach((r) => {
  const name = r.querySelector("cite[itemprop='name']")?.textContent
  if (name?.includes("Dub")) {
    r.remove()
    return
  }
  const element = r.querySelector(".available-episode-link")
  if (!(element instanceof HTMLAnchorElement)) return
  const link = element.href
  const match = link.match(/\/watch\/([A-Z,0-9]{9,})+\//)
  if (match && match[1].length > 9 && !match[1].endsWith("JAJP")) {
    r.remove()
    return
  }
})

const shortTime = new Intl.DateTimeFormat("en-US", {
  timeStyle: "short",
})
const times = document.querySelectorAll("time.available-time")
times.forEach((t) => {
  const dt = t.getAttribute("datetime")
  if (!dt) return
  t.textContent = shortTime.format(Date.parse(dt))
})

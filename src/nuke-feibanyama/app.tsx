const handleMikanClassic = () => {
  const nukes = document.querySelectorAll(
    "tr:has(a[href='/Home/PublishGroup/1004'])",
  )
  for (const nuke of nukes) {
    nuke.remove()
  }
}

const handleMikanBangumi = () => {
  function getNextNElements(element: Element, n: number) {
    const result = []
    let current = element.nextElementSibling // Get the immediate next element

    while (current && result.length < n) {
      result.push(current)
      current = current.nextElementSibling // Move to the next sibling
    }

    return result
  }

  const top = document.querySelector(".subgroup-scroll-top-1231")
  if (top) {
    const nukes: Element[] = [top]
    nukes.push(...getNextNElements(top, 3))
    for (const nuke of nukes) {
      nuke.remove()
    }
  }

  const leftbarItem = document.querySelector(
    "li.leftbar-item:has(a[data-anchor='#1231'])",
  )
  leftbarItem?.remove()
}

const handleNyaaSi = () => {
  const nukes = document.querySelectorAll("tr:has(a[title^='[Feibanyama]'])")
  for (const nuke of nukes) {
    nuke.remove()
  }
}

const parsedUrl = URL.parse(document.location.href)
if (
  parsedUrl?.host === "mikanani.me" &&
  parsedUrl.pathname === "/Home/Classic"
) {
  handleMikanClassic()
}
if (
  parsedUrl?.host === "mikanani.me" &&
  parsedUrl.pathname.startsWith("/Home/Bangumi/")
) {
  handleMikanBangumi()
}
if (parsedUrl?.host === "nyaa.si" && parsedUrl.pathname === "/") {
  handleNyaaSi()
}

if (parsedUrl?.host === "bangumi.moe") {
  const xhr_proto = GMCompat.unsafeWindow.XMLHttpRequest.prototype
  const backup_xhr_send = xhr_proto.send

  const onResponse = (xhr: XMLHttpRequest) => {
    const contentType = xhr.getResponseHeader("Content-Type")
    if (!contentType?.includes("application/json")) return
    const url = URL.parse(xhr.responseURL)

    if (
      url?.pathname == "/api/torrent/latest" ||
      url?.pathname.startsWith("/api/torrent/page/") ||
      url?.pathname == "/api/torrent/search"
    ) {
      const obj =
        xhr.responseType == "json" ? xhr.response : JSON.parse(xhr.response)
      const torrents: any[] = obj.torrents
      obj.torrents = torrents.filter(
        (e) =>
          e.uploader_id != "68019f62c7f647000737a317" &&
          e.team_id != "6941bae25394e5000709d5ec",
      )

      const descriptor = { value: JSON.stringify(obj) }
      const clone = GMCompat.export(descriptor)

      GMCompat.unsafeWindow.Object.defineProperty(xhr, "response", clone)
    }
  }

  function new_xhr_send(
    this: XMLHttpRequest,
    body: Document | XMLHttpRequestBodyInit | null,
  ) {
    const backup_onreadystatechange = this.onreadystatechange

    this.onreadystatechange = function (event) {
      if (
        this.readyState === this.DONE &&
        this.responseURL &&
        this.status === 200
      ) {
        onResponse(this)
      }

      if (backup_onreadystatechange) {
        backup_onreadystatechange.call(this, event)
      }
    }

    GMCompat.apply(this, backup_xhr_send, [body])
  }

  xhr_proto.send = GMCompat.export(new_xhr_send)
}

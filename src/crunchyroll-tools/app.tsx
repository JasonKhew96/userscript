import VM from "@violentmonkey/dom"
import globalCss from "./style.css"

function locale2str(locale: string): string {
  const currentLang = navigator.language.indexOf("-")
    ? navigator.language.split("-")[0]
    : navigator.language
  if (locale.indexOf("-") > 0) {
    const splits = locale.split("-")
    return `${new Intl.DisplayNames([currentLang], { type: "language" }).of(splits[0])} (${new Intl.DisplayNames([currentLang], { type: "region" }).of(splits[1])})`
  }
  return (
    new Intl.DisplayNames([currentLang], { type: "language" }).of(locale) ?? ""
  )
}

function onMain() {
  GM_addStyle(globalCss)

  type CustomData = {
    eligible_region: string
    series_id: string
    season_id: string
    episode_id: string
    premium_available_date: string
    thumbnail: string
  }

  const custom_data: CustomData = {
    eligible_region: "",
    series_id: "",
    season_id: "",
    episode_id: "",
    premium_available_date: "",
    thumbnail: "",
  }

  type CustomData2 = {
    season_title: string
    episode: string
  }

  const custom_data_2: CustomData2 = {
    season_title: "",
    episode: "",
  }

  const normalizeEpisode = (episode: string) => {
    try {
      parseInt(episode)
      return episode.padStart(2, "0")
    } catch {
      // do nothing
    }
    return episode
  }

  const buildRow = (table: Element, el: Element, data: CustomData) => {
    for (const [k, v] of Object.entries(data)) {
      const clone = el.cloneNode(true)
      if (!(clone instanceof HTMLDivElement)) return
      delete clone.dataset["t"]
      const col = clone.querySelector("[data-t=details-table-column-name]")
      const desc = clone.querySelector("[data-t=details-table-description]")
      if (!col || !desc) return
      col.textContent = k
      switch (k) {
        case "thumbnail": {
          const a = document.createElement("a")
          a.href = v
          a.textContent = "link"
          desc.textContent = ""
          desc.appendChild(a)
          break
        }
        case "premium_available_date": {
          const d = new Date(v)
          desc.textContent = d.toLocaleString()
          break
        }
        default:
          desc.textContent = v
      }
      table.appendChild(clone)
    }
  }

  const insertData = (target: HTMLDivElement) => {
    const table = target.querySelector(".languages-table-details")
    const el = table?.firstElementChild
    if (!el) return
    buildRow(table, el, custom_data)
  }

  VM.observe(document.body, (mutations) => {
    for (const mutation of mutations) {
      const target = mutation.target
      if (
        !(target instanceof HTMLDivElement) ||
        !("t" in target.dataset) ||
        target.dataset["t"] != "expandable-section"
      )
        continue
      insertData(target)
    }
  })

  const xhr_proto = GMCompat.unsafeWindow.XMLHttpRequest.prototype
  const backup_xhr_send = xhr_proto.send

  const onResponse = (xhr: XMLHttpRequest) => {
    const contentType = xhr.getResponseHeader("Content-Type")
    if (!contentType?.includes("application/json")) return
    const url = URL.parse(xhr.responseURL)

    if (url?.pathname.startsWith("/content/v2/cms/objects/")) {
      const obj = JSON.parse(xhr.responseText)
      const data = obj?.data?.at(0) ?? {}
      const episode_metadata = data?.episode_metadata ?? {}

      custom_data["eligible_region"] = episode_metadata?.eligible_region ?? ""
      custom_data["series_id"] = episode_metadata?.series_id ?? ""
      custom_data["season_id"] = episode_metadata?.season_id ?? ""
      custom_data["episode_id"] = data?.id ?? ""
      custom_data["thumbnail"] =
        data?.images?.thumbnail?.at(0)?.at(-1)?.source ?? ""
      custom_data["premium_available_date"] =
        episode_metadata?.premium_available_date ?? ""

      custom_data_2["season_title"] = episode_metadata?.season_title ?? ""
      custom_data_2["episode"] = episode_metadata?.episode ?? ""
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

  const backup_fetch = GMCompat.unsafeWindow.fetch

  async function new_fetch(input: RequestInfo | URL, init?: RequestInit) {
    const response = await backup_fetch(input, init)
    const responseClone = response.clone()
    if (typeof input !== "string") return response
    const url = URL.parse(input)
    if (
      url?.pathname.startsWith("/playback/v3/") &&
      url?.pathname.endsWith("/play")
    ) {
      const obj = await responseClone.json().catch(() => responseClone.text())
      const subtitles: { [key: string]: any } = obj?.subtitles ?? {}

      const tableParent = document.querySelector(".languages-table-details")
      const el = tableParent?.firstElementChild
      if (!el) return response
      const clone = el.cloneNode(true)
      if (!(clone instanceof HTMLDivElement)) return response
      delete clone.dataset["t"]
      const col = clone.querySelector("[data-t=details-table-column-name]")
      const desc = clone.querySelector("[data-t=details-table-description]")
      if (!col || !desc) return response
      col.textContent = "subtitles"
      desc.innerHTML = ""

      const table = document.createElement("table")

      for (const v of Object.values(subtitles)) {
        if (!v?.url) continue
        const u = URL.parse(v.url)
        const filename = u?.pathname.split("/").at(-1)
        if (!filename) continue
        const re = /^subtitle(-\S+-(\d+))?\.(\S+)$/
        // https://vod-fy-mod.crunchyrollcdn.com/static/majin/e00378795a00378807jajp/clean/subtitles/enus/20260820_225123/subtitle.ass?t=exp=1790108771~acl=/static/majin/e00378795a00378807jajp/clean/subtitles/enus/20260820_225123/subtitle.ass~hmac=ab24ea77856258131a4a0558ac12e5ac1b3ec924245240506532a90add970530
        const matches = filename?.match(re)
        if (!matches) continue
        let d: Date | undefined
        if (matches[2] != undefined) {
          d = new Date(parseInt(matches[1]) * 1000)
        }
        const p1 = document.createElement("p")
        p1.classList.add("sub-download")
        p1.textContent = locale2str(v.language)

        p1.onclick = async () => {
          try {
            const language = v?.language || "unk"
            const newFilename = `${custom_data_2["season_title"]}_${normalizeEpisode(custom_data_2["episode"])}_${language}.${matches[3]}`

            const response = await fetch(v.url)
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = blobUrl
            link.download = newFilename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
          } catch (e) {
            console.error(e)
          }
        }

        desc.appendChild(p1)
        if (d !== undefined) {
          const p2 = document.createElement("p")
          p2.classList.add("sub-monospace")
          p2.textContent = d.toLocaleString()
          desc.appendChild(p2)
        }
      }
      desc.appendChild(table)
      tableParent.appendChild(clone)
    }
    return response
  }
  unsafeWindow.fetch = GMCompat.export(new_fetch)
}

function onImgSrv(url: URL) {
  if (!url.pathname.startsWith("/cdn-cgi/image/")) return
  url.pathname = url.pathname.split("/").slice(4).join("/")
  document.location.href = url.toString()
}

const currentHref = new URL(document.location.href)
if (currentHref.hostname === "www.crunchyroll.com") {
  onMain()
} else if (currentHref.hostname === "imgsrv.crunchyroll.com") {
  onImgSrv(currentHref)
}

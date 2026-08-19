import VM from '@violentmonkey/dom'

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
    if (!(target instanceof HTMLDivElement) || !("t" in target.dataset) || target.dataset["t"] != "expandable-section") continue
    insertData(target)
  }
})

const xhr_proto = GMCompat.unsafeWindow.XMLHttpRequest.prototype
const backup_xhr_send = xhr_proto.send

const onResponse = (xhr: XMLHttpRequest) => {
  const contentType = xhr.getResponseHeader("Content-Type")
  if (!contentType?.includes("application/json")) return
  const url = URL.parse(xhr.responseURL)

  if (
    url?.pathname.startsWith("/content/v2/cms/objects/")
  ) {
    const obj = JSON.parse(xhr.responseText)
    const data = obj?.data?.at(0) ?? {}
    const episode_metadata = data?.episode_metadata ?? {}
    
    custom_data["eligible_region"] = episode_metadata?.eligible_region ?? ""
    custom_data["series_id"] = episode_metadata?.series_id ?? ""
    custom_data["season_id"] = episode_metadata?.season_id ?? ""
    custom_data["episode_id"] = data?.id ?? ""
    custom_data["thumbnail"] = data?.images?.thumbnail?.at(0)?.at(-1)?.source ?? ""
    custom_data["premium_available_date"] = episode_metadata?.premium_available_date ?? ""
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

    const table = document.querySelector(".languages-table-details")
    const el = table?.firstElementChild
    if (!el) return response
    const clone = el.cloneNode(true)
    if (!(clone instanceof HTMLDivElement)) return response
    delete clone.dataset["t"]
    const col = clone.querySelector("[data-t=details-table-column-name]")
    const desc = clone.querySelector("[data-t=details-table-description]")
    if (!col || !desc) return response
    col.textContent = "subtitles"
    desc.innerHTML = ""

    for (const [k, v] of Object.entries(subtitles)) {
      if (!v?.url) continue
      const u = URL.parse(v?.url)
      const filename = u?.pathname.split("/").at(-1)
      const re = /^subtitle-\S+-(\d+)\.ass$/
      const matches = filename?.match(re)
      if (!matches) continue
      const d = new Date(parseInt(matches[1]) * 1000)
      const p = document.createElement("p")
      p.style = "font-family:monospace;"
      p.textContent = `${k} ${d.toLocaleString()}`
      desc.appendChild(p)
    }
    table.appendChild(clone)
  }
  return response
}
unsafeWindow.fetch = GMCompat.export(new_fetch)

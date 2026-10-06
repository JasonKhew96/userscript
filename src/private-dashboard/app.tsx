import { createSignal, For, Show } from "solid-js"
import { render } from "solid-js/web"
import { getPanel } from "@violentmonkey/ui"
import VM from "@violentmonkey/dom"
// global CSS
import globalCss from "./style.css"
// CSS modules
import styles, { stylesheet } from "./style.module.css"

const settings = GM_getValue("config", {
  token_tmdb: "",
  token_mal: "",
})

type Item = {
  title: string
  title_original: string
  link: string
  air_date: string
}

function SearchItem(props: any) {
  return (
    <div onclick={() => props.onSelect(props.link, props.title)}>
      <div>{props.title}</div>
      <div>{props.title_original}</div>
      <div>{props.air_date}</div>
      <div>{props.link}</div>
    </div>
  )
}

function searchTMDB(
  keyword: string,
  onLoad: (
    resp: VMScriptResponseObject<
      string | object | ArrayBuffer | Blob | Document
    >,
  ) => void,
) {
  const params = {
    query: keyword,
  }
  GM_xmlhttpRequest({
    url:
      `https://api.themoviedb.org/3/search/multi?` +
      new URLSearchParams(params).toString(),
    method: "GET",
    timeout: 10_000,
    responseType: "json",
    headers: {
      Authorization: `Bearer ${settings.token_tmdb}`,
    },
    anonymous: true,
    onload: onLoad,
  })
}

function searchBgm(
  keyword: string,
  onLoad: (
    resp: VMScriptResponseObject<
      string | object | ArrayBuffer | Blob | Document
    >,
  ) => void,
) {
  const payload = {
    keyword: keyword,
    filter: {
      type: [2],
    },
  }
  GM_xmlhttpRequest({
    url: `https://api.bgm.tv/v0/search/subjects`,
    method: "POST",
    data: JSON.stringify(payload),
    timeout: 10_000,
    responseType: "json",
    anonymous: true,
    onload: onLoad,
  })
}

function searchMal(
  keyword: string,
  onLoad: (
    resp: VMScriptResponseObject<
      string | object | ArrayBuffer | Blob | Document
    >,
  ) => void,
) {
  const params = {
    q: keyword,
    fields: "id,title,alternative_titles,start_date",
  }
  GM_xmlhttpRequest({
    url:
      `https://api.myanimelist.net/v2/anime?` +
      new URLSearchParams(params).toString(),
    method: "GET",
    timeout: 10_000,
    responseType: "json",
    headers: {
      "X-MAL-CLIENT-ID": settings.token_mal,
    },
    anonymous: true,
    onload: onLoad,
  })
}

function searchAnilist(
  keyword: string,
  onLoad: (
    resp: VMScriptResponseObject<
      string | object | ArrayBuffer | Blob | Document
    >,
  ) => void,
) {
  const query = "query($search:String!){Page{media(search:$search,type:ANIME){id seasonYear seasonInt title{romaji english native}}}}"
  GM_xmlhttpRequest({
    url: `https://graphql.anilist.co`,
    method: "POST",
    timeout: 10_000,
    responseType: "json",
    data: JSON.stringify({
      query: query,
      variables: { search: keyword },
    }),
    headers: {
      "Content-Type": "application/json",
    },
    anonymous: true,
    onload: onLoad,
  })
}

function PanelSettings() {
  const [tmdbToken, setTmdbToken] = createSignal(settings?.token_tmdb ?? "")
  const [malToken, setMalToken] = createSignal(settings?.token_mal ?? "")

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    settings.token_tmdb = tmdbToken()
    settings.token_mal = malToken()
    GM_setValue("config", settings)
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label for="token_tmdb">TMDB Token: </label>
        <input
          aria-label="token_tmdb"
          value={tmdbToken()}
          onChange={(e) => {
            setTmdbToken(e.currentTarget.value)
          }}
        />
      </div>
      <div>
        <label for="token_mal">MAL Token: </label>
        <input
          aria-label="token_mal"
          value={malToken()}
          onChange={(e) => {
            setMalToken(e.currentTarget.value)
          }}
        />
      </div>
      <button>Submit</button>
    </form>
  )
}

function PanelSearch() {
  const [query, setQuery] = createSignal("")
  const [platform, setPlatform] = createSignal("tmdb")
  const [items, setItems] = createSignal<Item[]>([])
  const onSearch = (e: SubmitEvent) => {
    e.preventDefault()
    switch (platform()) {
      case "tmdb":
        searchTMDB(query(), (r) => {
          const obj: any = r.response
          if (obj.total_results <= 0) return
          const a: Item[] = []
          for (const result of obj.results) {
            a.push({
              title: result.name,
              title_original: result.original_name,
              air_date: result.first_air_date,
              link: `https://www.themoviedb.org/${result.media_type}/${result.id}`,
            })
          }
          setItems(a)
        })
        break
      case "bgm":
        searchBgm(query(), (r) => {
          const obj: any = r.response
          if (obj.total <= 0) return
          const a: Item[] = []
          for (const result of obj.data) {
            a.push({
              title: result.name_cn,
              title_original: result.name,
              air_date: result.date,
              link: "https://bgm.tv/subject/" + result.id,
            })
          }
          setItems(a)
        })
        break
      case "mal":
        searchMal(query(), (r) => {
          const obj: any = r.response
          const a: Item[] = []
          for (const result of obj.data) {
            const node = result.node
            a.push({
              title: node.title,
              title_original: node.alternative_titles.ja,
              air_date: node.start_date,
              link: "https://myanimelist.net/anime/" + node.id,
            })
          }
          setItems(a)
        })
        break
      case "anilist":
        searchAnilist(query(), (r) => {
          const obj: any = r.response
          const a: Item[] = []
          for (const result of obj.data.Page.media) {
            a.push({
              title: result.title.romaji,
              title_original: result.title.native,
              air_date: `${result.seasonYear}-${result.seasonInt}`,
              link: "https://anilist.co/anime/" + result.id,
            })
          }
          setItems(a)
        })
        break
      default:
        break
    }
  }
  const modifyDispatch = (input: HTMLInputElement | null, value: string) => {
    if (input == null) return
    input.value = value
    input.dispatchEvent(new Event("input"))
  }
  const onSelect = (url: string, title: string) => {
    switch (platform()) {
      case "tmdb":
        modifyDispatch(
          document.querySelector(
            "input[placeholder^='https://www.themoviedb.org/tv/']",
          ),
          url,
        )
        break
      case "bgm":
        modifyDispatch(
          document.querySelector(
            "input[placeholder^='https://bgm.tv/subject/']",
          ),
          url,
        )
        break
      case "mal":
        modifyDispatch(
          document.querySelector("input[placeholder='例如 Yomi no Tsugai']"),
          title,
        )
        modifyDispatch(
          document.querySelector(
            "input[placeholder='例如 Yomi no Tsugai Season 1']",
          ),
          title,
        )
        modifyDispatch(
          document.querySelector(
            "input[placeholder^='https://myanimelist.net/anime/']",
          ),
          url,
        )
        break
      case "anilist":
        modifyDispatch(
          document.querySelector(
            "input[placeholder^='https://anilist.co/anime/']",
          ),
          url,
        )
        break
      default:
        break
    }
  }
  return (
    <div>
      <form onSubmit={onSearch} class={styles["panel-search"]}>
        <input
          type="text"
          placeholder="search"
          required
          value={query()}
          onInput={(e) => {
            setQuery(e.currentTarget.value)
          }}
        />
        <select
          name="platform"
          value={platform()}
          onChange={(e) => setPlatform(e.currentTarget.value)}
        >
          <option value="tmdb">TMDB</option>
          <option value="bgm">BGM</option>
          <option value="mal">MAL</option>
          <option value="anilist">AniList</option>
        </select>
        <button>Search</button>
      </form>
      <div class={styles["list-scroll"]}>
        <For each={items()}>
          {(item, index) => (
            <>
              <SearchItem
                title={item.title}
                title_original={item.title_original}
                air_date={item.air_date}
                link={item.link}
                onSelect={onSelect}
              />
              <Show when={index() < items().length - 1}>
                <hr class={styles.divider}></hr>
              </Show>
            </>
          )}
        </For>
      </div>
    </div>
  )
}

function PanelMain() {
  const [isShowSearch, setIsShowSearch] = createSignal(false)
  const [isShowSettings, setIsShowSettings] = createSignal(false)

  const centerDiv = {
    top: "0px",
    left: "0px",
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }

  const panelSearch = getPanel({
    theme: "dark",
    style: stylesheet,
  })
  Object.assign(panelSearch.wrapper.style, centerDiv)
  panelSearch.setMovable(false)
  render(PanelSearch, panelSearch.body)

  const panelSettings = getPanel({
    theme: "dark",
    style: stylesheet,
  })
  Object.assign(panelSettings.wrapper.style, centerDiv)
  panelSettings.setMovable(false)
  render(PanelSettings, panelSettings.body)

  const onClick = () => {
    setIsShowSearch(!isShowSearch())
    if (isShowSearch()) {
      panelSearch.show()
    } else {
      panelSearch.hide()
    }
  }

  const onSettingsClick = () => {
    setIsShowSettings(!isShowSettings())
    if (isShowSettings()) {
      panelSettings.show()
    } else {
      panelSettings.hide()
    }
  }

  panelSearch.wrapper.addEventListener("click", (e) => {
    if (e.target == panelSearch.wrapper) {
      onClick()
    }
  })

  panelSettings.wrapper.addEventListener("click", (e) => {
    if (e.target == panelSettings.wrapper) {
      onSettingsClick()
    }
  })

  return (
    <div class={styles["panel-config"]}>
      <button onClick={onClick}>Show</button>
      <button onClick={onSettingsClick}>Settings</button>
    </div>
  )
}

GM_addStyle(globalCss)

const panelMain = getPanel({
  theme: "dark",
  style: stylesheet,
})
Object.assign(panelMain.wrapper.style, {
  left: "8px",
  bottom: "8px",
})
Object.assign(panelMain.body.style, {
  borderRadius: "8px",
})
// panel.setMovable(false)
panelMain.show()
render(PanelMain, panelMain.body)

VM.observe(document, (mutations: MutationRecord[]) => {
  for (const mutation of mutations) {
    for (const addedNode of mutation.addedNodes) {
      if (addedNode instanceof HTMLFormElement && document.location.pathname.startsWith("/ui/acg/")) {
        const input = addedNode.querySelector("input[placeholder='例如 Yomi no Tsugai']")
        if (input === null || !(input instanceof HTMLInputElement)) continue
        input.maxLength = 47
      }
    }
  }
})

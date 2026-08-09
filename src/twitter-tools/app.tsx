import { getPanel } from "@violentmonkey/ui"
import VM from "@violentmonkey/dom"
import { render } from "solid-js/web"
import { createSignal, For } from "solid-js"
import styles, { stylesheet } from "./style.module.css"
import globalCss from './style.css';

GM_addStyle(globalCss)

const log = (...args: any[]) => {
  console.debug("twitter-tools:", ...args)
}

let currentProfileId: string = ""
const [currentUserLists, setCurrentUserLists] = createSignal<any[]>([])

const listAdd = (list_id: string, name: string) => {
  GM_lock("lock_list", () => {
    const lists: any = GM_getValue("lists", {})
    lists[list_id] = name
    GM_setValue("lists", lists)
  })
}

const listMemberAdd = (list_id: string, user_ids: string[]) => {
  GM_lock("lock_list", () => {
    const member_lists: any = GM_getValue("member_lists", {})
    for (const user_id of user_ids) {
      if (!member_lists[user_id]) member_lists[user_id] = []
      if (!member_lists[user_id].includes(list_id)) {
        member_lists[user_id].push(list_id)
      }
    }
    GM_setValue("member_lists", member_lists)
  })
}

const memberListAdd = (user_id: string, ...list_ids: string[]) => {
  GM_lock("lock_list", () => {
    const member_lists: any = GM_getValue("member_lists", {})
    if (!member_lists[user_id]) member_lists[user_id] = []
    for (const list_id of list_ids) {
      if (!member_lists[user_id].includes(list_id)) {
        member_lists[user_id].push(list_id)
      }
    }
    GM_setValue("member_lists", member_lists)
  })
}

const memberListRemove = (user_id: string, ...list_ids: string[]) => {
  GM_lock("lock_list", () => {
    const member_lists: any = GM_getValue("member_lists", {})
    for (const list_id of list_ids) {
      const deleteIndex = member_lists[user_id].indexOf(list_id)
      if (deleteIndex > -1) {
        member_lists[user_id].splice(deleteIndex, 1)
      }
    }
    GM_setValue("member_lists", member_lists)
  })
}

const updateLists = (member_lists: any) => {
  const lists: any[] = member_lists[currentProfileId] ?? []
  const lists_cache: any = GM_getValue("lists", {})
  setCurrentUserLists(lists?.flatMap((l) => lists_cache[l]))
  if (lists.length > 0) {
    panelMain.show()
  } else {
    panelMain.hide()
  }
}

GM_addValueChangeListener(
  "member_lists",
  (_name, _oldValue: any, newValue: any) => {
    updateLists(newValue)
  },
)

const loadMemberLists = () => {
  const member_lists: any = GM_getValue("member_lists", {})
  updateLists(member_lists)
}

const clearMemberLists = () => {
  currentProfileId = ""
  setCurrentUserLists([])
  panelMain.hide()
}

const xhr_proto = GMCompat.unsafeWindow.XMLHttpRequest.prototype
const backup_xhr_send = xhr_proto.send

const onResponse = (xhr: XMLHttpRequest) => {
  const contentType = xhr.getResponseHeader("Content-Type")
  if (!contentType?.includes("application/json")) return
  const url = URL.parse(xhr.responseURL)
  if (!url) return
  if (/^\/i\/api\/graphql\/\S+\/CreateList$/.test(url.pathname)) {
    const obj = JSON.parse(xhr.response)
    const list = obj?.data?.list
    const list_id = list?.id_str
    const name = list?.name
    listAdd(list_id, name)
  }
  if (/^\/i\/api\/graphql\/\S+\/ListAddMember$/.test(url.pathname)) {
    if (!currentProfileId) return
    const obj = JSON.parse(xhr.response)
    const list_id = obj?.data?.list?.id_str
    if (!list_id) return
    memberListAdd(currentProfileId, list_id)
    loadMemberLists()
  }
  // /i/api/graphql/c2IzeyWiwaQBkFs2VV_vSA/ListRemoveMember
  if (/^\/i\/api\/graphql\/\S+\/ListRemoveMember$/.test(url.pathname)) {
    log(currentProfileId)
    if (!currentProfileId) return
    const obj = JSON.parse(xhr.response)
    const list_id = obj?.data?.list?.id_str
    log(list_id)
    if (!list_id) return
    memberListRemove(currentProfileId, list_id)
    loadMemberLists()
  }
  if (/^\/i\/api\/1\.1\/lists\/memberships\.json$/.test(url.pathname)) {
    const obj = JSON.parse(xhr.response)
    const lists: any[] = obj?.lists
    if (!lists) return
    const user_id = url.searchParams.get("user_id")
    if (!user_id) return
    const list_ids: string[] = lists?.flatMap((l) => l?.id_str)
    memberListAdd(user_id, ...list_ids)
  }
  if (/^\/i\/api\/graphql\/\S+\/ListMembers$/.test(url.pathname)) {
    const obj = JSON.parse(xhr.response)
    const variables = url.searchParams.get("variables")
    if (!variables) return
    const list_id = JSON.parse(variables)?.listId
    if (!list_id) return
    const instructions: any[] =
      obj?.data?.list?.members_timeline?.timeline?.instructions
    if (!instructions) return
    const entries: any[] = instructions?.find(
      (instruction) => instruction?.type == "TimelineAddEntries",
    )?.entries
    if (!entries) return
    const userEntries = entries?.filter((entry) =>
      entry?.entryId?.startsWith("user-"),
    )
    const user_ids: string[] = []
    for (const entry of userEntries) {
      const user_id = entry?.content?.itemContent?.user_results?.result?.rest_id
      user_ids.push(user_id)
    }
    listMemberAdd(list_id, user_ids)
  }
  if (
    /^\/i\/api\/graphql\/\S+\/ListsManagementPageTimeline$/.test(url.pathname)
  ) {
    const obj = JSON.parse(xhr.response)
    const instructions: any[] =
      obj?.data?.viewer?.list_management_timeline?.timeline?.instructions
    if (!instructions) return
    const entries: any[] = instructions
      .filter((instruction) => instruction?.type == "TimelineAddEntries")
      ?.at(0)?.entries
    if (!entries) return
    const items: any[] = entries
      .filter((entry) => entry?.entryId == "owned-subscribed-list-module-0")
      ?.at(0)?.content?.items
    if (!items) return
    const lists = items?.flatMap((item) => item?.item?.itemContent?.list)
    GM_lock("lock_list", () => {
      const lists_prev: any = GM_getValue("lists", {})
      for (const l of lists) {
        const id = l?.id_str
        const name = l?.name
        if (!id || !name) continue
        lists_prev[id] = name
      }
      GM_setValue("lists", lists_prev)
    })
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

const processSpan = (span: HTMLSpanElement) => {
  if (span.childElementCount > 0) return
  const regex =
    /(総?作画?監督?|第?(2|２|二)原画?|原画|コンテ|演出|脚本|担当|美術|制作|仕上|カット|レイアウト|key animat(or|ion)|\bcuts?\b|\bgenga\b|\bnigen\b|\blo\b|sakkan|layouts?|storyboards?|animation direction|part|episode director)/gi
  if (!regex.test(span.textContent)) return
  const el = document.createElement("span")
  el.classList.add("tools-highlight")
  el.innerText = "REPLACE"
  span.innerHTML = span.innerHTML.replaceAll(
    regex,
    el.outerHTML.replace("REPLACE", "$$&"),
  )
}

VM.observe(
  document.body,
  (mutations) => {
    for (const mutation of mutations) {
      const target = mutation.target
      if (
        mutation.type == "characterData" &&
        target.parentElement?.parentElement?.dataset["testid"] == "tweetText" &&
        target.parentElement instanceof HTMLSpanElement
      ) {
        processSpan(target.parentElement)
      } else if (
        mutation.type == "childList" &&
        target instanceof HTMLElement
      ) {
        if (target.dataset["testid"] == "tweetText") {
          // log("show more", target, mutation.addedNodes)
          for (const addedNode of mutation.addedNodes) {
            const span = addedNode
            if (!(span instanceof HTMLSpanElement)) continue
            processSpan(span)
          }
        }
        if (target.parentElement?.ariaLabel?.startsWith("Timeline: ")) {
          // log("posts", target, mutation.addedNodes)
          for (const addedNode of mutation.addedNodes) {
            const el = addedNode
            if (!(el instanceof HTMLDivElement)) continue
            const tweetTexts = el.querySelectorAll('[data-testid="tweetText"]')
            for (const tweetText of tweetTexts) {
              const spans = tweetText.querySelectorAll("span")
              for (const span of spans) {
                processSpan(span)
              }
            }
          }
        }
      }
    }
  },
  { characterData: true },
)

VM.observe(document.head, () => {
  const userProfileSchema = document.querySelector(
    "script[data-testid=UserProfileSchema-test]",
  )
  if (!userProfileSchema) {
    clearMemberLists()
    return
  }
  const obj = JSON.parse(userProfileSchema?.textContent)
  if (obj["@type"] != "ProfilePage" || obj?.mainEntity["@type"] != "Person") {
    clearMemberLists()
    return
  }
  currentProfileId = obj?.mainEntity?.identifier
  loadMemberLists()
})

document.addEventListener("copy", function(event) {
  const textSelection = document.getSelection()?.toString();
  if (!textSelection) return
  if (!URL.canParse(textSelection)) return
  const url = URL.parse(textSelection)
  if (!url) return
  if (url.hostname != "x.com") return
  const re = /^\/\S+\/status\/(\d+)$/
  const match = url.pathname.match(re)
  if (!match) return
  const snowflakeId = match.at(1)
  if (!snowflakeId) return
  if (!event.clipboardData) return
  event.clipboardData.setData("text/plain", snowflakeId)
  event.preventDefault()
})

function PanelMain() {
  return (
    <ul class={styles["list"]}>
      <For each={currentUserLists()}>{(id) => <li>{id}</li>}</For>
    </ul>
  )
}

const panelMain = getPanel({
  style: stylesheet,
})
Object.assign(panelMain.wrapper.style, {
  left: "8px",
  bottom: "8px",
})
Object.assign(panelMain.body.style, {
  borderRadius: "8px",
  padding: "4px",
})
render(PanelMain, panelMain.body)

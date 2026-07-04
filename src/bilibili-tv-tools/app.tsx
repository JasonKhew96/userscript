const xhr_proto = GMCompat.unsafeWindow.XMLHttpRequest.prototype
const backup_open = xhr_proto.open

function new_open(this: XMLHttpRequest, ...args: any[]) {
  const [method, url, async, user, password] = args
  if (typeof url != "string")
    return GMCompat.apply(this, backup_open, [
      method,
      url,
      async,
      user,
      password,
    ])

  let newUrl = url
  if (newUrl.startsWith("//")) {
    newUrl = "https:" + newUrl
  }
  const parsedUrl = URL.parse(newUrl)
  if (!parsedUrl?.search)
    return GMCompat.apply(this, backup_open, [
      method,
      url,
      async,
      user,
      password,
    ])

  const params = new URLSearchParams(parsedUrl?.search)
  if (params.get("s_locale")) params.set("s_locale", "zh_SG")
  parsedUrl.search = "?" + params.toString()
  newUrl = parsedUrl.toString()

  GMCompat.apply(this, backup_open, [method, newUrl, async, user, password])
}

xhr_proto.open = GMCompat.export(new_open)

import VM from "@violentmonkey/dom"

GM_addStyle(`
:is(#scheduleWrap, #scheduleRangeEditorWrap, #scheduleInsertPreviewBody, #generateEpisodesPreviewBody) .schedule-platform-episode-grid {
  grid-template-columns: minmax(32px, 64px) minmax(240px, 1.2fr) minmax(180px, 1fr);
}
`)

VM.observe(document.body, (mutations) => {
  for (const mutation of mutations) {
    const target = mutation.target
    if (!(target instanceof HTMLDivElement)) continue
    if (target.id != "scheduleWrap") continue
    const onAirs = document.querySelectorAll(".f-onair-premiere")
    for (const onAir of onAirs) {
      if (!(onAir instanceof HTMLInputElement)) continue
      onAir.type = "datetime-local"
    }
  }
})

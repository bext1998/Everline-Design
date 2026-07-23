# Everline 下一步

最後更新：2026-07-23

## 下一個 Session 的目標

第二批 7 類元件已畢業為 `works/html/batch2/` 的框架中立 HTML/CSS 候選規格（`index.html` 為權威來源，SVG 為歷史快照）；2026-07-23 另修正該批三個實際 bug（Kanban 欄寬 token 誤植、`limit-reached` 卡片數與徽章不符、Kanban 欄位與 Task card 背景同色導致無法辨識分界），過程記錄見 `docs/STATUS.md`。第三批（桌面工具與補充能力，共 8 類）尚未開始，是下一批要畫的元件。

## 建議行動

1. 先收斂第二批遺留的跨元件設計問題，不要留到第三批繼續累積：拖曳／拖放視覺、共用 loading／empty、Data table 密度／pagination、Sidebar resizing、Kanban collapsed。建議在動第三批之前先定案，因為 Progress／Loading（第三批項目之一）跟「共用 loading／empty」是同一個問題，晚決定只會多返工一次。
2. 第三批 8 類建議依下列順序製作，理由是複雜度與相依性遞增，讓後畫的元件可以直接沿用先畫好的基礎：
   1. **Progress / Spinner / Loading** — 優先，用來回填第二批 List／Data table／Kanban column 擱置的 loading 狀態，一次解決兩批的缺口。
   2. **Search field** — 延伸既有 Text input 的 token 與結構，複雜度低。
   3. **Breadcrumb** — 純結構型導覽元件，無外部相依。
   4. **Number input / Spin button** — 延伸 Text input ＋ Icon button 既有樣式。
   5. **Slider** — 延伸 Switch 的軌道／滑塊視覺語彙，獨立元件。
   6. **Accordion** — 展開／收合結構型元件，獨立元件。
   7. **Popover** — 需要沿用 `component.*.menu-background`／`color.semantic.background-overlay` 既有浮動面板語彙，複雜度中等。
   8. **Date / Time picker** — 複雜度最高，會組合 Popover（彈出的月曆面板）＋ Text input（欄位）＋ Button，放最後才能直接沿用前面已畫好的 Popover。
3. 盤點 `works/illustrator/everline_p1.ai` 的圖層與群組命名；第一批、第二批的 SVG 候選稿都尚未回填至 Illustrator 主來源。

## 需要決定的事項

- ✅ 已決定：Illustrator 構思 → SVG 候選＋人類審查 → 確認後轉 HTML/CSS（「畢業」）的完整流程。細節見 `AGENTS.md`、`docs/spec.md`、`docs/STATUS.md`。
- ✅ 已決定：`component.list-item.*` 共用 token 只套用於 List／Data table／Kanban column，不回頭改動 Select／Split button／Menu。
- ✅ 已決定：Toolbar compact 保留 40px；Sidebar、List、Data table 等導覽／資料列保留 48px，兩者是不同互動密度角色。
- 待確認：第三批建議改依「建議行動」第 2 項的相依性順序（Progress/Loading 優先、Date/Time picker 最後），而非 `docs/TODO.md` 目前條列的原順序；下次執行前需使用者確認是否採用。

## 暫不處理

- 不直接實作前端元件庫。
- 不修改 Taylor Kanban 程式碼。
- 不再重命名或搬移 `works/illustrator/everline_p1.ai`。
- 不把未決的跨元件模式併入既有第二批 HTML/CSS 原型。

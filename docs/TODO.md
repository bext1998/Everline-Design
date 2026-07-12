# Everline 元件待辦清單

最後更新：2026-07-13

## 文件用途

本文件追蹤 Everline Design Language 的元件繪製與規格整理進度。清單以深色桌面工作型介面、Taylor Kanban 與未來圖形工具的共用需求為基礎。

狀態定義：

- `[ ]`：尚未開始或尚未確認。
- `[x]`：已有可辨識的初版設計；不代表規格已定稿。
- 元件正式完成前，仍需確認結構、狀態、變體、互動、內容與無障礙規則。

## 目前已有的初版元件

- [x] Button
- [x] Icon button
- [x] Switch
- [x] Split button
- [x] Dropdown
- [x] Text input（含單行與多行變體）
- [x] Color swatch

目前進度：7 類已有初版設計。

## 2026-07-13 收尾進度

- [x] 更新 `works/everline_p1.ai`，保存目前 Everline Design Language 的可編輯向量來源。
- [x] 更新 `works/72ppi/eve工作區域 1.png`，保存目前畫面預覽：按鈕、圖示按鈕、開關、分割按鈕、下拉選單、單行輸入框、多行文字輸入框與色票。
- [x] 保留目前 7 類元件為「已有初版設計」，尚未提升為正式穩定元件。
- [ ] 補齊上述元件的元件規格、狀態、互動與無障礙要求。

本次收尾狀態：設計來源與預覽已保存；下一階段仍以元件盤點與規格整理為主，不直接進入前端元件庫實作。

## Everline v0.1 待補元件

### 第一批：高頻基礎元件

- [ ] Checkbox
- [ ] Radio button
- [ ] Textarea
- [ ] Select / Combobox
- [ ] Menu / Context menu
- [ ] Tabs
- [ ] Tooltip
- [ ] Modal / Dialog
- [ ] Badge / Tag
- [ ] Alert / Inline notification / Toast

### 第二批：產品結構與資料元件

- [ ] Sidebar / Navigation rail
- [ ] Toolbar
- [ ] Card / Tile
- [ ] List
- [ ] Data table
- [ ] Kanban column
- [ ] Task card

### 第三批：桌面工具與補充能力

- [ ] Number input / Spin button
- [ ] Slider
- [ ] Accordion
- [ ] Popover
- [ ] Breadcrumb
- [ ] Search field
- [ ] Date / Time picker
- [ ] Progress / Spinner / Loading

v0.1 目標：補齊 25 類，使初版元件總數達到 32 類。

## 第二階段候選元件

這些元件常見於成熟的桌面或跨產品設計系統，但不列入 v0.1 必須完成的範圍。應依實際產品情境與重用價值決定是否升格為正式 Everline 元件。

- [ ] Drawer
- [ ] Tree view
- [ ] Layer panel
- [ ] Properties inspector
- [ ] Asset panel
- [ ] Command palette
- [ ] Segmented control
- [ ] Pagination
- [ ] File uploader
- [ ] Avatar / Avatar group
- [ ] Empty state
- [ ] Skeleton loading
- [ ] Divider
- [ ] Split pane / Resizable panel
- [ ] Color picker
- [ ] Stepper
- [ ] Progress tracker
- [ ] Banner
- [ ] Inline edit
- [ ] Window / App shell

## 每個元件的完成檢查

元件只有在下列項目均已確認後，才能從「已有初版設計」提升為正式完成：

- [ ] 用途與適用情境
- [ ] 不適用情境
- [ ] 結構與組成元素
- [ ] 尺寸與密度變體
- [ ] 狀態與狀態命名
- [ ] 互動與鍵盤操作
- [ ] 內容與文案規則
- [ ] 無障礙要求
- [ ] 圖示、色彩與 token 關係
- [ ] Illustrator 圖層、群組與元件命名
- [ ] 來源檔與匯出資產的追溯關係
- [ ] 審核狀態：候選、草稿、已審核或穩定

## 待確認事項

- [ ] 完整盤點 `works/everline_p1.ai`，確認現有元件、圖層與重用結構。
- [ ] 確認目前 7 類元件應標記為草稿候選，或直接作為 v0.1 起點。
- [ ] 決定元件規格文件的結構與放置方式。
- [ ] 從現有色票整理初步 color token 候選及其語意用途。
- [ ] 決定是否建立 `docs/components.md`。
- [ ] 決定是否建立 `docs/assets-index.md`。
- [ ] 有正式匯出內容時建立 `exports/`，並記錄來源、格式、尺寸與用途。
- [ ] 驗證 Taylor Kanban repo 與技術棧後，再決定 design token 的可消費格式。

## 範圍限制

- v0.1 不直接實作前端元件庫。
- 不修改 Taylor Kanban 程式碼。
- 不在尚未驗證技術棧前建立正式 token schema。
- 不任意重命名、搬移或刪除 `works/everline_p1.ai`。
- 研究參考與產品專用組合不得直接宣告為穩定的 Everline 系統元件。

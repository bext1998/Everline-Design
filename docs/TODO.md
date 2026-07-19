# Everline 元件待辦清單

最後更新：2026-07-19

## 文件用途

本文件追蹤 Everline Design Language 的元件繪製與規格整理進度。清單以深色桌面工作型介面、Taylor Kanban 與未來圖形工具的共用需求為基礎。

狀態定義：

- `[ ]`：尚未開始或尚未確認。
- `[x]`：已有可辨識的初版（candidate）設計；不代表規格已定稿。
- 元件正式完成前，仍需依「每個元件的完成檢查」逐項確認。

逐輪使用者回饋、像素級調整與問題排查的完整記錄見 `docs/design-system-v0.1-draft.md`（各元件小節）與 git log；本文件只保留目前狀態與尚待決定的事項，不重複收錄過程細節。

## 目前狀態總覽

- 所有 candidate 元件重畫並集中於單一總表 `works/everline-components-master.svg`；對應規格見 `docs/design-system-v0.1-draft.md`，token 見 `tokens/everline-draft.tokens.json`。
- `works/everline-agent-components-v0.1.svg` 已被總表取代，保留為歷史快照，不再更新。
- 已定案並套用的關鍵決定：字型家族 Noto Sans TC；disabled 文字一律用 `fill-opacity`（非 hex alpha，避免跨工具相容性問題）；Tooltip 為側邊（`beside`）彈出；Toast danger/error 圖示為 24×24 px 實心紅圓＋白色驚嘆號；浮動面板背景統一改用 `color.semantic.background-overlay`（套用於 Select／Split button 選單面板、Menu、Tooltip、Modal）。
- 待決定（詳見 `docs/design-system-v0.1-draft.md`「設計系統／Token 全面檢查」小節）：
  - focus ring 與 outline variant 目前共用同一組視覺（2 px 藍色描邊），尚未區分。
  - 是否要為可選取列元件（Select、Split button、Menu，未來 List／Data table／Kanban column）抽出共用 `component.list-item.*` token。
- 校準尚未全部完成，candidate 元件升格為穩定元件前仍需完整規格確認（見下方完成檢查清單）。

## Everline v0.1 待補元件

v0.1 目標：補齊 25 類，使初版元件總數達到 32 類。

### 第一批：高頻基礎元件

- [x] Button
- [x] Icon button
- [x] Switch
- [x] Split button
- [x] Dropdown
- [x] Text input（含單行與多行變體）
- [x] Color swatch
- [x] Checkbox
- [x] Radio button
- [x] Textarea
- [x] Select / Combobox
- [x] Menu / Context menu
- [x] Tabs
- [x] Tooltip
- [x] Modal / Dialog
- [x] Badge / Tag
- [x] Alert / Inline notification
- [x] Toast

第一批已全數完成 candidate 草稿；第二批 7 類已完成 SVG candidate 草稿（2026-07-20，待使用者審查），第三批共 8 類尚未開始。

### 第二批：產品結構與資料元件

第二批 SVG 候選稿位於獨立批次檔案 `works/everline-components-batch2.svg`（不併入 `works/everline-components-master.svg`）；經人類審查確認沒問題後才轉為 `works/html/` 的 HTML/CSS 候選規格（轉換即「畢業」，SVG 版本變歷史快照）。規格詳見 `docs/design-system-v0.1-batch2-draft.md`；共用 `component.list-item.*` token 已套用於 List／Data table／Kanban column。

- [x] Sidebar / Navigation rail（candidate，2026-07-20，`works/everline-components-batch2.svg`；expanded／collapsed 兩種模式，resizing 未畫出）
- [x] Toolbar（candidate，同上；default／selected／disabled／compact，overflow 僅畫觸發鈕）
- [x] Card / Tile（candidate，同上；default／hover／selected／disabled／error，dragging 未畫出）
- [x] List（candidate，同上；並排示範 row selection 與 row action 兩種寫法，empty／loading 未畫出）
- [x] Data table（candidate，同上；單一列高，density／pagination 未定義）
- [x] Task card（candidate，同上；基本欄位＋候選欄位（截止日／指派人頭像佔位，非正式 Avatar 元件）皆已畫出，dragging 未畫出）
- [x] Kanban column（candidate，同上；已確認納入 Everline 範圍，須依「處處是圓」原則改為圓角容器＋卡片間距，不可沿用 `works/illustrator/TaylorConceptMockup1.ai` 的表格式直角排版——該概念圖僅作結構參考，非樣式來源；normal／empty／limit-reached 已畫出，drag-over／collapsed／loading 未畫出）

以上 7 類 SVG candidate 已於 2026-07-20 經使用者審查通過（審查中修正的問題見 `docs/STATUS.md`）。審查通過只代表 SVG 視覺定案，尚未轉為 HTML/CSS（「畢業」），該轉換另約時間再進行，不在本次範圍。

### 第三批：桌面工具與補充能力

- [ ] Number input / Spin button
- [ ] Slider
- [ ] Accordion
- [ ] Popover
- [ ] Breadcrumb
- [ ] Search field
- [ ] Date / Time picker
- [ ] Progress / Spinner / Loading

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

- [ ] 完整盤點 `works/illustrator/everline_p1.ai`，確認現有元件、圖層與重用結構。
- [ ] 決定元件規格文件的結構與放置方式。
- [ ] 決定是否建立 `docs/components.md`。
- [ ] 決定是否建立 `docs/assets-index.md`。
- [ ] 驗證 Taylor Kanban repo 與技術棧後，再決定 design token 的可消費格式。

已解決：色票已整理為 color token 候選（見 `tokens/everline-draft.tokens.json`）；`exports/` 已建立並存放對應匯出圖；Title bar / Window chrome 已確認納入 Everline 範圍但標記為選擇性（optional）元件（緣由與細節見 `docs/design-system-v0.1-draft.md`、`docs/NEXT_ACTION.md`）。

## 範圍限制

- v0.1 不直接實作前端元件庫。
- 不修改 Taylor Kanban 程式碼。
- 不在尚未驗證技術棧前建立正式 token schema。
- 不任意重命名、搬移或刪除 `works/illustrator/everline_p1.ai`。
- 研究參考與產品專用組合不得直接宣告為穩定的 Everline 系統元件。

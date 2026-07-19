# Everline 元件待辦清單

最後更新：2026-07-19

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

## 2026-07-19 收尾進度（第一批新元件）

- [x] 建立 `works/everline-components-master.svg`：單一總表候選稿，重畫既有 9 類元件 + Badge/Tag + Inline alert，並新增第一批 6 類元件（Select/Combobox、Menu/Context menu、Tabs、Tooltip、Modal/Dialog、Toast/Snackbar），共 17 類。
- [x] 匯出校準預覽 `exports/everline-components-master.png`。
- [x] 將 `works/everline-agent-components-v0.1.svg` 標記為已被總表取代（`superseded-by` metadata），保留為歷史快照，不再更新。
- [x] 確認字型家族為 Noto Sans TC，更新 `docs/design-system-v0.1-draft.md` 與 `tokens/everline-draft.tokens.json`。
- [x] 為第一批 6 類新元件在 `docs/design-system-v0.1-draft.md` 補上規格草稿，並在 `tokens/everline-draft.tokens.json` 新增對應 token。
- [x] 使用者第一輪校準（2026-07-19）：Tooltip 從側邊彈出改為上方彈出；Button/Icon button/Badge/Select 的 disabled 文字改用 off-white 55% 透明度（當時以 8 位元 hex alpha 表示），取代原本對比過低的 gray-800 實色。
- [x] 使用者第二輪校準（2026-07-19）：disabled 文字透明度改用 `fill-opacity` 屬性而非 hex alpha（相容性問題，部分工具如 Illustrator 對 `#RRGGBBAA` 支援不一致）；Tooltip 確認改回側邊彈出樣式（不採用上方彈出），並修正箭頭與觸發元件的垂直對齊。
- [x] 使用者第三輪回饋（2026-07-19）：確認上述已知限制清單需要實際補畫，理由是方便建構設計系統與 design token。已補齊：Icon button outline variant、Select 的 Combobox 搜尋變體、Menu 的 checked/toggled item 與快捷鍵提示、Tabs 的 hover 狀態、Tooltip 的 `below` placement、Modal 的 backdrop 視覺與 `loading` 狀態、Toast 的 `danger/error` 變體。
- [ ] 使用者尚未完成完整校準；校準前一律視為 candidate，不得升格為穩定元件。
- [ ] Modal 的 focus trap、開閉動畫等屬於行為規格，非靜態向量可表達，待前端實作階段另定。
- [ ] Combobox 的無結果、多選、非同步搜尋狀態；Menu 的 submenu 指示；Tooltip 的 `left`／`above` placement、delay-in/out 時序，皆尚未定義，非本輪範圍。
- [x] 使用者第四輪回饋（2026-07-19，三張截圖）：
  - Tabs disabled（「紀錄」）文字顏色改為與系統一致的 off-white 55% 透明度，取代原本突兀的深灰實色 `#444`。
  - Toast danger／error 移除不合慣例的左側紅色裝飾條，圖示改為與 Inline alert danger 一致的警示三角形。
  - Combobox 修正真實錯誤：輸入框內打字的查詢文字不應與結果列表的「匹配高亮」同色，已改回一般前景色；並依使用者要求對齊 Select 展開清單的視覺結構（trigger 底部套用與 select-open 相同的圓角收平技法，使 trigger 與下方面板視覺相連）。
  - 「元件存在於原始碼但渲染時未顯示」（使用者轉述 Codex 的說法）：已檢查無重複 id（47 個 id 皆唯一）、所有座標皆在 1920×5424 畫布範圍內；找到唯一實際符合「部分內容未渲染」樣態的成因——combobox 結果列文字用 `<tspan>` 局部上色，但外層 `<text>` 沒有 fill，屬性混用時外層文字在部分渲染器可能不顯示；已補上外層 `fill`。全檔僅此兩處使用 `tspan` 混色，已一併修正；其餘純色文字元件皆為單一 class 樣式，非局部混色，不符合「部分顯示」的樣態，暫無法進一步複現該回報，待有更具體的元件／工具資訊再追查。
- [x] 使用者第五輪回饋（2026-07-19，兩張加註截圖）：
  - Combobox：使用者不確定 focus 描邊該不該包住整個清單，要求先查證 Android 系統慣例。已查證 Material Design 3 SearchView「contained style」：搜尋框與建議清單在展開時是同一個視覺容器（來源見 `docs/design-system-v0.1-draft.md` Select/Combobox 小節）。已將 2 px 藍色描邊從只框住 trigger，改為用單一複合圓角路徑（頂部 24 px、底部 16 px）包住 trigger＋結果列表整體。
  - Toast danger/error：圖示與「已複製連結」（shown）等其餘三個 toast 的圖示沒有對齊，經比對確認三角形圖示的 bounding box 比對照組偏左 9 px；已將圖示路徑整體平移 +9，對齊到與其他 toast 圖示一致的 x=20–38 範圍。
- [x] 使用者第六輪回饋（2026-07-19）：Toast danger/error 圖示太小、看不出是警示標誌，且對齊仍偏上一點點。已移除三角形外框改為單獨放大的「！」（垂直線 10 px＋圓點，stroke-width 2.5），並將圖示範圍延伸到 y=20–34，與其他 toast 圖示的垂直範圍一致。
- [x] 使用者第七輪回饋（2026-07-19）：Toast danger/error 圖示改為 24×24 px 實心紅色圓形＋白色「！」，圖示與文字間距約 14 px；容器維持深灰底與圓角，「重試」維持藍色。對應新增 token：`component.toast.danger-icon-size`／`danger-icon-background`／`danger-icon-foreground`／`icon-text-gap`。
- [x] 使用者要求（2026-07-19）：全面檢查設計系統／token 是否需要修改或增加規則，並新增圖示來源約束。已新增四個純文件性章節（不影響既有視覺）：Token 命名慣例、圖示系統（含 shadcn/ui／lucide-icons 來源約束）、堆疊順序（Layer）候選、動效（Motion）候選；`tokens/everline-draft.tokens.json` 對應新增 `motion.*`、`layer.*`、`icon.*` 三個 token 類別。同時發現 3 個會影響既有元件顏色的問題，記錄在 `docs/design-system-v0.1-draft.md`「設計系統／Token 全面檢查」一節，刻意不擅自執行：浮動面板背景色不一致（5 個元件 4 種色值）、`modal.background` 為唯一未對應 base palette 的裸 hex 值、focus ring 與 outline variant 目前共用同一視覺。
- [x] 使用者指示（2026-07-19）：「先統一浮動面板背景色，改用新的 background-overlay token」。已新增 `color.semantic.background-overlay`（`= gray-700 #4D4D4D`），套用到 Select／Split button 選單面板、Menu、Tooltip、Modal 共 5 處；一併修正 Menu hover 列與新底色相同會隱形的連帶問題（改用 white-overlay 疊加，比照 Tabs 既有手法）。`works/everline-components-master.svg` 已更新並渲染核對五個元件，`exports/everline-components-master.png` 已同步。剩餘 2 個待決定項目（focus ring vs outline 共用視覺、list-item 共用 token 建議）仍待使用者決定，未動作。

本次收尾狀態：第一批（高頻基礎元件）已全數畫出 candidate 草稿並整理成單一總表，且已依使用者第一輪回饋修正 Tooltip 對齊與 disabled 文字對比；第二批（產品結構與資料元件）與第三批（桌面工具與補充能力）待使用者確認本批後才排入。

## Everline v0.1 待補元件

### 第一批：高頻基礎元件

- [x] Checkbox
- [x] Radio button
- [x] Textarea
- [x] Select / Combobox（candidate，2026-07-19，`works/everline-components-master.svg`）
- [x] Menu / Context menu（candidate，2026-07-19，`works/everline-components-master.svg`）
- [x] Tabs（candidate，2026-07-19，`works/everline-components-master.svg`）
- [x] Tooltip（candidate，2026-07-19，`works/everline-components-master.svg`）
- [x] Modal / Dialog（candidate，2026-07-19，`works/everline-components-master.svg`）
- [x] Badge / Tag（candidate，原 2026-07-16 於 `works/everline-agent-components-v0.1.svg` 完成，2026-07-19 補勾；已重畫進 `works/everline-components-master.svg`，v0.1 檔案保留為歷史快照）
- [x] Alert / Inline notification（candidate，同上，Inline alert 已完成並重畫進總表）
- [x] Toast（candidate，2026-07-19，`works/everline-components-master.svg`；為「Alert / Inline notification / Toast」中原本欠缺的 Toast 短暫提示變體）

### 第二批：產品結構與資料元件

- [ ] Sidebar / Navigation rail
- [ ] Toolbar
- [ ] Card / Tile
- [ ] List
- [ ] Data table
- [ ] Kanban column（2026-07-19 確認納入 Everline 範圍；不可沿用 `works/illustrator/TaylorConceptMockup1.ai`／`works/TaylorConceptMockup1.svg` 的表格式直角排版，需依「處處是圓」原則改為圓角容器＋卡片間距，該概念圖僅作結構參考，非樣式來源）
- [ ] Task card（同上，欄位內卡片各自圓角並保留間距，不使用貼合分隔列；2026-07-19 使用者口述補齊內容欄位：狀態圓點＋標題＋標籤為基本欄位，另加候選欄位「截止日」與「指派人」——指派人 Taylor 本身無帳戶概念、目前用不到，但使用者要求仍加入 Everline 範圍，供其他延伸產品使用；指派人欄位需搭配頭像呈現，對應 `docs/TODO.md` 第二階段候選元件的 Avatar / Avatar group）

### 第三批：桌面工具與補充能力

- [ ] Number input / Spin button
- [ ] Slider
- [ ] Accordion
- [ ] Popover
- [ ] Breadcrumb
- [ ] Search field
- [ ] Date / Time picker
- [ ] Progress / Spinner / Loading

v0.1 目標：補齊 25 類，使初版元件總數達到 32 類。目前進度：第一批 10 類已全數完成 candidate 草稿（含 Badge/Tag、Inline alert、Toast），第二批、第三批共 15 類尚未開始。

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
- [ ] 確認目前 7 類元件應標記為草稿候選，或直接作為 v0.1 起點。
- [ ] 決定元件規格文件的結構與放置方式。
- [x] 從現有色票整理初步 color token 候選及其語意用途（見 `tokens/everline-draft.tokens.json`）。
- [ ] 決定是否建立 `docs/components.md`。
- [ ] 決定是否建立 `docs/assets-index.md`。
- [x] `works/illustrator/TaylorConceptMockup1.ai`／`works/TaylorConceptMockup1.svg`（2026-07-19 使用者提供的 Taylor 主視窗結構概念圖）顯示 Taylor 預計採用自訂視窗框架（Wails v2，參考 Codex 桌面端），標題列含最小化／最大化／關閉控制。2026-07-19 使用者決定：Title bar / Window chrome 納入 Everline 範圍，但標記為**選擇性（optional）元件**，不是每個採用 Everline 的產品都必須使用自訂視窗框架——本專案是開源專案，希望也能服務不熟悉圖形介面設計的使用者，這類使用者可能傾向沿用系統原生標題列，不應強制要求客製化。
- [x] 建立 `exports/`，目前存放 `everline-agent-components-v0.1.png`、`everline-components-master.png`，來源與用途見對應向量檔的 metadata。
- [ ] 驗證 Taylor Kanban repo 與技術棧後，再決定 design token 的可消費格式。

## 範圍限制

- v0.1 不直接實作前端元件庫。
- 不修改 Taylor Kanban 程式碼。
- 不在尚未驗證技術棧前建立正式 token schema。
- 不任意重命名、搬移或刪除 `works/illustrator/everline_p1.ai`。
- 研究參考與產品專用組合不得直接宣告為穩定的 Everline 系統元件。

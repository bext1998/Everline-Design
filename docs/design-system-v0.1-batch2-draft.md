# Everline v0.1 設計系統草稿 — 第二批

狀態：`candidate`（HTML/CSS 權威來源：`works/html/batch2/index.html`；SVG 保留為歷史快照）
建立日期：2026-07-20
候選向量稿：`works/everline-components-batch2.svg`（2026-07-23 起為歷史視覺快照）；候選規格權威來源：`works/html/batch2/index.html`。
延伸文件：本檔案延伸 `docs/design-system-v0.1-draft.md` 的「已確認規則」「Token 命名慣例」「圖示系統」「堆疊順序」「動效」等跨元件規則，不重複列出；只記錄第二批（Sidebar/Navigation rail、Toolbar、Card/Tile、List、Data table、Task card、Kanban column）各元件的專屬規格。

本文件章節順序依實際繪製順序排列：Task card 排在 Kanban column 之前，因為 Kanban column 的 `normal` 狀態需要放入已定案的 Task card，避免畫兩次。這與元件待辦清單上「Kanban column 在 Task card 之前」的原始順序不同，屬於刻意調整，不是遺漏。

## 已解決的開放問題：共用 list-item token

`docs/design-system-v0.1-draft.md` 曾在「設計系統／Token 全面檢查」一節留下未決問題：List、Data table、Kanban column 都需要「可選取列」視覺語言，但 Select／Split button／Menu 各自做法不同，沒有共用 token。

2026-07-20 已確認：新增 `component.list-item.*`（見 `tokens/everline-draft.tokens.json`），**只套用在本批的 List、Data table、Kanban column**，不回頭改動已審查過的 Select／Split button／Menu。核心差異：selected 用「`action-primary` 淡色疊加（`opacity.selected-overlay`）＋左側 3px 強調條」，而非 Select 現有的「`action-primary` 實色底」——因為清單／表格常見多列同時選取，整排實色藍底會讀成一排按鈕，跟 Select 的單選、瞬時選取情境不同。

保留為未來選項、本批不執行：把 Select／Split button／Menu 的既有選取視覺回頭遷就同一套 list-item 語言。那是會改動已核准視覺的決定，需要獨立審查回合，不應是這次新增 token 的附帶結果。

## 跨元件擱置事項

以下三個問題會同時影響本批多個元件，本輪刻意擱置、不臨場自創答案：

- **拖曳／拖放中視覺**：Card 的 `dragging`、Kanban column 的 `drag-over`、Task card 的 `dragging`。本次 HTML/CSS 畢業未納入，待獨立決定 Everline「低裝飾、不先引入陰影」原則在此情境是否例外。
- **空狀態／載入中佔位**：List、Data table、Kanban column 的 `empty`／`loading`。本次僅保留已審查的 Kanban `empty`；共用 loading／其他 empty 視覺仍待集中設計。
- **密度／分頁**：Data table 的 `pagination` 與列高密度、Sidebar 的 `resizing`，本次未納入。

## Sidebar / Navigation rail

狀態：`candidate`（第二批，2026-07-20）

### 用途與邊界

提供主要工作區之間的持續導覽入口，例如看板清單、專案導覽、圖層面板。與 Menu／Context menu 不同：Sidebar 是持續存在的導覽結構，不是暫時性的操作選單。單一元件包含 `expanded`（完整側欄）與 `collapsed`（窄版 icon-only rail）兩種模式，不視為兩個獨立元件。

### 結構與變體

- `expanded`：寬度候選 256px（`component.sidebar.width-expanded`），內含導覽項目列（`component.sidebar.item-height` = 48px）與一個分區標題（`component.sidebar.section-header-foreground`）。
- `collapsed`（rail）：寬度候選 72px（`component.sidebar.width-collapsed`），只顯示圖示，不顯示文字標籤。

### 狀態、互動與內容

- 已畫出：`expanded` 內的 `default`／`hover`／`selected`／`disabled` 導覽項目；`collapsed` 內的 `default`／`selected` 圖示項目，以及一個 notification 徽章示範。
- 擱置：`resizing`（拖曳調整寬度的互動，無法由靜態向量表達）。

### 無障礙

- 導覽項目需可由鍵盤依序 Tab／方向鍵操作，`selected` 對應 `aria-current`。
- `collapsed` 模式下的圖示項目仍需可存取名稱（不能只靠圖示本身）。

## Toolbar

狀態：`candidate`（第二批，2026-07-20）

### 用途與邊界

承載高頻、持續可見的操作入口，例如未來向量繪圖或看板編輯器的工具列。與 Menu 不同：Toolbar 一律可見，不是點擊後才出現的暫時性選單。

### 結構與變體

- 標準高度 48px（`component.toolbar.height`），緊湊高度 40px（`component.toolbar.compact-height`）；40px 只用於高頻 Toolbar compact，Sidebar／List／Data table 等導覽與資料列維持 48px。
- 以 Icon button 群組＋ 1px 分隔線（`component.toolbar.divider`）組成。

### 狀態、互動與內容

- 已畫出：`default`（icon-button 群組＋分隔線）、`selected`（目前作用中工具）、`disabled`、`compact`（緊湊間距對照組）。
- `overflow` 只畫觸發用的「更多」icon button，不重畫展開後的面板——沿用既有 Menu 元件的視覺與行為，不新增一套選單語言。

### 無障礙

- 工具需可由鍵盤依序操作；`selected` 工具需可由輔助科技辨識為目前作用中，不能只靠背景色。

## Card / Tile

狀態：`candidate`（第二批，2026-07-20）

### 用途與邊界

通用內容容器，例如素材卡、模板卡、通知摘要。與 Task card 不同：Card 不預設固定欄位結構（狀態圓點／標籤／指派人），是更泛用的容器，Task card 是它在任務情境下的專用延伸。

### 結構與變體

- 圓角 16px（`component.card.radius`），內距 24px（`component.card.padding`），背景沿用 `background-surface`。

### 狀態、互動與內容

- 已畫出：`default`、`hover`、`selected`（`border-selected` 描邊）、`disabled`、`error`（沿用 Inline alert 的 4px 語意色指示條語彙，不新發明一套錯誤視覺）。
- 擱置：`dragging`（見上方「跨元件擱置事項」）。

### 無障礙

- 可互動 Card 需有明確可見的 focus 狀態；`selected` 不能只靠描邊顏色，需搭配其他非顏色線索（例如勾選圖示）。

## List

狀態：`candidate`（第二批，2026-07-20）

### 用途與邊界

呈現同質項目的垂直清單，例如檔案列表、成員列表。與 Menu 不同：List 項目通常是持續存在的資料，不是一次性操作指令；與 Data table 不同：List 不強調多欄位對齊比較。

### 結構與變體

- 列高 48px（`component.list-item.height`），套用 `component.list-item.*` 共用 token。個別列各自 8px 圓角（`component.list-item.radius`）並以 4px 間距（`component.list-item.row-gap`）區隔，不使用貼合的直角分隔列（處處是圓原則）。

### 狀態、互動與內容

- 已畫出：`default`、`hover`、`selected`、`disabled` 列；`grouped`（含分區標題列，此手法之後 Data table／Kanban column 沿用）。
- 明確拆為兩種變體以區分「row action」與「item selection」：(a) 選取型 List 使用前導勾選框；(b) 操作型 List 使用列尾獨立圖示按鈕（例如刪除），點擊該按鈕不觸發整列選取。
- 擱置：`empty`、`loading`（見上方「跨元件擱置事項」）。

### 無障礙

- 可選取列需使用適當語意（例如 `aria-selected` 或勾選框本身的 checked 狀態），列尾動作按鈕需有獨立可存取名稱，不能與整列選取的語意混淆。

## Data table

狀態：`candidate`（第二批，2026-07-20）

### 用途與邊界

呈現多欄位、可比較的結構化資料。與 List 不同：Data table 強調欄位對齊與逐欄比較；密度與行動版策略本批不定義。

### 結構與變體

- 表頭列高 48px（`component.data-table.header-height`），資料列套用 `component.list-item.*` 共用 token（同 List）。只畫單一列高，不在本輪決定密度變體。

### 狀態、互動與內容

- 已畫出：表頭列（含一個 `sorted` 欄位排序指示，`component.data-table.sort-indicator-color`）、`default`／`hover`／`selected` 資料列（前導勾選框＋ list-item token）。
- 擱置：`pagination`、`loading`、`empty`、列層級 `error`（見上方「跨元件擱置事項」；`error` 額外需要先決定是列層級還是欄位層級才能定義視覺）。

### 無障礙

- 表頭需與資料格建立程式可辨識關聯（例如 `scope` 或對應 ARIA 屬性）；排序狀態需可由輔助科技辨識，不能只靠圖示方向。

## Task card

狀態：`candidate`（第二批，2026-07-20）

### 用途與邊界

承載單一任務的看板卡片，是 Card 在任務情境下的專用延伸。基本欄位：狀態圓點＋標題＋標籤；候選欄位：截止日＋指派人（指派人需搭配頭像，詳見下方）。

### 結構與變體

- 沿用 `component.card.*` 的圓角、內距、背景與 hover／selected 視覺。狀態圓點 8px（`component.task-card.status-dot-size`），標籤沿用 Badge/Tag 間距語彙（`component.task-card.tag-gap`）。
- 指派人頭像為輕量佔位圖（圓形＋姓名縮寫，`component.task-card.assignee-avatar-size` = 24px），**明確標註為候選欄位示意，不是正式 Avatar 元件**——Avatar / Avatar group 是第二階段候選元件，不在 v0.1 範圍內，此處只是讓 Task card 的候選欄位視覺完整。

### 狀態、互動與內容

- 已畫出：`default`（狀態圓點＋標題＋2 個標籤，基本欄位）、`hover`、`selected`、`done`、`blocked`（狀態圓點顏色變化）、一個含候選欄位（截止日＋指派人頭像佔位）的變體。
- `done`／`blocked` 的狀態圓點顏色僅使用既有已核准色階（`action-primary`／`action-danger`），不新增未核准的成功色（綠色）；`done` 暫用 `action-primary` 表示，待 success 語意色確認後可能需要調整。
- 擱置：`dragging`（見上方「跨元件擱置事項」）。

### 無障礙

- 狀態圓點不能只靠顏色傳達 done／blocked，需搭配文字或圖示；指派人頭像佔位需有可存取名稱（例如姓名），不能只靠縮寫字母。

## Kanban column

狀態：`candidate`（第二批，2026-07-20）

### 用途與邊界

看板單一欄位，容納多張 Task card。必須維持「處處是圓」原則：欄位本身與內部卡片皆為圓角容器＋間距，不得沿用 `works/illustrator/TaylorConceptMockup1.ai`／`works/TaylorConceptMockup1.svg` 的表格式直角排版——該概念圖僅作結構參考，不是樣式來源。

### 結構與變體

- 欄位寬度 288px（`component.kanban-column.width`；2026-07-23 由 320px 校正，320 原是 SVG 原始檔裡欄位排列的間距基準 [欄寬 288px＋32px 間距]，誤寫成欄寬本身，已依審查通過的 SVG 實際繪製寬度重新量測校正），圓角 16px，標題列高 48px（含標題與數量徽章）。卡片間距沿用 `component.list-item.row-gap`（`component.kanban-column.card-gap`）。
- 欄位本體背景需與內部 Task card 背景明顯區分（`component.kanban-column.background` = `color.base.gray-850` #262626，深於 Task card 用的 `background-surface` #333），卡片才會視覺上「浮」在欄位上、看得出彼此的分界，不能兩者共用同一色。2026-07-23 新增：此值是從已審查通過的 SVG 反查回來補上的 token，SVG 一直有這個對比、只是先前沒被收進 token 表，導致 `works/html/batch2/` 誤用了跟 Task card 相同的 `background-surface`，欄位與卡片、卡片與卡片之間完全沒有可辨識的分界。

### 狀態、互動與內容

- 已畫出：`normal`（標題＋數量徽章＋2-3 張已定案的 Task card）、`empty`（極簡文字/圖示佔位，非完整 illustration）、`limit-reached`（數量徽章切換為 `limit-badge-color` / danger 色，欄內 Task card 數量須與徽章一致，例如 5/5 就要畫滿 5 張，讓欄位視覺上真的「滿了」——歷史 SVG 快照裡這個狀態只畫了 1 張卡配 5/5 徽章，數字與內容對不上，是繪製時的疏漏；`works/html/batch2/` 已於 2026-07-23 補齊為 5 張卡，SVG 本身依規則不再更新，保留原樣為歷史紀錄）。
- 擱置：`drag-over`、`collapsed`、`loading`（見上方「跨元件擱置事項」；`collapsed` 建議之後與 Sidebar 的 collapsed rail 一併設計，兩者都是「縱向窄條」處理方式）。

### 無障礙

- 欄位標題需可由輔助科技辨識為群組標籤；數量徽章與 limit 狀態需有文字說明，不能只靠顏色變化傳達已達上限。

## 校準清單

- 待確認：本文件所有尺寸數值（256/72px 側欄寬度、各元件間距）皆為未經視覺驗證的候選值，繪製與渲染後可能調整；看板欄寬已於 2026-07-23 依審查通過的 SVG 實際寬度校正為 288px（見上方「結構與變體」）。
- 待確認：`component.task-card.status-dot-done` 暫用 `action-primary` 表示完成，success 語意色確認後需重新檢視是否改色。
- 待確認：Sidebar 的 notification 徽章應使用 primary 還是 danger 語意色，本批未決定。
- 待確認：List 並排畫出的兩種選取／動作寫法，何者作為預設、何者作為特殊情境，需使用者審查後決定。

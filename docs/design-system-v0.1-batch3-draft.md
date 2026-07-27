# Everline v0.1 設計系統草稿 — 第三批

狀態：`candidate`（HTML/CSS 權威來源：`works/html/batch3/index.html`；SVG 保留為歷史快照）
建立日期：2026-07-27
候選向量稿：`works/everline-components-batch3.svg`（2026-07-27 起為歷史視覺快照，僅含本檔案記錄的元件）；候選規格權威來源：`works/html/batch3/index.html`。
延伸文件：本檔案延伸 `docs/design-system-v0.1-draft.md` 與 `docs/design-system-v0.1-batch2-draft.md` 的跨元件規則，不重複列出；只記錄第三批已完成元件的專屬規格。

範圍說明：第三批（8 類，桌面工具與補充能力）採逐一元件、逐一 GitHub issue 完成，不像第一、二批一次繪製整批。本檔案目前涵蓋第 1-2/8 個元件：Progress / Spinner / Loading（issue #5）、Search field（issue #6）。其餘 6 個元件（issue #7-#12）完成時會依序追加到本檔案，而不是另開新檔——沿用批次一、二「同批次共用一份規格文件」的慣例。

## Progress / Spinner / Loading

狀態：`candidate`（第三批 1/8，2026-07-27，GitHub issue #5）

### 用途與邊界

表示作業進度或資料載入中，涵蓋兩種視覺形式：Spinner（不確定時長，僅 indeterminate）與 Progress bar（已知/可估計進度時，determinate；也可表示 indeterminate 與失敗）。與其他元件的既有 loading 用法區分：本元件是共用的視覺語言來源，List、Data table、Kanban column 的 `loading` 狀態套用本元件的視覺，不另外設計（回填見下方「跨批次回填」）。

### 結構與變體

**Spinner**（僅 indeterminate，無 determinate 變體——不確定時長時才用 spinner，若已知進度應改用 Progress bar）：
- `size-sm`（24px，`component.spinner.size-sm`）：與文字並列的 inline 用法。
- `size-md`（40px，`component.spinner.size-md`）：獨立、預設用法。
- `size-lg`（64px，`component.spinner.size-lg`）：full-page／阻斷式載入，置中於半透明遮罩（`component.spinner.overlay-backdrop-color` + `opacity.backdrop`）之上。
- 視覺技法：CSS 經典 border-spin（全圈套用 `track-color`，`border-top-color` 改為 `indicator-color`，持續 `rotate(360deg)`），不是 SVG `stroke-dasharray` 的做法——候選稿階段（SVG）用 dasharray 畫出「當下一幀」的靜態快照，畢業到 HTML/CSS 後改用更簡單、瀏覽器相容性更好的 border 技巧；兩者視覺意圖一致（一圈之中一段醒目弧段），實作手法不同，不影響已核准的視覺語言。
- 旋轉週期：`component.spinner.rotation-duration`（= `motion.duration-loop`，900ms）。**2026-07-27 新增 `motion.duration-loop` token**：既有 `motion.duration-slow`（320ms）是為「一次性開闔轉場」設計，套用在一圈 360° 旋轉上會太快、觀感像故障閃爍，因此不強行沿用，改新增一個語意正確的共用值，供未來其他持續循環動畫（例如 skeleton shimmer）沿用。

**Progress bar**：
- 高度 8px（`component.progress.height` = `space.1`），pill 圓角（`component.progress.radius` = `radius.pill`）。
- 無固定寬度 token——寬度由容器決定（沿用 `component.text-input` 沒有寬度 token 的同一邏輯），不是本元件的既有設計決策。
- `track-color`：`color.base.gray-700`（與既有 Card 佔位色塊、Data table 表頭文字同一色階，視覺分量一致，不是新發明的顏色）。
- `fill-primary`：`action-primary`；`fill-danger`：`action-danger`。
- `indeterminate`：內層區段（30% 寬）以 `left` 位移持續由左到右循環（`everline-progress-indeterminate`，1.2s），單向循環而非早期 SVG 候選稿描述的「持續往復」——HTML/CSS 階段確認單向循環是更常見、更順滑的慣例（例如 Bootstrap／Material 皆採單向），2026-07-27 由使用者實際看動態效果後確認調整方向。

### 狀態、互動與內容

- Spinner 三種尺寸皆為 `role="status"` + `aria-label`，僅 indeterminate，無其他狀態。
- Progress bar determinate：`role="progressbar"` + `aria-valuemin`/`aria-valuemax`/`aria-valuenow`，需搭配狀態文案（例如「匯出設計稿…」），長時間流程應提供取消策略（見 full-page 範例的「取消」）。
- Progress bar indeterminate：`role="progressbar"` + `aria-valuetext`，依 WAI-ARIA 慣例刻意不寫 `aria-valuenow`（不確定進度時不應假裝有精確數值）。
- Progress bar error：danger 色 fill／track 不變（仍是 `track-color`），標籤加驚嘆號圖示與 `action-danger` 文字色；候選稿內建「重試」示範互動。
- Full-page spinner：候選稿以固定尺寸容器示意（非真實整頁），內含「取消」連結，點擊後隱藏遮罩、顯示示意內容與「重新示範」，用於驗證取消互動的可行性，非最終產品文案。
- **無障礙／持續動畫的 reduced-motion 修正（2026-07-27）**：批次二既有的全域 `prefers-reduced-motion` 規則（把所有動畫／過渡時長壓到 0.01ms）是針對「一次性開闔轉場」寫的，套用在本元件「持續循環」的旋轉／滑動動畫上會變成極速閃爍而非停止。本批次在 `works/html/batch3/styles.css` 另外加了專屬覆寫，讓 spinner 與 indeterminate progress 在 reduced-motion 下直接凍結於靜態畫面（`animation: none`），不再套用生錯的「縮短時長」邏輯。之後若有新的持續循環動畫元件，應延用這個「停止而非縮短」的處理方式，而不是回頭套用批次二那條泛用規則。

### 無障礙

- Spinner 必須有 `role="status"` 與可存取名稱（`aria-label`），不能只靠圖形本身傳達「正在載入」。
- Determinate progress bar 需要 `aria-valuenow`／`aria-valuemin`／`aria-valuemax` 三者皆備；indeterminate 依規範不寫 `aria-valuenow`。
- 長時間流程建議提供文字狀態與取消策略（參考 `references/gui-components-reference.md` 對 Progress/Loading 的既有備註）。
- 持續動畫需尊重 `prefers-reduced-motion`，且必須是「停止」而非「縮短到近乎瞬間」（見上）。
- **2026-07-27 PR review 修正**：`prefers-reduced-motion` 的處理不能只靠 CSS。Determinate progress 的自動示範迴圈與 error 重試的爬升動畫都是 JS（`setTimeout`/`setInterval`）持續改變 `width`／`aria-valuenow`，CSS 的 `animation`/`transition` reduced-motion 覆寫完全管不到這種由 JS 驅動的持續變化——實測會出現「畫面上動畫確實停了，但數值還在一直跳」的落差。修正方式：JS 端也要用 `window.matchMedia('(prefers-reduced-motion: reduce)')` 自行判斷，reduced motion 時直接跳過持續迴圈、停在靜態值，不能假設 CSS 那層已經處理好。之後任何新增「JS 驅動的持續性示範/動畫」都要比照辦理，不能只加 CSS 覆寫就視為完成。

## 跨批次回填

Issue #5 的範圍包含把本元件的 loading 視覺套進第二批 List、Data table、Kanban column（GitHub issue #13 當時明確擱置、等本元件定案後才處理，見 `docs/design-system-v0.1-batch2-draft.md` 跨元件設計決策）。**已於同一 PR 完成**：`works/html/batch2/` 的 List、Data table、Kanban column 皆已套用本元件的 spinner（沿用既有 `empty-state` 容器，只換圖示與文案），細節與 token 對照見 `docs/design-system-v0.1-batch2-draft.md` 對應章節，該檔案為狀態權威來源，此處不重複維護。

## Search field

狀態：`candidate`（第三批 2/8，2026-07-27，GitHub issue #6，已畢業為 HTML/CSS；`works/html/batch3/index.html` 為候選規格權威來源，`works/everline-components-batch3.svg` 對應區塊為歷史快照，不再更新）

### 用途與邊界

單行搜尋輸入，用於在清單、看板、資產面板等內容集合中即時篩選或觸發搜尋。刻意延伸既有 Text input 的結構與 token（高度、radius、背景、placeholder 色、focus 邊框皆直接沿用），不另立一套元件語言——差異只在於前導搜尋圖示與內容出現時的尾端清除按鈕。不適用於需要送出按鈕、進階篩選條件組合或多欄位查詢的情境；那類需求應另外設計，不應把本元件硬套上去。

### 結構與變體

- 沿用 `component.text-input` 的核心量測：高度 48px（`component.search-field.height` = `size.control-md`）、radius 24px（`component.search-field.radius` = `radius.control`）、背景 `background-subdued`；寬度由容器控制，同 Text input 既有慣例，無寬度 token。
- 前導搜尋圖示：16px（`component.search-field.icon-size` = `size.icon-sm`），左側內縮 16px（`icon-inset` = `space.2`），與文字間距 8px（`content-gap` = `space.1`），圖示與 placeholder 同色（`icon-color` = `placeholder` = `color.base.gray-700`）——圖示是裝飾性元素，不用來傳達狀態，因此不需要獨立色彩身分。
- 尾端清除按鈕：僅在欄位有內容時出現（filled／focused-with-content），16px ✕ 圖示，內縮與間距對稱於前導圖示（同樣 16px inset + 8px gap）。空欄位時沒有清除按鈕，尾端內距沿用既有 `component.text-input.padding-inline`（24px，`component.search-field.padding-inline-end` = `space.3`）；有清除按鈕時尾端內距改為 40px（`padding-inline-end-filled`，= icon-inset + icon-size + content-gap，與前導側的 `padding-inline-start` 對稱推導）。
- Focused：2px 藍色描邊（`border-focus` / `border-width-focus`，值與 Text input 相同），繪製手法沿用 Text input 既有的內縮 stroke 技巧（`rx` 隨描邊寬度微調，避免描邊溢出元件邊界），不是新技法。

### 狀態、互動與內容

- 候選稿涵蓋 empty、filled（含清除按鈕）、focused、disabled 四種狀態。刻意不含 error、readonly——這兩者不是搜尋欄的典型情境（Text input 本身也僅視為未來待補項目，見上方 Text input 小節），若之後有具體產品情境需要，再另行設計。
- 清除按鈕點擊後應清空輸入值、將焦點留在欄位內（不應把焦點移出），並重新觸發篩選（若有即時篩選邏輯）；HTML/CSS 畢業階段須確認鍵盤可達（可用 Tab 到達、Enter／Space 觸發）。
- disabled：即使欄位內殘留文字，也必須隱藏清除按鈕——顯示清除按鈕會暗示欄位仍可互動，與 disabled 語意矛盾。圖示與文字改用既有 `foreground-disabled`（off-white + `opacity.disabled` 0.55），手法與 `select-disabled`／`button-disabled` 一致，不另立 disabled 專屬顏色。
- Placeholder（例如「搜尋…」）僅供範例，不能取代欄位的可存取名稱；若搜尋範圍不明顯，應搭配額外文字說明搜尋對象（例如「搜尋任務」而非單純「搜尋」）。

### 無障礙

- 欄位需要程式可辨識的可存取名稱（`aria-label` 或關聯的 `<label>`），不能只靠 placeholder 傳達用途。
- 清除按鈕需要獨立的可存取名稱（例如 `aria-label="清除搜尋"`），且必須是可鍵盤操作的互動元素（`<button>`），不能只用純圖示 `<span>` 加點擊事件。
- Focus、disabled 不只靠色彩區分（focus 有邊框變化、disabled 有內容變暗＋游標樣式變化），呼應 Text input 既有的無障礙要求。
- 圖示對比與可讀性待字型定稿後與 Text input 一併重新測量，不在本次候選稿範圍內單獨驗證。

## 校準清單

- 待確認：`component.progress` 沒有寬度 token 是否需要在真實產品情境（例如 Modal 內、Toolbar 內）補一個 `width-reference` 候選值——目前判斷為「由容器決定」已足夠，比照 text-input 的既有慣例。
- 待確認：indeterminate progress bar 的滑動週期（1.2s）與 spinner 旋轉週期（900ms）皆為候選節奏，未經產品／使用者長時間觀察驗證是否過快或過慢。
- 待確認：full-page loading 的「取消」是否需要一個對應的語意 token（例如 `component.spinner.cancel-foreground`）而不是直接沿用 `action-primary`——目前直接沿用，尚未有反例。
- 待確認（Search field）：清除按鈕目前只在候選稿畫出 16px 圖示本身，未定義獨立的可點擊熱區尺寸 token；HTML/CSS 畢業階段會用 `<button>` 搭配 padding 撐開熱區，但目前判斷不需要為此新增設計 token（沒有对應的視覺量測依據），留待有反例時再補。
- 待確認（Search field）：即時篩選（每次按鍵觸發）與需要送出鍵／debounce 的搜尋行為未定案，屬於互動節奏而非視覺規格，留待實際串接搜尋邏輯時再確認。

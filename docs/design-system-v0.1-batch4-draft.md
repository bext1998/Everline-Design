# Everline v0.1 設計系統草稿 — 第四批（issue #9–#12）

狀態：`candidate`（四類皆已畢業為 HTML/CSS 候選規格，但整體仍是草稿，未宣告 stable）

| 項目 | 內容 |
| --- | --- |
| 範圍 | Slider（#9）、Accordion（#10）、Popover（#11）、Date / Time picker（#12） |
| 視覺來源 | `works/everline-components-batch4.svg`（2026-07-30 人類審查通過，已成歷史快照，不再更新） |
| 候選規格權威來源 | `works/html/batch4/index.html`＋`styles.css`＋`prototype.js` |
| Token | `tokens/everline-draft.tokens.json` 的 `component.slider.*`、`component.accordion.*`、`component.popover.*`、`component.date-time-picker.*` |
| 審核狀態 | G1–G6 皆已通過（2026-07-30 人類驗收）。仍是 candidate／草稿，未宣告 stable。 |

本檔只記錄最終狀態與仍待決事項，過程中的修正細節留在 git 紀錄，不在此逐筆流水帳。

---

## 1. 通用決策

- **沒有新增任何顏色。** 四個群組的 color token 解析後只有 **6 個相異元件色**：`#333333`、`#4D4D4D`、`#598AE8`、`#666666`、`#F2F2F2`、`#FFFFFF`，外加三個既有透明度乘數（`opacity.hover-overlay` 0.06、`opacity.selected-overlay` 0.18、`opacity.disabled` 0.55）。型錄頁面另外用到 canvas `#1A1A1A` 與 border-default `#444444`，但那是型錄版面的底色與分隔線，不屬於這四個元件的規格。這個數字由 `works/html/batch4/verify.mjs` 每次執行時重新計算並斷言，不是人工清點。
- **浮動面板一律沿用 `color.semantic.background-overlay`**（gray-700 #4D4D4D），與 Select／Split button／Menu／Tooltip／Modal 同一語意。
  - 連帶限制：`color.semantic.foreground-subdued` 解析後同樣是 gray-700，在這些面板上會完全看不見。因此**浮動面板上的次要文字一律用 `gray-600`**，這不是新造值，而是 `component.menu.shortcut-foreground`／`disabled-foreground` 既有的做法。
- **不新增陰影 token。** 深色底上的浮動層次由 overlay 底色與 canvas 的對比表達，與 `opacity.dragging` 已記錄的低裝飾原則一致。
- **不使用未驗證的動效 token。** `motion.duration-base`／`easing-standard` 仍是 candidate，靜態 SVG 無從重新核對，依 `AGENTS.md`「candidate 值不得原封不動沿用」，batch 4 **完全沒有宣告任何 transition／animation**（已用 computed style 全頁掃描確認）。因此也不需要 `prefers-reduced-motion` 覆寫規則——沒有動效可關。

---

## 2. Slider（issue #9）

**用途**：在連續或離散範圍內調整數值。延伸 Progress bar 的軌道幾何與 Switch 的滑塊語彙，但維持獨立元件。

**適用**：音量、亮度、密度、價格區間、評分等有序且可比較的數值。
**不適用**：離散且無序的選項（用 Select／Radio）、精確數值輸入（用 Number input）、唯讀的進度顯示（用 Progress bar）。

**結構**：軌道（8px、pill）＋填色段＋thumb（24px 圓）。選配：值標籤、step 標記。

| 狀態／變體 | 表現 |
| --- | --- |
| default | 填色 = `action-primary`，thumb = off-white |
| focused／active | thumb 外圍 4px **實心**藍環（無間隙），外徑 32px |
| disabled | 填色轉 `background-subdued`；thumb 與文字套 `opacity.disabled`；軌道底色不變 |
| 範圍 | 兩個 thumb，填色段落在兩者之間 |
| step | 軌道下方 8px 處排列 4px 圓點標記 |
| 值標籤（候選變體） | thumb 上方 8px 的 40×24 圓角標籤 |

**互動與鍵盤**：單值為原生 `<input type="range">`；範圍為**兩個各自具可存取名稱、可獨立鍵盤操作**的 range 控制項，並強制 `lower ≤ upper`。方向鍵、Home／End、PageUp／PageDown、`step`、`min`／`max`、`disabled` 全部是瀏覽器原生語意，未自行實作。

**內容規則**：顯示值必須來自控制項本身；step 標記數量由 `(max − min) / step + 1` 計算產生，不得手動排列。

**無障礙**：`disabled` 用原生屬性；焦點不只靠色彩（4px 實心環可量測）；範圍的兩個控制項有各自的 `aria-label`。

**待決**：Slider 是本表唯一使用「實心焦點環」的元件，其餘元件仍是 batch 3 既有的 2px outline＋2px offset。理由是 24px 小圓控制點與 48px 大面積控制項觀感不同；**若審查認為必須全表一致，應回頭統一，不留兩套並行手法**。

---

## 3. Accordion（issue #10）

**用途**：在同一內容區塊內展開／收合相關章節。

**適用**：長表單分段、設定分類、FAQ。
**不適用**：主要導覽（用 Sidebar／Tabs）、同層平行切換（用 Tabs）、需同時比較的內容。

**結構**：語意標題內含 `<button>` trigger（48px 起、可因標題換行而增高）＋ disclosure chevron（16px）＋ panel。每項是獨立圓角列（`radius.sm`），項與項之間 4px 間距，**不使用分隔線**。

**狀態**：collapsed／expanded／hover（6% 白疊加）／focused（2px 內縮框）／disabled（背景不變，前景 0.55）。

**行為模式**：單開與多開**只是行為設定，不是兩套視覺 token**——兩者的高度、內距、圓角、間距、chevron 完全相同。

**互動與鍵盤**：Enter／Space 由原生 `<button>` 提供；焦點永遠留在被操作的 trigger 上，單開模式收合其他項時也不移動焦點。

**無障礙**：`aria-expanded` 與 panel 的可見性永遠一致；`aria-controls` 指向 panel `id`；panel 為 `role="region"` 並以 `aria-labelledby` 指回 trigger；disabled 用原生屬性（不可聚焦）。

**待決**：disabled 是否為 Accordion 的必要狀態（issue #10 未明確要求）。目前已實作；若確認不需要，應移除而非留成沒有規格支持的狀態。

---

## 4. Popover（issue #11）

**用途**：由 trigger 明確點擊開啟、相對 trigger 定位的**非模態**浮動面板。

**適用**：篩選條件、次要設定、需要互動控制項的補充內容。
**不適用**：純文字說明且由 hover 觸發（用 Tooltip）、需要阻斷主流程的決策（用 Modal）、長清單選取（用 Select／Menu）。

**與 Tooltip 的界線**：Tooltip 只承載純文字、不可互動、hover／focus 觸發；Popover 由點擊觸發，可含標題、互動控制項與關閉按鈕。兩者共用 `background-overlay`，但 radius 與內距不同，規格不可互相取代。

**結構**：面板（16px 圓角／16px 內距）＋箭頭（16×8px，與面板同色、無邊框）。選配：標題、關閉按鈕（32px 命中區／16px 圖示）、面板內動作按鈕（40px）。

**定位**：`top`／`right`／`bottom`／`left` 四向；trigger 邊到箭頭尖端 8px（面板邊因此距 trigger 16px）。
- **flip**：偏好側放不下且對側放得下時翻轉。
- **shift**：沿交叉軸夾在 viewport 內，箭頭仍指向 trigger 中心（但不侵入面板圓角）。
- **兩側都放不下**（面板比 trigger 任一側的空間都高）：選空間較大的一側，並把面板夾進 viewport；此時**容納優先於精確的 8px 錨點間距**。

**關閉方式（四種皆須成立）**：再按一次 trigger、Esc、面板外點擊（light-dismiss）、面板內關閉按鈕。任一方式關閉後焦點都回到 trigger。

**非模態**：不套用 backdrop、不做 focus trap，開啟時頁面其餘部分仍可操作。面板內沒有互動控制項時**不強制**把焦點移入。

**實作說明**：關閉契約直接使用原生 Popover API（`popover="auto"`），不自行攔截事件；JS 只負責定位與 flip／shift。這是框架中立的瀏覽器原型，不等於指定產品技術棧。

**待決**：`layer.overlay` 仍是 candidate，且與 Tooltip／Modal／Toast 的共存順序**未驗證**——本原型任一時刻只有一種 overlay，無法在此驗證。

---

## 5. Date / Time picker（issue #12）

**用途**：以 Text input＋Icon button 作為 trigger，開啟 Popover 內的日期、日期範圍與時間選擇介面。

**組合邊界**：trigger = `component.text-input` ＋ `component.icon-button`；面板 = `component.popover`。三者以 alias 重用，不複製其值，也不另造浮動面板。

**v0.1 不含**：農曆、多語系／多曆法、時區選擇器、週數、快速預設範圍、重複排程。

**結構**：月份標頭（40px，含上／下月 40px 命中區）→ 星期列（14px、gray-600）→ 6×7 的 40px 日期格（格間無間距）→ 時間欄位 → 取消／套用（兩者為上下兩列，非同一列）。面板寬 312px＝7×40＋2×16。

| 日期狀態 | 表現 |
| --- | --- |
| 已選／範圍端點 | 40px 實心圓（`action-primary` ＋ `foreground-inverse` 文字） |
| 範圍中段 | 每日各自 36px 淡色圓（`action-primary` × 0.18），圓間 4px，**不連成色帶** |
| 今天 | 2px 外圈，內部不填色，不與「已選」競爭 |
| 上／下月 | off-white × 0.55——比不可選更清楚，因為它**可點擊**並會跳月 |
| 不可選 | gray-600，`aria-disabled`（見下方無障礙） |

**值格式**：日期固定 `YYYY/MM/DD`。範圍 trigger 在起訖同年時省略年份（`MM/DD – MM/DD`），跨年則顯示完整格式；只選到起點時顯示 `MM/DD – 選擇結束日`。時間的**值**固定 24 小時制 `HH:MM`（HTML 規範保證），**顯示**由原生控制項依使用者地區決定（zh-TW 下為「上午／下午 hh:mm」）。

**互動與鍵盤**：月曆為 `role="grid"` ＋ roving tabindex。方向鍵＝前後一天／一週；Home／End＝該週首／末日；PageUp／PageDown＝上／下月；Enter／Space 選取；Esc 關閉並把焦點還給 trigger。面板開啟時焦點**會**移入月曆（互動型內容），與純文字 Popover 不同。

**內容一致性**：trigger 文字由與月曆同一份 state 推導，兩者結構上不可能不一致。範圍不完整時「套用」為**原生 disabled**，避免送出半個範圍。

**焦點樣式慣例**：獨立控制項（按鈕、range）用 `outline-offset: 2px` 外擴，列狀／格狀元素（Accordion trigger、日期格）用 `-2px` 內縮，文字欄位用 inset `box-shadow`——與 batch 3 既有做法一致。唯一例外是 Slider 的 4px 實心環，理由見 §2。

**無障礙**：不可選日期用 `aria-disabled` 而非 `disabled` 屬性——原生 disabled 的按鈕無法取得焦點，會讓 roving tabindex 在月曆中斷。這是本批唯一刻意不用原生 disabled 的地方，其餘控制項一律用原生屬性。

**刻意未實作**：日期欄位目前 `readonly`，值只能由月曆設定。自由輸入需要日期解析與「無效／不完整輸入」的視覺，而該視覺在 SVG 審查時已明確標記為「待決、不先預設」，因此不自行發明錯誤樣式。

---

## 6. Token 對照與缺口處理

畢業前已逐值盤點四個群組的每個尺寸、顏色、透明度、描邊與圓角。處理順序依 `AGENTS.md`：先 alias 既有共享 token，再建 `component.<name>.*` alias，最後才考慮新增全域值（本批**沒有**新增任何全域或語意層 token）。

### 直接 alias 既有 token（節錄，完整內容見 token 檔的 `$description`）

| 新 token | alias 目標 | 理由 |
| --- | --- | --- |
| `slider.track-height`／`track-color` | `component.progress.height`／`track-color` | 兩者共用同一條軌道，應同因變更 |
| `slider.thumb` | `component.switch.thumb` | 同一 thumb 角色 |
| `accordion.item-radius`／`item-gap` | `component.list-item.radius`／`row-gap` | 相鄰圓角列的既有語彙 |
| `popover.action-height` | `component.modal.action-height` | 面板內動作按鈕，非獨立控制項高度 |
| `popover.close-control-size` | `scale.component-heights.xs` | 32px 命中區，與 Breadcrumb 省略號同一決定 |
| `date-time-picker.range-background` | `component.list-item.background-selected` | 沿用既有淡色選取手法，不另立第二套 |
| `date-time-picker.unavailable-foreground` | `component.menu.disabled-foreground` | overlay 面板上停用文字的既有做法 |

### 新增的原始值（8 個，均已說明理由）

以下是四個群組裡**唯一**不是 alias 的葉節點，清單由程式從 token 檔實際掃描產生，非人工清點。

| Token | 值 | 為何不 alias |
| --- | --- | --- |
| `slider.focus-ring-width` | 4px | 是**填色環**不是描邊，故非 `border.width-focus`（2px）；雖與 `switch.thumb-inset`／`list-item.row-gap` 同為 4px，但那兩者是視覺內縮／間距，語意不同 |
| `slider.step-marker-size` | 4px | 同上理由。原本 alias `breadcrumb.ellipsis-dot-size`，PR 審查指出那只是碰巧同為 4px——麵包屑的點代表被摺疊的導覽項、slider 的點代表一個離散步進，不會有一起改的理由，已改為自有值 |
| `slider.value-label-height` | 24px | 盒高，非 icon box，不 alias `size.icon-md` |
| `slider.track-length-reference` | 320px | 型錄基準，產品寬度由容器決定 |
| `date-time-picker.panel-width` | 312px | 由 7×40＋2×16 推導而來，非自選值 |
| `date-time-picker.range-day-size` | 36px | 40px 格距下留 4px 間隙 |
| `date-time-picker.time-field-width` | 160px | 見下方偏差 |
| `date-time-picker.trigger-field-width` | 232px | 型錄基準，產品寬度由容器決定 |

本批另新增一個**全域** token `focus.ring-offset`（2px）。焦點環與元件之間的距離原本在 batch 2／3 的 CSS 裡就是重複出現的魔術數字；它跨所有可聚焦元件、語意明確，符合 `AGENTS.md` 對新增共用值的條件。方向是使用規則不是第二個值：獨立控制項向外、列狀／格狀元素取負值向內、文字欄位改用 inset `box-shadow` 因此不用 offset。它與 `border.width-focus`（2px）刻意分開——一個是環的粗細、一個是環的距離，兩者可以各自變動。既有 batch 2／3 的 CSS 仍寫死同一個 2px，遷移是獨立的機械變更。

`accordion.background-hover` 原本寫成字面值 `#ffffff`，PR 審查後改為 alias `color.base.white`。既有的 `menu`／`tabs`／`list-item`／`card`／`breadcrumb` 五個 hover token 仍寫著字面值，把它們一併掃成同一個 alias 是純機械性的獨立變更，刻意不併入本批。

### 與核准 SVG 的偏差（已於 G6 接受）

| 項目 | SVG | HTML | 原因 |
| --- | --- | --- | --- |
| 時間欄位寬 | 128px | **160px** | SVG 畫的是靜態字串「14:30」，128px 放得下；真實 `<input type="time">` 依地區顯示「上午 09:00」，實測需 104px 內容寬，加圖示 16＋間距 8＋內距 32 = 160px（仍在 8px 級距）。已同步修正 token；SVG 刻意不重畫。 |

### Token 檔驗證結果

- JSON 可解析，共 364 個 token；名稱無重複。
- 所有 `{...}` 引用皆存在且無循環。
- 與 `origin/main` 逐項比對：既有 token 的**解析值 0 變動**、0 移除。本批純新增 66 個 token 路徑。
- 未做模式切換驗證：專案目前沒有 light／dark 以外的模式定義，不宣稱已驗證。

---

## 7. 驗證紀錄

驗證以 Chrome 150 headless 執行。**互動測試透過 CDP 送出真實輸入事件**（`Input.dispatchKeyEvent`／`dispatchMouseEvent`）——合成 DOM 事件不是 trusted event，無法觸發瀏覽器原生的 popover Esc／light-dismiss，用合成事件測會得到毫無意義的通過。

### 如何重跑

```
node works/html/batch4/verify.mjs
CHROME="/path/to/chrome" node works/html/batch4/verify.mjs   # 自動偵測失敗時
```

只需要 Node 22+（全域 `WebSocket`／`fetch`）與一個 Chrome／Chromium。**沒有 package.json、沒有安裝步驟、沒有框架**——本倉庫沒有建置流程，驗證腳本也不該引入一個。腳本全數通過回傳 0，任一項失敗回傳 1。

### 自動化結果：118 / 118 通過

涵蓋：Slider 幾何與鍵盤（方向鍵／Home／End／PageDown／step／disabled／範圍不變條件）、Accordion 單開多開與 ARIA 一致性、Popover 四向定位與四種關閉路徑與焦點回復、flip 與 viewport 容納、Date picker 的月曆結構／鍵盤模型／選取邏輯／範圍一致性／套用與取消、icon-only 按鈕可存取名稱、裝飾圖示 `aria-hidden`；PR 審查後另加入**月底跨月夾值**（8/31、1/31、閏年 1/31、往前跨月，含真實 PageDown 的端到端路徑）與**焦點回到實際開啟者**（由欄位開啟 → Esc → 焦點回欄位；由按鈕開啟 → Esc → 焦點回按鈕）兩組回歸測試。

新增的回歸測試已反向驗證有效：把 `addMonths` 暫時還原成修正前的版本後，其中 6 項確實轉紅（含端到端那項），確認測試不是同義反覆。

### 關鍵尺寸實測

| 項目 | 期望 | 實測 |
| --- | --- | --- |
| Slider 軌道高 | 8px | 8px |
| Slider 填色（值 40／320px 軌道） | 128px | 128px |
| step 標記位置 | 0／64／128／192／256／320 | 完全一致，數量 6 |
| 值標籤底邊到 thumb 頂端 | 8px | 8px |
| Popover trigger 邊到面板邊 | 16px（8 錨點＋8 箭頭） | 四向皆 16px |
| Popover 箭頭尺寸／指向 | 16×8px、對準 trigger 中心 | 一致，偏移 0px |
| 月曆日期格 | 40×40px | 40×40px |
| 月曆面板寬 | 312px | 312px |

### RGB 採樣（含在上述 118 項內）

採樣點直接從真實截圖解碼（腳本內含一個約 60 行、只用 Node 內建 `zlib` 的最小 PNG 解碼器，不引入相依）。含 `action-primary` `(89,138,232)`、`background-overlay` `(77,77,77)`、範圍淡色 `(79,88,105)`（＝`action-primary` × 0.18 疊在面板色的理論混色值）、以及「今天」外圈內部維持面板色（確認只有環、沒有填色）。

### 響應式與動效

- 760px 與 420px 寬皆無水平捲動、無元素溢出。
- 日期面板在上述寬度與矮視窗下皆完整留在 viewport 內。
- 全頁 computed style 掃描：`animation-name` 與 `transition-duration` 皆為無——與「本批不使用未驗證動效 token」的宣告一致。

### 過程中被驗證抓到並修正的真實缺陷

1. 值標籤與 thumb 的間距 CSS 公式算錯，實測 4px（應 8px）。
2. 時間欄位與動作按鈕被擠在同一列，flex 壓縮導致原生時間值顯示被裁切；改回核准 SVG 的上下兩列。
3. viewport 太矮且 trigger 位於中央時，面板上下都放不下，原邏輯退回偏好側而溢出畫面；改為選空間較大一側並夾進 viewport。

### PR 審查（codex）另外抓到並修正的缺陷

1. **月底跨月溢位**：`addMonths` 直接用 `new Date(y, m+n, d)`，目標月較短時會滾到下個月——PageDown 從 8/31 會跳到 10/1，整個九月被跳過；1/31 更會跑到 3/3。已改為夾到目標月最後一天。新增的回歸測試呼叫**頁面上的真函式**（不是測試自己複製一份），並實際以舊版驗證過會紅 6 項。
2. **焦點回錯對象**：面板可由日期欄位或日曆按鈕開啟，但關閉時一律把焦點還給按鈕。已改為追蹤實際的 invoker。
3. **CSS 仍有未 token 化的字面值**：hover 疊加寫成 `rgb(255 255 255 / …)`，已改為由 `color.base.white` ＋ `opacity.hover-overlay` 推導的 `--everline-hover-overlay`。Accordion 400px 與 Popover 320px 其實只是型錄版面限制（元件本身寬度由容器／內容決定），已移出元件規則，改成型錄專用的 `.accordion-example .accordion` 與 `.popover--catalog-width`。
4. **文件與 token 敘述漂移**：原始值實際是 8 個而非 6 個（已改為程式掃描產生），`time-field-width` 的敘述仍寫著待人類確認（已改為 G6 已接受的事實）。

### 第二輪 PR 審查抓到並修正的項目

1. **CSS 契約自己沒守住**：`.button`／`.icon-button` 的 hover 還留著 `inset 0 0 0 999px` 的 box-shadow，而 999px 只是「大到蓋滿」的哨兵值，既不是設計值也不該 alias `radius.pill`。已改用疊一層 `linear-gradient` 的 `background-image`，完全不需要任何尺寸。focus offset 的 2px／-2px 也沒有對應 token，已新增 `focus.ring-offset` 並在 CSS 消費。
2. **顏色數量文案錯誤**：原文寫「8 個元件色」卻只列 7 個；實際四個群組解析後是 6 個相異色，canvas 與 border-default 屬型錄版面。已改為由驗證腳本每次重算並斷言。
3. **驗證無法重現**：原本的 harness 在 repo 外，宣稱的計數無從查核。已新增 `works/html/batch4/verify.mjs`（零相依、框架中立、可從 repo 直接重跑），並把文件裡的計數改為該腳本實際輸出的 118／118。腳本本身在開發過程中也抓出自己的 4 個測試缺陷（重複鍵偵測誤判、CSS 選擇器過濾漏掉型錄容器、Enter 未帶 text payload 因此沒觸發按鈕、顏色採樣受前面互動的狀態污染），皆已修正。
4. `batch4-plan.tmp.md` 檔尾多餘空白已移除。

---

## 8. 未完成與待確認

G6 驗收已於 2026-07-30 通過，時間欄位 128 → 160px 的偏差在該次驗收中一併被接受。以下項目**不影響本批驗收**，但仍未有結論，留待後續批次或專門討論處理：

- **跨元件焦點樣式不一致**：Slider 用 4px 實心環，其餘用 2px outline＋offset（見 §2）。
- **`layer.overlay` 未驗證**：多種 overlay 共存順序無法由本原型驗證（見 §4）。
- **Accordion 的 disabled 是否必要**（見 §3）；**Date picker 的無效輸入視覺**（見 §5）。
- **`works/everline-components-batch3.svg` 與 `docs/design-system-v0.1-batch3-draft.md` 仍寫著「#9–#12 追加到 batch3」**，與批次拆分的事實矛盾。此澄清屬 batch 4 計畫的階段 0，尚未執行，因為那兩個檔案在工作區另有他人的未提交變更。

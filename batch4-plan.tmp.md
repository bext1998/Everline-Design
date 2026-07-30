# Everline 第四批剩餘元件分階段實作計畫

狀態：`planning-only`（本文件只規劃，不代表任何元件、token、SVG 或 HTML/CSS 已實作或通過審查）

規劃日期：2026-07-30

範圍：

- Issue #9 Slider
- Issue #10 Accordion
- Issue #11 Popover
- Issue #12 Date / Time picker

## 1. 已確認事實與本輪決策

### 已確認事實

- GitHub issue #9～#12 於 2026-07-30 均為 `OPEN`。
- `docs/STATUS.md` 記錄第三批目前完成 4/8；已完成的 #5～#8 皆已畢業到 `works/html/batch3/`，但仍是 candidate／草稿，不是正式元件庫。
- `works/html/batch3/` 的既有流程是：SVG 靜態狀態經人類審查後，才以真實 DOM、原生互動狀態、ARIA 與 CSS custom properties 畢業為 HTML/CSS 候選規格。
- `tokens/everline-draft.tokens.json` 整體仍是 candidate；其中 `motion.*`、`layer.*` 及部分 component token 明確標記為 candidate／unverified，不能在畢業時未核對就直接沿用。
- `color.semantic.background-overlay` 已是 Select、Split button、Menu、Tooltip、Modal 的共用浮動面板背景語意；Popover 必須沿用。
- Issue #12 內文所稱「等 #7 Popover」是過期編號；正確相依是 issue #11 Popover。

### 本輪明確決策

- 依本次任務指示，剩餘四元件不再追加至 `works/everline-components-batch3.svg`，改建立：
  - `works/everline-components-batch4.svg`
  - `docs/design-system-v0.1-batch4-draft.md`
  - `works/html/batch4/`
- 現有 batch3 SVG metadata 與 batch3 規格草稿仍寫著「#9～#12 追加到 batch3」，執行 batch4 時必須做「事實澄清」型文件修改；不得改動已畢業的 #5～#8 SVG 元件群組。
- `docs/spec.md` 的 FROZEN Decisions 不受此次批次拆分影響，沒有預定修改。
- 仍維持框架中立的原生 HTML/CSS/JS 候選原型；不得把 batch4 寫成 React、Vue 或 Taylor Kanban 的實作。

## 2. 成功條件

每個元件只有在下列條件全部完成後，才可標記為「已畢業的 candidate」：

1. 在 `works/everline-components-batch4.svg` 有可追溯的 SVG 候選群組與狀態示例。
2. SVG 候選稿經人類視覺審查明確核准；未核准前不得撰寫該元件的 HTML/CSS。
3. `docs/design-system-v0.1-batch4-draft.md` 已記錄用途、適用／不適用情境、結構、狀態、變體、互動、內容規則、鍵盤操作、無障礙、token 關係、來源與審核狀態。
4. 已逐一列出審查通過 SVG 實際使用的尺寸與顏色，對照 `tokens/everline-draft.tokens.json`；缺口先修 token，才可開始 HTML/CSS。
5. `works/html/batch4/` 使用真實文字、原生 DOM／控制項、flex/grid、原生互動狀態與 ARIA；CSS custom properties 一對一對應既有 token 路徑。
6. 已 render SVG 與 HTML/CSS，完成關鍵尺寸量測、computed style、RGB 採樣、互動／鍵盤／ARIA 及內容一致性核對。
7. 人類完成最終驗收後，該元件的 SVG 群組才標記為歷史快照，並以 `works/html/batch4/index.html` 作為該元件的候選規格權威來源。

## 3. 相依順序與交付波次

```text
批次邊界澄清與 batch4 骨架
  ├─ #9 Slider（無跨元件硬相依）
  ├─ #10 Accordion（無跨元件硬相依）
  └─ #11 Popover
         └─ #12 Date / Time picker（硬相依：必須組合已畢業的 Popover）
```

建議實作順序：`#9 → #10 → #11 → #12`。

- #9 與 #10 技術上互不相依；依 issue 編號逐一完成可減少同一 SVG、token、規格與 HTML 檔案同時存在多個未審核區塊。
- #11 必須在 #12 之前完成全部流程，不只先畫外觀；#12 需要直接重用已通過 token 核對與互動驗證的 Popover。
- 每個 issue 採「完整走完一個元件，再進下一個」；不得先把四個 SVG 全畫完，再一次補規格、token 與 HTML。

## 4. 共用階段與人類審查閘門

| 階段 | 必做工作 | 人類審查閘門 | 未過關時 |
| --- | --- | --- | --- |
| 0. 批次對齊 | 建立 batch4 SVG 骨架；澄清 batch3 不再承載 #9～#12；建立來源／issue／狀態 metadata | G0：確認新批次邊界、四元件範圍與順序 | 不開始任何元件候選稿 |
| 1. SVG 候選稿 | 只畫當前元件；列出狀態、變體、原始尺寸／色值與校準候選；輸出 PNG 供檢視 | G1：核准視覺、狀態覆蓋、內容正確性、元件語彙與來源 | 只修改當前 SVG 群組；不得進規格／token／HTML |
| 2. 規格草稿 | 把已核准視覺轉成用途、邊界、結構、狀態、行為、鍵盤與無障礙契約 | G2：核准規格是否忠於 SVG 與 issue，並確認未擴張 v0.1 | 不進 token 完整性核對 |
| 3. Token 完整性核對 | 對 SVG 每個實際尺寸、顏色、透明度、描邊、radius、間距逐值盤點；先別名既有 token，再處理真實缺口 | G3：核准 token 對照表、候選新增／修正與相容性影響 | 不建立該元件 HTML/CSS；不得用 CSS 原始值繞過缺口 |
| 4. HTML/CSS 畢業 | 建立真實 DOM、原生狀態、ARIA、鍵盤與必要 JS；CSS custom properties 對應 token | G4：核准互動、焦點順序、關閉／切換行為、disabled 與 reduced-motion | SVG 群組維持 active candidate，不標記 superseded |
| 5. 像素級與內容驗證 | 同尺寸 render；量測幾何、computed style、RGB；驗證狀態內容與控制項值一致 | G5：最終人類驗收 | 記錄差異並回到最早造成差異的階段，不用更大範圍修法硬推 |
| 6. 收尾 | 把當前 SVG 群組標記為歷史快照；更新規格、STATUS 與來源追溯 | G6：確認狀態文字沒有把 candidate 寫成 stable | 不關閉 issue、不宣告完成 |

共同停止條件：

- 審查結果要求新增全域語意色、改變 FROZEN 8px 縮放規則、改公開資料格式或新增依賴時，停止並重新確認範圍。
- 同一修法兩次出現相同錯誤簽章時停止；不得擴大重構範圍。
- Illustrator 圖層／群組命名若需人工回填，只在規格中標為人工待辦，不由 agent 假裝完成。

## 5. 批次初始化與共用檔案

### 階段 0：批次邊界與骨架

新增：

- `works/everline-components-batch4.svg`

修改：

- `works/everline-components-batch3.svg`
  - 只修正檔案級 metadata／scope，將 #9～#12 指向 batch4。
  - 不修改已畢業的 `c-progress-spinner-loading`、`c-search-field`、`c-breadcrumb`、`c-number-input` 群組。
- `docs/design-system-v0.1-batch3-draft.md`
  - 將「其餘四元件追加到本檔」澄清為「第三批前四項已完成；剩餘四項依 2026-07-30 任務決策移到 batch4 文件」。
- `docs/STATUS.md`
  - 記錄 #9～#12 的執行批次與相依順序；此時仍維持「未開始／規劃中」，不可寫成 candidate。

G0 核准內容：

- batch4 SVG 是 batch3／batch2／master 的 sibling，不是 supersession。
- batch4 初始 metadata 清楚寫明 0/4、issue #9～#12、各群組 active／graduated 狀態與未來 `superseded-by` 規則。
- 批次拆分只改工作組織，不改 Everline 專案定位或 FROZEN Decisions。

## 6. Issue #9 Slider

### 6.1 範圍與狀態

用途：連續或離散範圍內調整數值；延伸 Switch 的軌道／滑塊視覺語彙，但保持為獨立元件。

SVG 候選至少涵蓋：

- 單值：default、focused／active、disabled。
- 範圍：雙 thumb、起點／終點、active thumb、disabled。
- Step：有離散步進與標記的示例；標記數量必須與 `min`／`max`／`step` 算出的可選值一致。
- 值標籤：只作候選變體；若畫出，文字必須與 thumb 實際位置／值一致。

HTML/CSS 候選行為：

- 單值優先使用原生 `<input type="range">`。
- 範圍使用兩個可存取名稱獨立的 range control，維持 lower ≤ upper；不能只畫兩個 thumb 卻沒有兩個可鍵盤操作的控制點。
- Arrow keys、Page Up／Page Down、Home／End、step、min／max 與 disabled 需實際驗證。
- 焦點不可只靠色彩；active／focused thumb 應有可量測的描邊或外圈。

### 6.2 階段、檔案與閘門

| 階段 | 新增／修改檔案 | 產物與閘門 |
| --- | --- | --- |
| SVG | 修改 `works/everline-components-batch4.svg`；新增／更新 `exports/everline-components-batch4.png` | 新增 `c-slider` 群組與校準表。G1 核准單值／範圍／step／disabled、thumb 對位與內容數值 |
| 規格 | 新增或修改 `docs/design-system-v0.1-batch4-draft.md` | 寫入 Slider 用途、邊界、結構、狀態、鍵盤、無障礙。G2 核准 |
| Token | 修改 `tokens/everline-draft.tokens.json`；修改 batch4 規格的 token 對照表 | 先逐值核對再新增／修正。G3 核准 token 差異與相容性 |
| HTML/CSS | 新增或修改 `works/html/batch4/index.html`、`works/html/batch4/styles.css`、`works/html/batch4/prototype.js` | 真實 range 控制項與 CSS custom properties。G4 核准鍵盤、雙 thumb、step、disabled、focus |
| 像素驗證 | 修改 `docs/design-system-v0.1-batch4-draft.md`（量測紀錄）；必要時更新 `exports/everline-components-batch4.png` | 量測 track／thumb／step／focus，採樣各狀態色。G5 核准 |
| 收尾 | 修改 batch4 SVG metadata、batch4 規格、`docs/STATUS.md` | `c-slider` 標記歷史快照、HTML 為該元件權威來源。G6 核准 |

### 6.3 既有 token 核對與預期缺口

優先核對／重用：

- `component.switch.radius`
- `component.switch.track-on`
- `component.switch.track-off`
- `component.switch.track-disabled`
- `component.switch.thumb`
- `component.switch.thumb-disabled`
- `color.semantic.action-primary`
- `color.semantic.background-surface`
- `color.semantic.background-subdued`
- `color.semantic.border-focus`
- `color.semantic.foreground-disabled`
- `border.width-focus`
- `opacity.disabled`
- `space.1`、`scale.step`、`radius.pill`

SVG 審查後才可決定的缺口：

- `component.slider.track-height`
- `component.slider.thumb-size`
- `component.slider.track-length-reference`（只有審查確認需要固定型錄基準寬度時才新增；產品寬度仍由容器決定）
- `component.slider.step-marker-size`、`step-marker-gap` 或等效幾何 token
- `component.slider.focus-ring-width`／`focus-ring-color`（若可直接 alias `border.width-focus`／`border-focus`，不得另造值）
- 範圍 fill 與 disabled 的 component alias；顏色應先嘗試 alias既有 action／surface／disabled 語意，不新增新色。
- 值標籤的間距／radius 只在 SVG 確實畫出且有重用意義時新增；否則維持內容層配置，不建立投機 token。

## 7. Issue #10 Accordion

### 7.1 範圍與狀態

用途：在同一內容區塊內展開／收合相關章節。

SVG 候選至少涵蓋：

- collapsed、expanded。
- 單開模式：展開一項時收合其他項。
- 多開模式：多項可同時 expanded。
- trigger hover／focused 與 disabled（若 issue 審查確認 disabled 是必要狀態）。
- 長標題、兩行內容與末項邊界，避免只驗證短字串。

HTML/CSS 候選行為：

- 使用語意標題＋`<button>` trigger，透過 `aria-expanded`、`aria-controls` 與 panel `id` 關聯。
- Enter／Space 切換；焦點留在 trigger；單開模式只改展開狀態，不任意移動焦點。
- 單開／多開是行為模式，不應為兩套視覺 token。
- 若有開闔動畫，必須尊重 reduced-motion；候選 `motion.duration-base`／`easing-standard` 需在 G3 重新核對，不直接視為已核准。

### 7.2 階段、檔案與閘門

| 階段 | 新增／修改檔案 | 產物與閘門 |
| --- | --- | --- |
| SVG | 修改 batch4 SVG；更新 `exports/everline-components-batch4.png` | 新增 `c-accordion`。G1 核准 collapsed／expanded、單開／多開、focus 與內容密度 |
| 規格 | 修改 batch4 規格草稿 | 記錄用途／不適用、結構、行為模式、鍵盤、內容與無障礙。G2 核准 |
| Token | 修改 token JSON 與 batch4 token 對照表 | 核對所有 row／panel 幾何與顏色。G3 核准 |
| HTML/CSS | 修改 batch4 `index.html`、`styles.css`、`prototype.js` | 實作單開／多開真實狀態與 ARIA 同步。G4 核准 |
| 像素驗證 | 修改 batch4 規格量測紀錄；必要時更新 SVG PNG | 量測 trigger／panel／divider／icon；驗證 ARIA 與可見狀態同步。G5 核准 |
| 收尾 | 修改 batch4 SVG metadata、batch4 規格、`docs/STATUS.md` | `c-accordion` 歷史化，HTML 成為權威來源。G6 核准 |

### 7.3 既有 token 核對與預期缺口

優先核對／重用：

- `color.semantic.background-surface`
- `color.semantic.foreground-primary`
- `color.semantic.foreground-subdued`
- `color.semantic.border-default`
- `color.semantic.border-focus`
- `color.semantic.action-primary`
- `opacity.hover-overlay`
- `opacity.disabled`
- `border.width-default`、`border.width-focus`
- `space.1`、`space.2`、`space.3`
- `radius.sm`、`radius.lg`
- `size.icon-sm`、`size.icon-md`
- `font.size-body`、`font.weight-semibold`
- `motion.duration-base`、`motion.easing-standard`（均需重新核對 candidate／unverified 狀態）

SVG 審查後才可決定的缺口：

- `component.accordion.trigger-min-height`
- `component.accordion.padding-inline`、`padding-block`
- `component.accordion.content-padding`
- `component.accordion.item-gap` 或 `divider-width`（依核准視覺二選一，不同時建立兩套）
- `component.accordion.disclosure-icon-size`
- 背景、前景、divider、hover、focus 的 component alias；若只是既有語意值的直接使用，是否建立 alias 由「跨多處重用／同因變更」判斷。
- 單開／多開不新增 token；它是互動設定。

## 8. Issue #11 Popover

### 8.1 範圍與狀態

用途：由 trigger 開啟、相對 trigger 定位的非模態浮動內容面板；沿用既有 overlay 視覺語彙。

SVG 候選至少涵蓋：

- 上、右、下、左四個基礎 placement；至少示意一個空間不足時的翻轉／位移結果。
- 箭頭指向 trigger，箭頭填色與面板一致；若有邊框，箭頭邊界也需一致。
- 有標題／內容／明確關閉按鈕的範例，以及可 light-dismiss 的簡單內容範例。
- opened、focused-trigger、close-control-focused；關閉後焦點回到 trigger。

HTML/CSS 候選行為：

- 優先評估原生 Popover API 是否能在目前 headless Chrome 驗證所需的 Esc、light-dismiss 與 focus 行為；若採用，規格需寫明只是框架中立瀏覽器原型，不等於指定產品技術棧。
- 關閉方式至少驗證：trigger toggle、Esc、外部點擊／light-dismiss、面板內關閉按鈕。
- 驗證 top／right／bottom／left、箭頭方向、viewport 邊界碰撞與必要 flip／shift。
- Popover 為非模態；不得套用 Modal backdrop 或 focus trap。互動內容的初始焦點策略由內容型態決定，不一律強迫移入。

### 8.2 階段、檔案與閘門

| 階段 | 新增／修改檔案 | 產物與閘門 |
| --- | --- | --- |
| SVG | 修改 batch4 SVG；更新 `exports/everline-components-batch4.png` | 新增 `c-popover`。G1 核准 overlay 色、placement、箭頭、關閉方式與非模態邊界 |
| 規格 | 修改 batch4 規格草稿 | 記錄 positioning、flip／shift、focus return、light-dismiss、Esc 與不適用情境。G2 核准 |
| Token | 修改 token JSON 與 batch4 token 對照表 | 重驗 `background-overlay`、`layer.overlay`、motion candidate 與箭頭幾何。G3 核准 |
| HTML/CSS | 修改 batch4 `index.html`、`styles.css`、`prototype.js` | 實作可操作 Popover、四向定位與關閉路徑。G4 核准 |
| 像素驗證 | 修改 batch4 規格量測紀錄；必要時更新 SVG PNG | 採樣面板／箭頭 RGB，量測間距／radius／border，驗證各關閉路徑與焦點回復。G5 核准 |
| 收尾 | 修改 batch4 SVG metadata、batch4 規格、`docs/STATUS.md` | `c-popover` 歷史化；記錄 #12 可開始。G6 核准 |

### 8.3 既有 token 核對與預期缺口

優先核對／重用：

- `color.semantic.background-overlay`（硬性沿用）
- `color.semantic.foreground-primary`
- `color.semantic.foreground-subdued`
- `color.semantic.border-default`
- `color.semantic.border-focus`
- `opacity.hover-overlay`
- `border.width-default`、`border.width-focus`
- `radius.lg`
- `space.1`、`space.2`、`space.3`
- `size.icon-sm`、`size.icon-md`
- `component.icon-button.*`（關閉按鈕）
- `component.button.*`（面板內動作）
- `component.tooltip.background`／`radius`（只作交叉檢查，不把 Tooltip 規格直接當成 Popover）
- `layer.overlay`（candidate，需驗證與 Tooltip／Modal／Toast 的共存順序）
- `motion.duration-base`、`motion.easing-standard`、`motion.reduced-motion-rule`（candidate／unverified，需 G3 重驗）

SVG 審查後才可決定的缺口：

- `component.popover.radius`、`padding`、`border-width`、`background`、`foreground` 等 component alias。
- `component.popover.min-width`／`max-width` 或 `width-reference`；只有核准視覺證明需要時才新增，不把型錄寬度誤當產品固定寬度。
- `component.popover.anchor-gap`
- `component.popover.arrow-size`
- `component.popover.arrow-offset`
- `component.popover.close-control-size`（若可 alias `component.icon-button.size` 或既有 icon size，不新增原始值）
- 定位、flip、shift、light-dismiss、Esc 與 focus return 是行為規格，不是 design token。
- 不新增陰影 token，除非 SVG 人類審查明確核准陰影為必要深度語彙；目前 Everline 的浮動面板已有 overlay 色與 border，可先沿用。

## 9. Issue #12 Date / Time picker

### 9.1 開始條件

只有 issue #11 Popover 通過 G6，且下列項目可直接重用時，才開始 #12：

- Popover 面板背景、radius、border、padding 與 layer 已通過 token 核對。
- placement、viewport flip／shift、Esc、light-dismiss、關閉按鈕與焦點回復已在 HTML/CSS 實際驗證。
- `works/html/batch4/` 已有可組合的 Popover 原型，而不是只存在 SVG 外觀。

若 #11 未達成，#12 回覆 `BLOCKED`，不得複製一份臨時浮動面板邏輯繞過相依。

### 9.2 範圍與狀態

用途：以 Text input＋Button 作為 trigger／輸入區，開啟 Popover 內的日期、日期範圍與時間選擇介面。

v0.1 包含：

- 單一日期選取。
- 日期範圍選取：start、in-range、end，以及只選到起點的暫態。
- 時間輸入：以可存取名稱明確的輸入控制項呈現，與日期值同步。
- 預設、opened、focused、selected、disabled、無效／不完整輸入的行為契約；是否加入獨立 danger 視覺須由 SVG／規格審查決定，不先預設。
- 月切換、前／後月日期、今天、不可選日期，以及確認／取消或套用方式。

v0.1 明確不含：

- 農曆。
- 多語系／多曆法。
- 時區選擇器。
- 週數、快速預設範圍、重複排程等進階能力。

HTML/CSS 候選行為：

- 組合已畢業的 Popover、Text input、Button／Icon button，不複製其 token。
- 月曆使用可理解的 grid 結構與 roving tabindex 或等效鍵盤模型；至少驗證 Arrow keys、Home／End、Page Up／Page Down、Enter／Space、Esc。
- 日期範圍的開始／結束與視覺區段必須和實際輸入值一致；不可只畫連續藍色區帶卻讓 start/end 文案不一致。
- 時間欄位使用原生可驗證的輸入語意；格式先固定為 v0.1 範例格式並在規格說明，不宣稱已支援多語系。

### 9.3 階段、檔案與閘門

| 階段 | 新增／修改檔案 | 產物與閘門 |
| --- | --- | --- |
| SVG | 修改 batch4 SVG；更新 `exports/everline-components-batch4.png` | 新增 `c-date-time-picker`，清楚標註組合來源。G1 核准單日／範圍／時間、月切換、disabled 與內容一致性 |
| 規格 | 修改 batch4 規格草稿 | 記錄組合邊界、值格式、鍵盤模型、日期範圍狀態、v0.1 非目標。G2 核准 |
| Token | 修改 token JSON 與 batch4 token 對照表 | 先 alias Popover／Text input／Button，再處理 calendar 專屬真實缺口。G3 核准 |
| HTML/CSS | 修改 batch4 `index.html`、`styles.css`、`prototype.js` | 實作真實日期／範圍／時間互動與 ARIA。G4 核准 |
| 像素驗證 | 修改 batch4 規格量測紀錄；必要時更新 SVG PNG | 量測 panel／cell／range／input／button；核對 RGB、值、ARIA 與顯示內容。G5 核准 |
| 收尾 | 修改 batch4 SVG metadata、batch4 規格、`docs/STATUS.md` | `c-date-time-picker` 歷史化；batch4 標記 4/4 已畢業 candidate。G6 核准 |

### 9.4 既有 token 核對與預期缺口

優先核對／重用：

- 完整 `component.popover.*`（以 #11 最終核准結果為準）
- `component.text-input.*`
- `component.button.*`
- `component.icon-button.*`
- `component.select.*`、`component.menu.*`（只在月／年選擇行為確實採相同語彙時重用）
- `color.semantic.background-overlay`
- `color.semantic.background-surface`
- `color.semantic.foreground-primary`
- `color.semantic.foreground-subdued`
- `color.semantic.foreground-disabled`
- `color.semantic.action-primary`
- `color.semantic.action-danger`（只有經核准的錯誤狀態才用）
- `color.semantic.border-default`、`color.semantic.border-focus`
- `opacity.disabled`、`opacity.hover-overlay`、`opacity.selected-overlay`
- `border.width-default`、`border.width-focus`
- `space.1`～`space.4`
- `radius.sm`、`radius.lg`、`radius.control`
- `size.icon-sm`、`size.icon-md`、`size.control-md`
- `font.size-label`、`font.size-body`、`font.weight-semibold`

SVG 審查後才可決定的缺口：

- `component.date-time-picker.panel-width-reference`（若 Popover 寬度不足以表達月曆基準）
- `component.date-time-picker.calendar-cell-size`
- `component.date-time-picker.calendar-row-gap`、`calendar-column-gap`
- `component.date-time-picker.header-height`／`header-gap`
- `component.date-time-picker.day-radius`
- `component.date-time-picker.day-selected-background`／`foreground`
- `component.date-time-picker.range-background`（先驗證 `action-primary` + `opacity.selected-overlay` 是否足夠）
- `component.date-time-picker.today-indicator-*`
- `component.date-time-picker.outside-month-foreground`、`disabled-foreground`（優先 alias現有 subdued／disabled）
- `component.date-time-picker.time-field-width` 或 layout gap（只有審核後有實際量測才新增）
- 月曆選取演算法、日期解析／格式化、range 不變條件、焦點移動與 Popover 關閉策略是行為規格，不是 token。

## 10. Token 完整性核對程序

每個元件於 G2 後、HTML/CSS 前，執行同一份逐值程序：

1. 從已核准 SVG 群組列出：
   - 所有 `width`、`height`、`x/y` 間距、`rx/ry`、圓半徑、stroke width、icon box、文字字級／字重。
   - 所有 fill、stroke、opacity 與 focus／hover／selected／disabled 混色。
2. 將每個值對照到 token 路徑與解析後最終值，不能只比對 alias 名稱。
3. 對 candidate／unverified token 重新以核准 SVG 實測值判斷：
   - 一致：保留並在 batch4 規格記錄已重新核對。
   - 不一致：先修 token 或修正 SVG；由 G3 決定哪一方才是核准事實。
4. 缺口處理順序：
   - 既有共享 token alias。
   - 新增 `component.<name>.*` alias。
   - 只有跨元件且語意明確時才新增全域／semantic token。
5. 更新 token 後先驗證：
   - JSON 可解析。
   - token 名稱唯一。
   - 所有 `{...}` 引用存在且無循環。
   - light／dark 或其他模式若不存在，不得在文件假稱已驗證模式切換。
   - 既有 batch1～batch3 alias 的解析值未被意外改變；若會改變，列為破壞性影響並停止 G3。
6. 只有 G3 簽核後，才把核准 token 映射成 `--everline-*` CSS custom properties；CSS 內不得用未記錄的顏色或尺寸原始值。

## 11. HTML/CSS 共用驗證矩陣

### 視覺與像素

- 以相同 viewport、device scale factor 與字型 render SVG 參考與 HTML/CSS。
- 量測每元件的外框、主要子元素、間距、radius、stroke、icon box 與文字基線。
- 用 computed style 取得 CSS 實際值，不能只讀 source declarations。
- 對背景、前景、border、focus、selected、disabled、箭頭與 range fill 做 RGB 採樣。
- 混色需把底色與 opacity 一併計算，允許的 1 RGB 誤差必須在紀錄中說明來源；幾何尺寸不接受未說明的像素誤差。
- `exports/everline-components-batch4.png` 是 SVG 人類審查參考；HTML 驗證截圖可留在驗證工具的暫存目錄，量測結果與差異結論寫入 batch4 規格，不因驗證而新增不必要的永久截圖。

### 互動與內容一致性

- Slider：顯示值、thumb 位置、step marker 數量、min／max／step 與 ARIA 值一致。
- Accordion：可見 panel、`aria-expanded`、單開／多開規則一致。
- Popover：placement、箭頭方向、開啟狀態、Esc／light-dismiss／關閉按鈕與焦點回復一致。
- Date / Time picker：欄位文字、已選日期、range start/end、中間日期、時間值與 ARIA 狀態一致。

### 無障礙與響應式

- 完整鍵盤走查與 focus-visible 截圖。
- 原生 disabled 不得只以 class 模擬。
- reduced-motion 下不得保留不必要的持續動畫或讓 JS 持續改變 ARIA 值。
- 至少驗證桌面型錄寬度與 760px 以下版面；Popover／Date picker 另驗證 viewport 邊緣與內容不被裁切。
- 所有 icon-only button 具有可存取名稱；裝飾圖示 `aria-hidden="true"`。

## 12. 全批次檔案路徑總表

### 新增

- `works/everline-components-batch4.svg`
- `exports/everline-components-batch4.png`
- `docs/design-system-v0.1-batch4-draft.md`
- `works/html/batch4/index.html`
- `works/html/batch4/styles.css`
- `works/html/batch4/prototype.js`

### 依階段修改

- `tokens/everline-draft.tokens.json`
- `docs/STATUS.md`
- `works/everline-components-batch3.svg`（只修 metadata／scope）
- `docs/design-system-v0.1-batch3-draft.md`（只澄清 batch 邊界）
- `works/everline-components-batch4.svg`
- `exports/everline-components-batch4.png`
- `docs/design-system-v0.1-batch4-draft.md`
- `works/html/batch4/index.html`
- `works/html/batch4/styles.css`
- `works/html/batch4/prototype.js`

### 明確不修改

- `docs/spec.md`：此次不改專案定位、資料夾責任或 FROZEN Decisions。
- `works/html/batch3/`：batch4 只把它當流程範例，不回頭修改已畢業的 #5～#8。
- `works/everline-components-master.svg`、`works/everline-components-batch2.svg`：與本批無直接關係。
- Taylor Kanban 或任何產品 repo：尚未驗證技術棧，且不在本任務範圍。

## 13. 最終收尾與 issue 狀態

- 每完成一個元件 G6，就更新 `docs/STATUS.md` 的累計數量與該元件候選權威來源。
- batch4 完成 4/4 後：
  - batch4 SVG metadata 應標記四個元件群組皆為歷史快照。
  - batch4 規格應標記 HTML/CSS 為候選規格權威來源。
  - `docs/STATUS.md` 應寫明三／四批合計候選數量，但仍維持 candidate／草稿，不宣稱正式 stable。
- 關閉或留言 GitHub issue 是外部寫入，不包含在本計畫文件的自動執行授權內；未來若要操作，應在 G6 後另行確認。

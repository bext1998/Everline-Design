# Everline v0.1 設計系統草稿

狀態：`candidate`  
建立日期：2026-07-16（2026-07-19 更新：新增總表候選稿與 6 個第一批新元件）  
來源：`works/everline_p1.svg`、`works/everline_p1.pdf`（2026-07-19 起，原 `works/72ppi/` 子資料夾已攤平併入 `works/`）  
候選向量稿：`works/everline-components-master.svg`（目前持續維護的完整候選視覺來源，涵蓋既有元件與第一批新元件）  
歷史候選稿：`works/everline-agent-components-v0.1.svg`（已由總表取代，僅保留為歷史快照，不再更新）

本文件是受控延伸用的校準稿，不是穩定版規格。已觀察到的值與本次推導值分開記錄；使用者確認前，不應將候選內容視為 Everline 的凍結決策。

## 已確認規則

- 元件放大與縮小一律以 8 px 為尺寸級距，並維持內部元素的相對比例。
- 建議元件高度序列為 `32 / 40 / 48 / 56 / 64 px`；新增尺寸不得插入任意中間值。
- 膠囊半徑可由元件高度的一半推導；1 px／2 px 描邊屬光學邊界，不當作元件縮放級距。若縮放後需要不同描邊，必須另行視覺驗證。
- Everline v0.1 僅定義深色（dark）介面；淺色（light）主題不在本階段範圍內。若未來需要淺色主題，須另立規格與獨立 token 對照表，不假設現有語意 token 可直接反轉沿用。

## 設計原則候選

- 深色工作介面：畫布以接近黑色的背景承載高頻工具，元件表面使用灰階建立層次。
- 狀態優先：藍色固定表示主要操作、選取或焦點；紅色固定表示危險操作，不以裝飾用途濫用。
- 圓潤但不柔弱：主要操作使用膠囊外形；較大資訊容器使用 16 px 圓角，保留工具介面的清晰邊界。
- 低裝飾：以純色、描邊、間距及文字層級表達狀態，不先引入陰影或複雜漸層。
- 漸進定稿：新元件先標記為 candidate，經視覺校準及產品情境驗證後才能升格。
- 處處是圓（2026-07-19 新增，使用者確認）：Everline 的視覺識別建立在「所有元素皆為圓角或圓形」，沒有直角硬邊。容器內若有多個子項目（例如清單、看板欄位），子項目之間應各自保留圓角並以間距區隔，不得使用貼合的直角分隔列排成表格式版面；表格式、直角貼合的排版不屬於 Everline 語言，即使結構上合理也需重新以圓角卡片／間距呈現。

## Token 分類與來源

可解析的候選值位於 `tokens/everline-draft.tokens.json`。格式採框架中立的 Design Tokens Community Group 草案結構；Taylor Kanban 技術棧尚未驗證，因此目前不產生 CSS variables 或框架專用輸出。

### 已觀察值

| 類別 | 值 | 觀察依據 |
| --- | --- | --- |
| 畫布 | `#1A1A1A` | SVG artboard 背景 |
| 中性表面 | `#333333`、`#444444`、`#4D4D4D`、`#666666` | 按鈕、輸入框、色票及停用狀態 |
| 主要色 | `#598AE8` | primary、selected、focused |
| 危險色 | `#C1272D` | danger button 與 switch |
| 淺色前景 | `#FFFFFF`、`#F2F2F2` | 文字與 switch thumb |
| 標準控制高度 | `48 px` | button 與 switch |
| 標準控制圓角 | `24 px` | 48 px 高膠囊控制 |
| focus 描邊 | `2 px` | outline button 與 focused input |

### 推導候選值

- 8 px 基準間距階梯：`8 / 16 / 24 / 32 / 40 / 48 px`。
- 大型資訊容器圓角：`16 px`。
- compact tag 高度：`40 px`。
- UI 字型為 `Noto Sans TC, system-ui, sans-serif`。來源 SVG 的文字已轉外框，agent 端原本無法從檔案驗證原始字型；2026-07-19 由使用者直接確認實際使用 Noto Sans TC，已從候選值改為確認值。

## Token 命名慣例

2026-07-19 新增。隨著元件數量增加（目前已 14 個元件的 token 區塊），需要一個明確命名慣例，避免後續元件各自發明命名方式：

- **全域 primitive**：`color.base.*`、`space.*`、`radius.*`、`size.*` 等，只放「觀察值」或不帶語意的基礎數值，不直接在元件中引用。
- **語意層**：`color.semantic.*`，命名採 `{目的}-{強調層級}`，例如 `background-surface`、`foreground-disabled`、`action-danger`、`border-focus`。元件應優先引用語意層，只有語意層無法表達時才直接引用 base primitive。
- **元件層**：`component.{元件名}.{屬性}[-{變體}]`，屬性命名需重用語意層已有的字根（`background-*`、`foreground-*`、`border-*`），避免同一概念在不同元件出現不同詞序或用字（例如應統一用 `menu-background`，不要有的元件寫成 `background-menu`）。
- **不透明度獨立於顏色**：透明度一律另立 `opacity.*` 類別（例如 `opacity.disabled`），不烘進 8 位元 hex alpha 顏色值——原因見 `tokens/everline-draft.tokens.json` 中 `opacity.disabled` 的 `$description`（Illustrator 對 `#RRGGBBAA` 支援不穩定，2026-07-19 已實際踩雷過一次）。
- 新增 token 前，先檢查語意層或既有元件 token 是否已可表達，不要為了「看起來更精確」而重新宣告一個數值相同但命名不同的 token。

## 圖示系統

2026-07-19 新增。目前所有元件內的圖示（打勾、chevron、驚嘆號、放大鏡、勾選圖示等）都是手繪 SVG path，尚未對接正式圖示庫，且從未被系統性定義過，僅在各元件小節零星提及「24 px 圖示」。以下把散落的慣例收斂成一致規則：

- **圖示網格**：一般情境 24 px（`size.icon-md`）；緊湊情境（如 badge 前導圖示、小型狀態指示）16 px（`size.icon-sm`）。
- **線寬**：候選 `2px`（`tokens` 新增 `icon.stroke-width`），沿用目前手繪圖示已一致使用的 stroke-width。
- **對齊**：圖示在容器內採光學置中，不是純幾何置中（沿用 Icon button 既有規則，推廣為全域圖示規則）。
- **狀態色**：圖示不單獨定義色彩系統，繼承所在元件當下的語意色（例如 disabled 元件內的圖示套用該元件的 `foreground-disabled` + `opacity.disabled`）。
- **來源庫（新約束，使用者 2026-07-19 指定）**：正式導入圖示資產時，依實作情境選擇來源，兩者本質上都是 Lucide 圖示家族，差別只在技術情境：
  - 若元件是以 **shadcn/ui** 組成（例如透過 shadcn/ui 的 Button／DropdownMenu／Dialog 等 recipe），直接使用該元件套件內建整合的圖示（即 `lucide-react`），不額外混用其他來源，以維持 shadcn/ui 元件內部一致性。
  - 若情境不使用 shadcn/ui（例如純向量稿設計階段、非 React 實作、或需要 Illustrator 可編輯的圖示），直接取用 `docs/lucide-icons/` 圖示資產。
  - 此約束不代表已確認 Taylor Kanban 或任一延伸產品的技術棧；只是 Everline 自己的圖示來源慣例，供未來任一採用者參考。
- 比照 AGENTS.md 既有規則重申：第三方圖示庫（含 Lucide／shadcn）只作原型與參考，Everline 仍需維持自己的尺寸、線寬、對齊、狀態與命名規則，不因使用現成圖示庫而省略系統規範。
- **待辦**：本文件目前所有元件內的手繪圖示都是暫時佔位，尚未替換為正式 Lucide／shadcn 圖示資產；替換時需保留來源、版本與授權紀錄（已封存版本 1.24.0）。
- **注意（2026-07-19）**：`docs/lucide-icons/`、`docs/lucide-icons.zip`、`docs/lucide-font.zip` 已改為 `.gitignore` 排除的本機參考快取，不保證隨 repo clone 提供；若在其他環境找不到這些檔案，需自行從 Lucide 上游重新下載版本 1.24.0（或後續版本，並更新此處版本紀錄）。

## 堆疊順序（Layer）候選

2026-07-19 新增。Everline 目前已有 5 類會脫離正常文件流、彼此可能同時存在的浮動元件：Select／Split button 的展開面板、Menu、Tooltip、Modal（含 backdrop）、Toast。目前沒有任何規則定義它們同時出現時的疊放順序（例如：Modal 開啟中彈出一個確認 Toast，何者在上？Tooltip 出現在已開啟的 Menu 項目上，是否能正確蓋在 Menu 之上？）。`tokens/everline-draft.tokens.json` 新增 `layer.*` 候選數值：

| Layer | 候選值 | 說明 |
| --- | --- | --- |
| `overlay` | 100 | Select／Split button／Menu 的展開面板 |
| `tooltip` | 200 | 高於 overlay，因為 tooltip 可能出現在已開啟選單的項目上 |
| `modal-backdrop` | 300 | |
| `modal` | 310 | 僅高於自身 backdrop |
| `toast` | 400 | 慣例上置頂，讓「已刪除」等關鍵回饋在 Modal 開啟／關閉中仍可見 |

這組順序是常見慣例推論，不是已驗證的產品決策；尤其 `toast` 是否真的該蓋過開啟中的 `modal`，需要依 Everline／Taylor Kanban 實際互動情境確認。

## 動效（Motion）候選

2026-07-19 新增。Split button（來源 SVG 本身標註「需要動畫轉場特效」）、Modal（開闔動畫）、Tooltip（顯示／消失時機）皆已在規格文字中提到動畫，但過去沒有任何 token 支撐這些敘述。`tokens/everline-draft.tokens.json` 新增 `motion.*` 候選數值：`duration-fast`（120ms，hover／pressed 微互動）、`duration-base`（200ms，開合轉場）、`duration-slow`（320ms，保留給較大版面變化，目前尚無元件使用）、`easing-standard`（候選 ease-out 曲線）。

- 所有開合／進出場動畫必須尊重 `prefers-reduced-motion`：使用者開啟減少動態偏好時，改為直接顯示／隱藏，不得延遲鍵盤操作（原本只在 Split button 提過，本次推廣為全域規則）。
- 以上數值皆為候選，未經視覺驗證，定稿前不得由實作者自行套用為正式規格。

## 原始元件量測

以下數值直接取自 `works/everline_p1.svg`，屬於已查證的來源事實。帶小數或不符合系統級距的畫板尺寸只保留為追溯證據，不會全部轉成產品 token。

| 元件 | SVG 實測 | 系統化處理 |
| --- | --- | --- |
| Button | 128 × 48 px，radius 24 px | 48 px 高度與 radius 24 px 成為 token；寬度依內容延伸，128 px 只作參考 |
| Icon button | 48 × 48 px，圓形 | 固定為 48 px control size |
| Switch | 96 × 48 px，thumb 40 px | 保留為正式候選 token；縮放以 8 px 級距建立另一尺寸，不任意拉伸 |
| Checkbox | 32 × 32 px，radius 8 px，indicator 20 px | 保留為 control token；外層命中區補至 48 × 48 px |
| Radio | 32 × 32 px，indicator 20 px | 保留為 control token；外層命中區補至 48 × 48 px |
| Split button | 180 × 48 px | 180 px 是來源基準；放大縮小從此基準以 8 px 增減，disclosure 區規範為 48 px |
| Open dropdown panel | 來源灰色面板 180 × 126 px | 高度改由 48 px row 與內容數量計算，不保存 126 px 偶然值 |
| Single-line input | 約 361.47 × 48 px，radius 24 px | 寬度由版面容器決定；只保存高度、內距、圓角與狀態 token |
| Textarea | 256 × 128 px、256 × 256 px，radius 24 px | 兩個來源高度可作 size candidate；寬度仍允許容器控制 |
| Scrollbar | 10 × 85 px，radius 5 px | 視為光學細節，先保留來源值並標記待實作驗證 |

## 原始元件狀態盤點

| 元件 | 已畫出 | 規格需要但尚未畫出 |
| --- | --- | --- |
| Button | primary、neutral、disabled、danger、outline | hover、pressed、focused、loading |
| Icon button | primary、neutral、disabled、danger、outline（2026-07-19 補上） | hover、pressed、focused、selected、tooltip |
| Switch | on、off、disabled、danger-on | focused、loading、error feedback |
| Checkbox | unchecked、checked、indeterminate、disabled | focused、error group |
| Radio | unchecked、checked、disabled | focused、error group |
| Split button／Dropdown | closed、open | hover item、selected item、disabled item、keyboard focus、loading |
| Text input | empty、focused | filled、disabled、error、readonly |
| Textarea | resizable、scrollable | focused、filled、disabled、error、readonly |

未畫出的狀態只是後續需求，不代表已存在於向量來源。

## Button

狀態：來源元件，規格草稿

### 用途與邊界

觸發立即動作，例如新增、儲存、確認或刪除。`primary` 用於目前區域唯一的主要動作，`danger` 只用於可能造成資料損失或不可逆後果的動作。不可把 Button 當成頁面導覽標籤、狀態 Badge 或純文字連結。

### 結構與變體

- 高度 48 px、pill radius 24 px、左右候選內距 24 px、內容 gap 8 px。
- `primary`：藍色背景；`neutral`：灰色背景；`danger`：紅色背景；`outline`：深色背景與 2 px 藍色描邊；`disabled`：灰色表面與低強度文字。
- 來源寬度為 128 px，但系統元件應依文案與內距計算，不固定所有按鈕同寬。

### 狀態、互動與內容

- `hover`、`pressed`、`focused` 與 `loading` 尚未畫出，定稿前不得由實作者自行猜色。
- 點擊只觸發一次明確動作；非同步動作進入 loading 後避免重複提交。
- 文案使用動詞開頭並直接描述結果，例如「建立任務」；避免「確定」等失去上下文的泛稱。

### 無障礙

- 保持至少 48 px 高的命中區與可見鍵盤焦點。
- Danger 不得只依紅色傳達風險，需搭配清楚文案；disabled 需以原生不可操作狀態暴露給輔助科技。

## Icon button

狀態：來源元件，規格草稿

### 用途與邊界

用於工具列、卡片快捷操作或空間受限的高辨識度動作。圖示語意不明、低頻或可能造成風險時，應改用文字按鈕或搭配持久標籤，不可只靠猜測圖示意思。

### 結構與變體

- 48 × 48 px 圓形容器，候選圖示尺寸 24 px，圖示在容器內光學置中。
- 沿用 Button 的 primary、neutral、danger、disabled 語意色；2026-07-19 補上 outline variant（candidate，非原始 Illustrator 來源，比照 Button outline 的 2 px 藍色描邊）。

### 狀態、互動與內容

- 需要 hover、pressed、focused、selected 與 disabled；selected 不得與 pressed 混為同一狀態。
- 桌面游標 hover 時應顯示 tooltip；tooltip 文案使用動作名稱，不重複不可理解的圖示名稱。

### 無障礙

- 必須有可存取名稱，例如 `aria-label="刪除任務"`。
- 即使圖示視覺尺寸縮小，命中區仍維持至少 48 × 48 px。

## Switch

狀態：來源元件，規格草稿

### 用途與邊界

立即切換一個持續設定或布林狀態。若變更需要額外確認、填寫資料或只在送出表單後生效，應改用 Checkbox 或其他表單控制，不使用 Switch 假裝立即生效。

### 結構與變體

- Track 96 × 48 px、radius 24 px；thumb 40 px，來源光學 inset 約 4 px。
- `on` 使用藍色 track、thumb 靠右；`off` 使用灰色 track、thumb 靠左；`disabled` 降低可操作感。
- 紅色 danger-on 只用於「啟用後本身具有風險」的產品情境，不能當作一般 on 狀態替代色。

### 狀態、互動與內容

- 點擊控制本體或其標籤皆切換同一值；狀態變更需立即可見。
- 有遠端副作用時需提供 loading 或失敗回復，尚未在來源中畫出。
- 標籤描述設定本身，例如「允許公開分享」，不寫「開啟／關閉」。

### 無障礙

- 使用 switch 語意並同步 `checked` 狀態；不能只用 thumb 位置或顏色表達 on/off。
- 必須有持久可見標籤，焦點環不得被 track 裁切。

## Checkbox

狀態：來源元件，規格草稿

### 用途與邊界

用於多選、批次選取或彼此獨立的布林選項。互斥選擇應使用 Radio；立即套用的單一設定可考慮 Switch。

### 結構與變體

- 視覺方塊 32 × 32 px、radius 8 px，checked／indeterminate indicator 約 20 px。
- 已觀察 `unchecked`、`checked`、`indeterminate`、`disabled`；indeterminate 只表示子項部分選取，不代表第三個可提交值。

### 狀態、互動與內容

- 點擊標籤與控制本體皆可切換；父層 indeterminate 的下一次點擊行為需由產品明確決定並保持一致。
- 標籤使用肯定句，避免雙重否定。

### 無障礙

- 32 px 視覺控制置於至少 48 × 48 px 命中區。
- indeterminate 使用對應的混合狀態語意；錯誤訊息應關聯至整個欄位或群組。

## Radio

狀態：來源元件，規格草稿

### 用途與邊界

從少量、互斥且可同時比較的選項中選一項。選項很多、內容很長或版面受限時改用 Select；單一布林值不用 Radio。

### 結構與變體

- 外圈 32 × 32 px，內部 selected indicator 20 px。
- 已觀察 `unchecked`、`checked`、`disabled`；Radio 必須以群組存在，不能孤立使用。

### 狀態、互動與內容

- 同群組只允許一個 selected；方向鍵在群組內移動並更新選擇，Tab 離開群組。
- 群組標題說明決策，選項文字保持平行語法。

### 無障礙

- 使用 radiogroup 與 radio 語意，提供群組名稱、目前值及 disabled 狀態。
- 錯誤應顯示在群組層級，不只標紅單一圓點。

## Split button / Dropdown

狀態：來源元件，規格草稿

### 用途與邊界

主要區域立即執行預設動作，disclosure 區開啟同類替代動作。若沒有明確且高頻的預設動作，使用一般 Dropdown；若選單用來選值而非執行命令，使用 Select。

### 結構與變體

- 來源 closed 尺寸 180 × 48 px；右側 disclosure 區系統化為 48 px，兩區之間使用 1 px 分隔線。
- closed 使用完整 pill；open 時頂部控制保留上方圓角、下緣接齊面板，面板底部 radius 24 px。
- 每個 menu row 使用 48 px 高度；面板高度依選項數量計算，不把來源的 126 px 固定成 token。

### 狀態、互動與內容

- 主區與 disclosure 區需有獨立 hover、pressed、focused 狀態及命中區。
- `ArrowDown`／`Enter`／`Space` 開啟選單，方向鍵移動，`Enter` 執行，`Escape` 關閉並把焦點還給 disclosure。
- 選項文字使用可執行的動詞；破壞性選項需使用 danger 語意並與一般選項分組。

### 無障礙

- disclosure 暴露 expanded 與 menu 關係；焦點不可在選單關閉後遺失。
- 動畫只能補充開合關係，不可延遲鍵盤操作；減少動態偏好下允許直接切換。

## Text input / Textarea

狀態：來源元件，規格草稿

### 用途與邊界

Text input 用於單行短文字；Textarea 用於描述、備註與多行內容。固定選項不要以自由文字輸入取代；密碼、數字、搜尋等特殊用途需另建語意變體。

### 結構與變體

- Text input 高度 48 px、radius 24 px、候選左右內距 24 px；寬度由容器控制。
- Textarea 來源尺寸為 256 × 128 px 與 256 × 256 px、radius 24 px、候選內距 16 px。
- `focused` 使用 2 px 藍色描邊；來源的 resize handle 與 scrollbar 分別代表 resizable、scrollable 能力，不應預設每個 Textarea 同時啟用。

### 狀態、互動與內容

- 規格需要 empty、filled、focused、disabled、error、readonly；目前來源只完整展示 empty 與 focused。
- Placeholder 只提供範例，不能取代持久 label。錯誤文案需指出如何修正，不只寫「格式錯誤」。
- Textarea 若限制長度，需在接近限制時顯示計數；resize 不得讓元件突破容器或遮住必要操作。

### 無障礙

- 每個欄位必須有程式可辨識的 label；輔助文字、錯誤與字數限制需建立描述關聯。
- Focus、error、readonly 與 disabled 不只靠色彩區分；文字與 placeholder 對比需在字型定稿後重新測量。

## Color swatch

狀態：來源參考，不是產品元件

### 用途與邊界

目前畫板底部色條是視覺來源索引，用於核對 palette，不應直接宣告為終端產品的 Color picker 或可點擊 Swatch 元件。

### 結構、互動與內容

- 已驗證顏色為 `#1A1A1A`、`#333333`、`#4D4D4D`、`#666666`、`#598AE8`、`#C1272D`、`#FFFFFF`、`#F2F2F2`。
- 原始色條具有重疊與非 8 px 尺寸，這是畫板展示方式，不轉為 component token。
- 若未來建立可互動 swatch，需另定 selected、focused、disabled、透明色與自訂色行為，並顯示文字名稱或數值，不能只呈現色塊。

### 無障礙

- 顏色選項需有可存取名稱、選取狀態及非顏色識別方式；極淺或極深色塊需要可見邊界。

## Badge / Tag

狀態：`candidate`

### 用途

用短文字表示分類、狀態、優先級或可移除的篩選條件。適用於任務卡、清單列、篩選器及資產標籤；不適合承載主要操作或完整句子。

### 結構

- 單行標籤文字，可選 16 px 前導圖示或尾端移除按鈕。
- 高度 40 px，左右內距 16 px，圖示與文字間距 8 px。
- 外形使用 pill radius；文字超長時由產品層設定最大寬度與截斷策略。

### 變體與狀態

- `neutral`：中性資訊，灰色表面。
- `accent`：目前選取或主要分類，藍色表面。
- `danger`：高風險、阻擋或錯誤分類，紅色表面。
- `outline`：低強度可選標籤，以 2 px 藍色描邊呈現。
- `disabled`：不可互動；不得只依顏色傳達停用，互動層同時移除焦點與點擊行為。
- `focused`：若 tag 可互動，需提供可見的 2 px focus ring；本批向量稿以 outline variant 示意視覺，不代表兩者語意相同。

### 互動與內容

- 純狀態 tag 不可點擊；可點擊篩選器應使用明確游標、鍵盤操作及選取狀態。
- 文案建議 2-8 個中文字或 3-16 個拉丁字元，不放句號。
- 可移除 tag 的移除按鈕需有獨立可存取名稱，例如「移除：高優先」。

### 無障礙

- 不以藍／紅顏色單獨表達語意；需要文字、圖示或上下文共同說明。
- 可互動 tag 的實際命中區使用 48 × 48 px；40 px 視覺高度由上下各 4 px 的透明 hit area 補足。

## Inline alert

狀態：`candidate`

### 用途

在目前內容附近提供持續可見、非阻斷的資訊、警告或錯誤回饋。適合儲存狀態、同步失敗、權限說明與局部資料風險；不可取代需要立即決策的 modal，也不可取代短暫操作回饋的 toast。

### 結構

- 4 px 語意色指示條、24 px 狀態圖示、標題、說明文字及可選關閉按鈕。
- 最小高度 96 px，容器圓角 16 px，內容內距 16 px，標題與說明間距 8 px。
- 背景維持 `background-surface`；語意色只用於指示條、圖示及必要焦點。

### 變體與狀態

- `info`：一般資訊或需要注意的操作背景，使用 primary blue。
- `danger`：失敗、資料風險或不可逆後果，使用 danger red。
- `neutral`：不帶成功／警告判斷的系統狀態，使用 off-white 與灰階。
- `dismissible`：只有訊息可安全忽略時才提供關閉按鈕。
- `focused`：關閉按鈕取得鍵盤焦點時顯示 2 px blue focus ring。

尚未建立 success 與 warning 色彩；在語意色經使用者確認前，不自行加入綠色或黃色。

### 互動與內容

- 標題直接說明發生什麼事；說明文字提供原因、影響或下一步。
- 若需要操作，最多提供一個主要文字操作；多步驟流程改用頁面內容或 dialog。
- danger alert 不可自動消失。關閉後若風險仍存在，產品必須保留其他可發現入口。

### 無障礙

- 動態出現的一般資訊使用 `role="status"`；需立即處理的錯誤才使用 `role="alert"`。
- 關閉按鈕需有可存取名稱。文字與背景對比需在整合產品時依實際字型與尺寸重新驗證。

## Select / Combobox

狀態：`candidate`（第一批新元件，2026-07-19）

### 用途與邊界

從固定選項中選取一項，適用於狀態、負責人、排序、篩選條件等情境。選項需要搜尋或內容過多時應改用 combobox 搜尋變體（2026-07-19 已補上候選畫面）。不適合用來執行命令，執行命令請用 Split button 或 Menu。

### 結構與變體

- Trigger 高度 48 px、radius 24 px、內距比照 Text input；右側 chevron 圖示指出開合方向。
- 開啟面板貼齊 trigger 下緣，面板底部圓角 16 px，選項列高 48 px。

### 狀態、互動與內容

- 已畫出 `closed`、`open`（含 selected item 與 disabled item）、`disabled`、`combobox`（可輸入搜尋，篩選結果以主色標示相符文字）；`hover item`、`keyboard focus`、`loading` 尚未畫出。combobox 目前只示範文字比對高亮，尚未定義無結果、多選、非同步搜尋等狀態。
- 定案：combobox 的 2 px 藍色 focus 描邊包住整個 trigger＋結果列表（而非只框住輸入列），依據 Material Design 3 SearchView 的「contained style」慣例（搜尋框展開時與建議清單共用同一視覺容器）。來源：[Material Design 3 Search guidelines](https://m3.material.io/components/search/guidelines)、[material-components-android Search.md](https://github.com/material-components/material-components-android/blob/master/docs/components/Search.md)。
- `ArrowDown`／`Enter`／`Space` 開啟選單，方向鍵移動，`Enter` 選取並關閉，`Escape` 關閉且不變更目前值。
- 選項文字使用名詞而非動詞，與 Split button 的可執行命令語彙區分。

### 無障礙

- 需要 combobox／listbox 語意，開啟狀態需暴露 `aria-expanded`。
- 目前選取值需可由輔助科技辨識，不能只靠視覺樣式表達。

## Menu / Context menu

狀態：`candidate`（第一批新元件，2026-07-19）

### 用途與邊界

依目前選取物或游標位置提供相關操作，例如卡片右鍵、圖形物件操作、欄位設定。不適合承載長表單或多步驟流程。

### 結構與變體

- 面板圓角 16 px，選項列高 40 px（沿用 compact 元件高度），內距 8 px。
- 群組之間以 1 px 分隔線區隔。

### 狀態、互動與內容

- 已畫出 `default item`、`hover item`（背景 gray-700）、`keyboard focus item`（2 px 藍色 focus ring）、`danger item`（紅字，需與一般選項分組）、`disabled item`，以及第二組候選面板示範的 `checked/toggled item`（勾選圖示，用於可切換選項如「顯示網格」）與帶鍵盤快捷鍵提示的一般 item（例如「貼齊邊界」搭配 `⌘G`，快捷鍵文字使用低強度 gray-600）。submenu 指示（例如右側箭頭）尚未畫出。
- 方向鍵移動，`Enter` 執行，`Escape` 關閉並將焦點還給觸發元件。
- 選項文字使用可執行動詞；破壞性選項需以分隔線與一般選項區隔。

### 無障礙

- 使用 menu／menuitem 語意；開啟時焦點需移入選單。
- 關閉後焦點必須明確返回觸發元件，不可遺失。

## Tabs

狀態：`candidate`（第一批新元件，2026-07-19）

### 用途與邊界

在同一上下文內切換同層內容，例如卡片詳情的活動／設定／附件。不可用來表示跨層級導覽，也不可取代主要導覽。

### 結構與變體

- 底部 1 px 分隔線貫穿整列；選取中的 tab 以 2 px 主色底線標示。

### 狀態、互動與內容

- 已畫出 `selected`、`default`（未選取）、`disabled`、`hover`（以 6% 白色疊加背景表示，見 `tokens` 的 `opacity.hover-overlay`）；`focus-visible` 尚未畫出。
- 方向鍵在群組內移動，`Tab` 鍵離開群組；標籤文字需簡短且彼此平行語法。

### 無障礙

- 使用 tablist／tab／tabpanel 語意；selected tab 需對應 `aria-selected` 並與 tabpanel 建立關聯。
- disabled tab 需可被輔助科技識別為不可選取。

## Tooltip

狀態：`candidate`（第一批新元件，2026-07-19）

### 用途與邊界

在 hover 或鍵盤 focus 觸發元件時，補充其名稱或用途說明，常搭配 Icon button。不可承載主要資訊或可互動內容。

### 結構與變體

- 8 px 圓角提示框，出現在觸發元件右側，垂直置中對齊觸發元件中心（箭頭三角形頂點精準指向該中心線）；左側有指回觸發元件的小三角形。已定案為側邊彈出（非上方彈出）。

### 狀態、互動與內容

- 已畫出 `shown` 的兩種 `placement`：`beside`（預設，右側彈出）與 `below`（觸發元件貼近畫面上緣或右緣時的替代位置）；`delay-in`、`delay-out`、`left`／`above` 等其餘 placement 變體尚未定義。兩種已畫出的 placement 皆以箭頭頂點對齊觸發元件中心為準則。
- 只在 hover 或 focus 時出現，滑鼠移開或失焦即消失；純觸控裝置的替代呈現方式本批未定義。
- 文案使用動作名稱，不重複圖示本身的視覺意義。

### 無障礙

- 觸發元件需有 `aria-describedby` 指向 tooltip 內容。
- tooltip 本身不可成為 Tab 焦點停留點。

## Modal / Dialog

狀態：`candidate`（第一批新元件，2026-07-19）

### 用途與邊界

阻斷目前流程，要求使用者確認、輸入或處理重要資訊，例如刪除確認、建立看板。不應用於可在頁面內完成的輕量操作。

### 結構與變體

- 16 px 圓角容器：標題、說明文字、底部操作列（次要動作靠左、主要動作靠右，動作使用 compact 40 px 按鈕）。
- 2026-07-19 已補畫遮罩（scrim）視覺樣式（見下方狀態說明）；實際 focus trap 行為仍需前端實作時另補。

### 狀態、互動與內容

- 已畫出 `default action`（主色確認按鈕）、`danger action`（紅色確認按鈕，用於不可逆操作）、`loading`（主要動作降低不透明度並附旋轉指示，次要動作同步停用）；`error`、多步驟變體尚未畫出。
- 2026-07-19 補上 backdrop 視覺樣式（`#000000` 搭配 45% 不透明度，見 token `modal.backdrop-color` 與 `opacity.backdrop`），僅為靜態視覺示範；focus trap、開啟／關閉動畫等屬於行為規格，無法由靜態向量表達，仍待前端實作時定義。
- 開啟時焦點需移入對話框並鎖定在框內（focus trap，本批未實作）；`Escape` 關閉非破壞性對話框。
- 標題直接說明將發生的事；danger 對話框的說明文字需明確描述後果，不能只寫「確定」。

### 無障礙

- 使用 dialog／alertdialog 語意（danger 建議 alertdialog）。
- 關閉後焦點需回到觸發元件。

## Toast / Snackbar

狀態：`candidate`（第一批新元件，2026-07-19）

### 用途與邊界

短暫顯示非阻斷式回饋，例如儲存、複製、刪除、同步結果。不可承載需要立即決策的內容（改用 Modal），也不可取代持續存在的狀態提示（改用 Inline alert）。

### 結構與變體

- 16 px 圓角膠囊型容器，高度 56 px；可選尾端文字動作（例如「復原」）。
- 多筆同時觸發時以背後可見的堆疊卡片暗示佇列。

### 狀態、互動與內容

- 已畫出 `shown`（純訊息）、`with action`（含可點擊文字動作）、`queued`（背後可見下一筆）、`danger／error`（24×24 px 實心紅色圓形＋白色驚嘆號圖示，圖示與文字間距約 14 px，搭配可點擊的「重試」文字動作；容器維持一般深灰底與圓角，不使用左側裝飾條）；自動消失時間、可關閉按鈕尚未定義。
- 非阻斷、不搶焦點；有動作時該動作需可鍵盤操作。
- 文案簡短直述結果，不需要句號。

### 無障礙

- 使用 `role="status"`（非緊急）呈現。
- 不可只依賴自動消失時間讓使用者獲取資訊；關鍵回饋是否同時記錄在可回顧處（例如活動紀錄），留待產品情境確認。

## 校準清單

- ✅ 已確認：字型家族為 Noto Sans TC（2026-07-19 使用者確認）；中文字重仍待進一步確認。
- ✅ 已完成多輪視覺校準（2026-07-19，共七輪，最終結果已反映在各元件小節；逐輪細節見 git log）：disabled 前景色改用 `fill-opacity="0.55"`（非 hex alpha，因部分工具如 Illustrator 對 `#RRGGBBAA` 支援不一致，token 見 `opacity.disabled`）；Tooltip 定案側邊彈出並修正箭頭對齊；Icon button/Select/Menu/Tabs/Tooltip/Modal/Toast 補齊 outline variant、combobox 搜尋、checked item 與快捷鍵提示、hover 狀態、`below` placement、backdrop、loading 等形態（對應 token 見 `tokens/everline-draft.tokens.json`）；修正 combobox 結果列文字因 `<tspan>` 混色未帶外層 `fill` 而部分渲染器不顯示的問題；Toast danger/error 圖示定案為 24×24 px 實心紅圓＋白色驚嘆號、移除左側裝飾條，並修正與其他 toast 圖示的對齊。
- 待確認 compact 元件採用 40 px，或統一使用既有 48 px 控制高度。
- 待確認 gray-600 是否真的是 input default surface，而不是暫時佔位狀態。
- 待補 success／warning 語意色，但在有實際產品情境前不新增。
- 待將確認後的元件回填至 Illustrator 主來源；本批不修改 `works/illustrator/everline_p1.ai`。
- 第一批新元件（Select/Combobox、Menu/Context menu、Tabs、Tooltip、Modal/Dialog、Toast/Snackbar）僅畫出核心狀態，見各元件小節「狀態、互動與內容」，尚未涵蓋完整無障礙與鍵盤操作驗證。

## 設計系統／Token 全面檢查（2026-07-19）

使用者要求檢查整個設計系統與 token 是否需要修改或增加規則。已直接新增的部分見上方「Token 命名慣例」「圖示系統」「堆疊順序（Layer）候選」「動效（Motion）候選」四個新章節，皆為純新增，不影響任何已核准的既有視覺。以下是同一次檢查中發現、但**會改變既有元件實際顏色**的問題，刻意不擅自執行，留待使用者決定：

- ✅ 已解決（2026-07-19）：新增 `color.semantic.background-overlay` = `{color.base.gray-700}`（`#4D4D4D`），套用於 Select／Split button 選單面板、Menu、Tooltip、Modal 共 5 處，取代原本 4 種不一致色值（含 Modal 原本未對應 base palette 的裸 hex）。選 gray-700 而非 gray-800，因 gray-800 已是 `border-default`，重用會讓浮動面板自身邊框消失。連帶修正 Menu hover 列因此變隱形的問題，改用 `#ffffff` + `opacity.hover-overlay` 疊加（比照 Tabs 既有手法）。已在 `works/everline-components-master.svg` 同步套用並渲染核對。
- **⚠️ 待決定：focus ring 與 outline variant 目前共用同一組視覺（2 px 藍色描邊）**。Button／Icon button 的 `outline` 變體，與規格中提到但尚未畫出的 `focused` 狀態，目前都只能用「2 px 藍色描邊」表達，兩者在視覺上會完全一樣。真正開始畫 `focused` 狀態時，一個本身就是 outline 樣式的按鈕會分不清楚「這是 outline 變體」還是「這是目前被鍵盤聚焦」。建議：另立獨立的 focus ring 表現（例如外擴 2px 的偏移光暈，而非緊貼邊緣的描邊），但這也是需要視覺驗證的決定，非本次一併執行。
- **後續建議（非本次動作項目）**：第二批（Sidebar／Toolbar／Card／List／Data table／Kanban column／Task card）會再新增至少 List、Data table、Kanban column 三個「可選取列」型元件。目前 Select 展開面板／Split button 選單／Menu 三者已經各自發展出選取列的視覺語彙（hover 背景、選取列強調條、checked 圖示等），彼此沒有共用一套「list item」token。建議在開始第二批前，先決定是否要抽出一組共用的 `component.list-item.*` token（hover/selected/disabled 背景、指示條寬度與色彩），供 Select、Split button、Menu、未來的 List／Data table／Kanban column 共同引用，避免同一個「選取列」概念在 6-7 個元件裡各自長出不同規則。

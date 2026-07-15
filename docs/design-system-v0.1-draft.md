# Everline v0.1 設計系統草稿

狀態：`candidate`  
建立日期：2026-07-16  
來源：`works/72ppi/everline_p1.svg`、`works/72ppi/everline_p1.pdf`  
候選向量稿：`works/everline-agent-components-v0.1.svg`

本文件是受控延伸用的校準稿，不是穩定版規格。已觀察到的值與本次推導值分開記錄；使用者確認前，不應將候選內容視為 Everline 的凍結決策。

## 已確認規則

- 元件放大與縮小一律以 8 px 為尺寸級距，並維持內部元素的相對比例。
- 建議元件高度序列為 `32 / 40 / 48 / 56 / 64 px`；新增尺寸不得插入任意中間值。
- 膠囊半徑可由元件高度的一半推導；1 px／2 px 描邊屬光學邊界，不當作元件縮放級距。若縮放後需要不同描邊，必須另行視覺驗證。

## 設計原則候選

- 深色工作介面：畫布以接近黑色的背景承載高頻工具，元件表面使用灰階建立層次。
- 狀態優先：藍色固定表示主要操作、選取或焦點；紅色固定表示危險操作，不以裝飾用途濫用。
- 圓潤但不柔弱：主要操作使用膠囊外形；較大資訊容器使用 16 px 圓角，保留工具介面的清晰邊界。
- 低裝飾：以純色、描邊、間距及文字層級表達狀態，不先引入陰影或複雜漸層。
- 漸進定稿：新元件先標記為 candidate，經視覺校準及產品情境驗證後才能升格。

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
- UI 字型暫用 `Microsoft JhengHei, system-ui, sans-serif`。來源 SVG 的文字已轉外框，無法驗證原始字型，因此這項必須人工確認。

## 原始元件量測

以下數值直接取自 `works/72ppi/everline_p1.svg`，屬於已查證的來源事實。帶小數或不符合系統級距的畫板尺寸只保留為追溯證據，不會全部轉成產品 token。

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
| Icon button | primary、neutral、disabled、danger | hover、pressed、focused、selected、tooltip |
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
- 沿用 Button 的 primary、neutral、danger、disabled 語意色；來源尚未畫 outline variant。

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

## 校準清單

- 待使用者確認字型家族與中文字重。
- 待確認 compact 元件採用 40 px，或統一使用既有 48 px 控制高度。
- 待確認 gray-600 是否真的是 input default surface，而不是暫時佔位狀態。
- 待補 success／warning 語意色，但在有實際產品情境前不新增。
- 待將確認後的元件回填至 Illustrator 主來源；本批不修改 `works/everline_p1.ai`。

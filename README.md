# Everline Design

Everline 是一套為 Taylor Kanban 與未來延伸產品整理的圖形介面設計語言與設計系統基礎。此倉庫目前以規格文件、GUI 元件研究、向量原始檔與設計預覽為主，目標是讓視覺規則、資產來源和後續實作可以持續追蹤與維護。

> 專案仍在早期整理階段。目前不是可安裝的前端元件庫，也沒有可執行應用程式。

![Everline Design Language 初版元件預覽](works/eve工作區域%201.png)

## 目前進度

截至 2026-07-20，倉庫已具備：

- Everline 的定位、責任邊界、資料夾規則與工程防護條件。
- 第一批深色工作型介面語彙草圖。
- Button、icon button、switch、split button／dropdown、text input、基礎色票及部分狀態變體（來源：`works/illustrator/everline_p1.ai`）。
- GUI 元件研究資料，涵蓋常見操作、輸入、導覽、容器、資料展示、狀態回饋與桌面工具介面。
- Adobe Illustrator 向量原始檔與一張 1920 × 1080 PNG 預覽。
- 既有 Button、Icon button、Switch、Checkbox、Radio、Split button／Dropdown、Text input／Textarea 與色票的規格化盤點，以及由此延伸的 Badge／Tag、Inline alert、Select／Combobox、Menu／Context menu、Tabs、Tooltip、Modal／Dialog、Toast／Snackbar 候選向量稿，統一收錄於單一總表 `works/everline-components-master.svg`（共 17 類 candidate），PNG 校準預覽 `exports/everline-components-master.png`，以及 framework-neutral design token 草稿。
- UI 字型已確認為 Noto Sans TC。
- Lucide 1.24.0 圖示與字型素材封存，供後續圖示研究與設計工作參考。
- Everline v0.1 第二批（Sidebar／Navigation rail、Toolbar、Card／Tile、List、Data table、Task card、Kanban column，共 7 類）SVG candidate 已完成並經審查通過，獨立收錄於 `works/everline-components-batch2.svg`（PNG 預覽 `exports/everline-components-batch2.png`），規格見 `docs/design-system-v0.1-batch2-draft.md`；共用 `component.list-item.*` token 已套用於 List／Data table／Kanban column。
- 已確立「Illustrator 構思 → SVG 候選＋人類審查 → 確認後轉 HTML/CSS（畢業）」的完整候選元件流程，新增 `works/html/` 作為 HTML/CSS 候選元件原型資料夾（尚未有內容）。

目前尚未完成：

- 正式 design token schema。
- 正式元件規格與前端元件庫。
- 資產索引與穩定版本號規則。
- `works/illustrator/everline_p1.ai` 的圖層、元件命名及重用結構文件；第一批、第二批候選稿皆尚未回填至 Illustrator 主來源。
- 第二批已審查通過的 SVG candidate 轉為 `works/html/` 的 HTML/CSS（「畢業」）；另約時間進行。
- Everline v0.1 第三批（Number input／Slider／Accordion／Popover／Breadcrumb／Search field／Date-time picker／Progress-Loading，共 8 類）元件。
- Taylor Kanban 倉庫、技術棧與實作結構驗證。

因此，倉庫內提到 Taylor Kanban 的內容只代表預期使用情境，不代表已確認其現有實作。

## 倉庫內容

```text
Everline Design/
├─ docs/
│  ├─ spec.md                 # 主要規格與工程契約
│  ├─ STATUS.md               # 已確認的現況與限制
│  ├─ NEXT_ACTION.md          # 下一個設計整理階段
│  ├─ design-system-v0.1-draft.md # 候選 token 與元件規格（第一批）
│  ├─ design-system-v0.1-batch2-draft.md # 候選元件規格（第二批）
│  ├─ lucide-icons/           # Lucide 圖示研究素材（本機參考快取，見下方說明）
│  ├─ lucide-icons.zip
│  └─ lucide-font.zip
├─ references/
│  ├─ gui-components-reference.md
│  └─ images/                 # 具來源註記的介面參考截圖
├─ works/
│  ├─ illustrator/            # Illustrator 原始專案檔（.ai）
│  │  └─ everline_p1.ai       # 目前的向量設計來源
│  ├─ html/                   # HTML/CSS 候選元件原型（審查通過的元件轉入，尚無內容）
│  ├─ everline_p1.svg／.pdf   # everline_p1.ai 的交換格式匯出
│  ├─ everline-components-master.svg # 元件候選總表（既有＋第一批新元件，共 18 類）
│  ├─ everline-components-batch2.svg # 第二批候選稿（獨立檔案，共 7 類）
│  └─ everline-agent-components-v0.1.svg # 歷史候選稿，已由總表取代
├─ exports/
│  ├─ everline-components-master.png # 總表校準預覽
│  ├─ everline-components-batch2.png # 第二批校準預覽
│  └─ everline-agent-components-v0.1.png # 歷史候選稿校準預覽
├─ tokens/
│  └─ everline-draft.tokens.json # Framework-neutral 候選 token
├─ LICENSE
└─ README.md
```

已按實際內容建立的目錄：

- `exports/`：存放由 `works/` 向量來源輸出的 PNG、SVG、WebP 等交付資產；目前內容仍是候選校準稿。
- `tokens/`：存放可由產品或工具消費的色彩、字級、間距、圓角等設計 token；目前 schema 與數值尚未定稿。
- `works/illustrator/`：存放 Illustrator 原始專案檔（`.ai`）；此類工作檔不受下方資產命名規則約束。

這些目錄只在有實際內容時建立，不以空目錄表示尚未存在的能力。

`docs/lucide-icons/`、`docs/lucide-icons.zip`、`docs/lucide-font.zip`、`docs/lucide-font/`為**本機參考快取，已由 `.gitignore` 排除、不納入版本控制**；重新 clone 本倉庫不會取得這些檔案，需要時請自行從 Lucide 上游重新下載（封存版本 1.24.0）。變更原因與細節見 `docs/STATUS.md`。

## 文件入口

- [`docs/spec.md`](docs/spec.md)：專案目的、目標與非目標、資產工作流、工程契約、驗收條件和未決問題。
- [`docs/STATUS.md`](docs/STATUS.md)：目前已確認的設計狀態與限制。
- [`docs/NEXT_ACTION.md`](docs/NEXT_ACTION.md)：下一階段預計整理的元件、狀態與 token 候選。
- [`references/gui-components-reference.md`](references/gui-components-reference.md)：GUI 元件研究、來源索引與授權注意事項；不是正式元件規格。

開始修改專案前，建議依上述順序閱讀，以免將規劃中內容誤認為已完成成果。

## 資產工作流

1. 將可編輯的向量設計來源保存在 `works/`。
2. 以小寫英文、數字與連字號命名新資產，名稱應能表達用途或主題。
3. 將正式匯出內容放入 `exports/`，不要以匯出檔覆蓋設計來源。
4. 透過一致檔名、相鄰說明或資產索引保留來源與匯出檔的關聯。
5. 將重大設計方向及責任邊界變更記錄在 `docs/`。
6. 公開發布或整合進產品前，再次確認來源、授權和是否包含不應公開的資訊。

`works/illustrator/everline_p1.ai` 尚未完成內部結構盤點；再次搬移或重新命名前須先確認外部引用與匯出依賴並取得使用者同意（搬移歷史見 `docs/STATUS.md`）。

## 下一階段

目前建議先把初版草圖整理為 Everline v0.1 的元件清單與命名規則，優先處理：

- button
- icon button
- switch
- split button
- dropdown
- text input
- color swatch

元件狀態候選包含 `default`、`disabled`、`danger`、`outline`、`focused`、`on` 與 `off`。正式定義前，仍需盤點 Illustrator 原始檔，並決定先建立元件規格或 design token 文件。

## 貢獻原則

提出變更時請：

- 先確認內容屬於正式設計資產、研究參考、規格文件或匯出交付物。
- 不把參考截圖或外部品牌樣式直接當作 Everline 成品。
- 不在缺乏來源驗證時記錄 Taylor Kanban 的技術細節。
- 保持 `works/` 與 `exports/` 的來源／輸出分工。
- 在新增第三方圖片、圖示、字型或文件前確認並保留其授權與來源資訊。

## 授權與第三方內容

本專案自行創作並有權授權的內容採用 [Apache License 2.0](LICENSE)。

`references/` 內的外部截圖、商標與研究資料，以及倉庫內封存的 Lucide 圖示／字型，不因收錄於本倉庫而改變其原始權利或授權條款。使用、散布或商用前，請依各來源文件與上游專案條款個別確認；參考資料中的來源索引可作為查核起點。

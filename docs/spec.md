# Everline 規格文件

## 專案概述

Everline 是一個圖形界面設計語言與設計系統專案，目的是為 Taylor Kanban 與其他延伸產品建立一致、可規範、可維護的視覺與介面設計基礎。

本規格文件是 Everline 的初版專案規格，主要讀者是未來接手本資料夾的 coding agent、design agent、設計者與前端開發者。文件重點不是完整設計手冊，而是定義 Everline 的目的、邊界、資料夾工作流與後續設計系統應補齊的方向。

目前已知專案狀態：

- `works/` 用於存放可編輯設計來源：Illustrator 向量繪圖專案檔（`works/illustrator/`），以及 2026-07-19 起新增的 HTML/CSS 候選元件原型（`works/html/`）——構思階段仍以 Illustrator 為主，元件大致定案後才轉為 HTML/CSS 候選規格。
- 目前已有向量原始檔 `works/illustrator/everline_p1.ai`。
- Taylor Kanban 的 GitHub 連結目前尚未成功驗證，因此本文件不記錄其 repo 架構、實作細節或未確認功能。

## 核心問題

Taylor Kanban 與未來延伸產品若各自累積 UI 規則、圖形資產、命名方式與輸出格式，會導致以下問題：

- 同一品牌或產品系列在不同介面中呈現不一致。
- 向量原始檔、匯出圖片與實際產品使用素材之間缺乏可追蹤關係。
- 新增圖示、元件、插圖或品牌資產時，缺少統一命名與放置規則。
- 未來 agent 或開發者接手時，需要重新推測設計意圖，增加維護成本。
- 設計決策難以沉澱為可重複使用的系統。

Everline 要解決的核心問題，是把 Taylor 系列產品的圖形界面設計語言整理成可持續演進的設計系統，而不是只保存單次繪圖成果。

## 目標

Everline 初版的目標如下：

1. 定義 Taylor Kanban 與延伸產品共用的設計語言方向。
2. 建立向量原始檔與匯出圖片之間的資料夾分工。
3. 建立未來整理設計 token、元件、圖示與品牌資產的基礎規則。
4. 讓未來 agent 能讀完本文件後理解專案目的、責任邊界與新增素材時的放置方式。
5. 讓設計系統能逐步補齊，而不是依賴一次性、不可追蹤的繪圖檔案。

## 目標使用者

Everline 主要服務以下使用者：

- 未來 coding agent：需要理解設計系統目的、資料夾結構與可修改範圍。
- 未來 design agent：需要根據既有設計語言延伸圖形、元件或視覺規則。
- 設計者：需要管理向量原始檔、輸出圖片與參考素材。
- 前端開發者：需要從設計系統中取得可實作的視覺規則、元件方向與資產。
- Taylor 系列產品維護者：需要保持 Taylor Kanban 與其他延伸產品在視覺與互動語言上的一致性。

## 非目標

Everline 初版不處理以下事項：

- 不直接實作前端元件庫。
- 不重構 Taylor Kanban 的程式碼。
- 不取代 Adobe Illustrator 或其他向量繪圖工具。
- 不在未驗證 Taylor Kanban repo 內容前記錄其內部架構或實作細節。
- 不一次定義完整品牌手冊、完整 design token schema 或所有 UI component 規格。
- 不建立與目前需求無關的大型資料夾或抽象流程。

## 功能清單

### 1. 設計語言原則

Everline 應逐步整理 Taylor 系列產品共用的視覺語言，包含但不限於：

- 介面整體氣質與使用情境。
- 色彩使用方向。
- 字體與排版階層。
- 圖示、線條、形狀與插圖風格。
- 元件狀態與互動回饋的視覺規則。

初版只需記錄方向與待補項目；實際 token、元件與圖示細節可在後續文件中補齊。

已確認的縮放規則：元件放大與縮小一律以 8 px 為尺寸級距，並維持內部元素的相對比例。膠囊半徑可由元件高度推導，描邊則依光學需求另行驗證，不以任意縮放值取代明確 token。

### 2. 設計系統結構

Everline 應支援未來逐步拆分為以下內容：

- 設計原則：描述 Everline 的視覺與互動判斷基準。
- 設計 token：保存色彩、字級、間距、圓角、陰影等可實作變數。
- 元件規格：描述按鈕、看板卡片、欄位、導覽、表單等 UI 元件。
- 圖示與圖形資產：保存可被 Taylor 系列產品共用的圖示、插圖與品牌視覺。
- 匯出規則：定義從向量原始檔轉存圖片時的格式、命名與用途。

### 3. 資產命名規則

新增素材時應使用可讀、可搜尋、可追蹤的命名方式。建議規則如下：

- 使用小寫英文、數字與連字號。
- 避免空格、模糊縮寫與只有版本號的檔名。
- 檔名應包含用途或主題，例如 `kanban-card-icon.svg`、`brand-mark-primary.png`。
- 同一資產的原始檔與匯出檔應能從檔名辨識關聯。
- 若需要版本，可使用明確版本尾綴，例如 `brand-mark-primary-v2.ai`。

目前的 `works/illustrator/everline_p1.ai` 可視為既有原始檔；後續若再重命名，應先確認是否已有外部引用。Illustrator 原始專案檔統一存放於 `works/illustrator/`，此類工作檔命名不受本節命名規則約束。

### 4. 檔案版本管理規則

向量原始檔與匯出圖片應避免混放。版本管理原則如下：

- 原始向量檔與 HTML/CSS 候選元件原型皆放在 `works/`（分別位於 `works/illustrator/`、`works/html/`）。
- 從向量檔轉出的圖片放在 `exports/`。
- 不用匯出圖片覆蓋原始設計檔。
- 若同一張圖有多種用途，應在 `exports/` 中用子資料夾或檔名標示用途。
- 重大設計方向變更應在 `docs/` 中記錄原因與影響。

### 5. 匯出圖片資料夾規劃

Everline 需要一個專門存放向量繪圖專案檔轉存圖片的資料夾。建議使用 `exports/`：

- `exports/` 存放由 `works/` 內向量檔匯出的圖片。
- 可依格式或用途建立子資料夾，例如 `exports/png/`、`exports/svg/`、`exports/webp/`。
- 若某些匯出圖是給特定產品使用，可建立產品子資料夾，例如 `exports/taylor-kanban/`。
- 匯出圖應被視為可再產生的交付物；真正的設計來源仍以 `works/` 中的向量原始檔為準。

## 建議資料夾結構

```text
Everline Design/
├─ docs/
│  └─ spec.md
├─ works/
│  ├─ illustrator/
│  │  └─ everline_p1.ai
│  └─ html/
├─ exports/
│  ├─ png/
│  ├─ svg/
│  └─ webp/
├─ references/
└─ tokens/
```

各資料夾責任如下：

- `docs/`：保存規格、決策紀錄、使用指南與後續設計系統文件。
- `works/`：保存可編輯設計來源，包含 `works/illustrator/` 的向量原始專案檔（例如 `.ai`）與 `works/html/` 的 HTML/CSS 候選元件原型。
- `exports/`：保存由向量原始檔轉存出的圖片，例如 `.png`、`.svg`、`.webp`。
- `references/`：保存參考素材、產品截圖、風格參考或競品資料。
- `tokens/`：未來若需要設計 token，可保存 JSON、CSS variables 或其他可被前端使用的格式。

初版不需要立即建立所有資料夾；應在實際需要保存對應內容時建立，避免空資料夾過早膨脹。

## 技術與工作流考量

- 本專案目前以文件與設計資產管理為主，不預設任何前端框架。
- 若未來要與 Taylor Kanban 程式碼整合，應先驗證目標 repo 的實際結構與技術棧。
- 設計 token 若要導入前端，應優先選擇能被產品直接消費的格式，例如 CSS variables 或 JSON。
- 匯出圖片應保留來源關係，避免出現無法追溯由哪個向量檔產生的圖片。
- 對外發布或產品內使用的圖片，應確認授權、來源與是否包含不應公開的內容。
- 文件新增或調整時，應優先維持清楚責任邊界，不把設計決策、輸出流程與前端實作細節混在同一段落中。

## 成功指標

Everline 初版視為成功，需符合以下條件：

- 未來 agent 能讀完 `docs/spec.md` 後理解 Everline 的目的與邊界。
- 新增向量原始檔或匯出圖片時，能明確知道應放在 `works/` 或 `exports/`。
- Taylor Kanban 與其他延伸產品能被描述為共用同一套設計語言的目標產品，而不是各自維護分散規則。
- 文件沒有把未驗證的 Taylor Kanban repo 內容寫成事實。
- 後續可以在不推翻初版結構的前提下，逐步補齊 token、component、icon 與匯出規範。

## 後續待辦

1. 驗證 Taylor Kanban repo 的正確連結與實際技術結構。
2. 視需要建立 `exports/`，並決定要先依格式還是產品用途建立子資料夾。
3. 補充 Everline 的具體視覺原則，例如色彩、線條、字體、間距與動效方向。
4. 若 Taylor Kanban 需要前端整合，新增 design token 文件與實作格式。
5. 若向量檔數量增加，建立更明確的資產索引或 changelog。

<!-- HARDENED -->

## 關鍵規則

本區塊取代舊版「工程防護層」（Contract／Invariants／Edge Cases／Acceptance Criteria／Test Plan／Drift Risk Analysis）。舊版是套用軟體工程規格範本硬套上去的格式，這個專案沒有可執行程式碼，套用「Test Plan」「可自動化」這類詞彙只會誤導讀者以為有東西可以跑——實際上全部都是人工檢查。2026-07-23 精簡為兩段：FROZEN Decisions（不能隨便推翻的既定事實）與 Open Questions（還沒決定的事）。資料夾責任與凍結邊界的完整規則見 `AGENTS.md`，此處不重複。

### FROZEN Decisions：凍結決策

- [FROZEN] Everline 的定位是「圖形界面設計語言與設計系統專案」，不是單一前端 app、單一品牌圖檔或單次繪圖任務。若變更，需同步更新專案概述、核心問題、目標、非目標與成功指標。
- [FROZEN] `works/` 是可編輯設計來源資料夾，涵蓋 Illustrator 向量原始檔（`works/illustrator/`）與 HTML/CSS 候選元件原型（`works/html/`，2026-07-19 新增；構思仍以 Illustrator 為主，元件定案後才轉為 HTML/CSS）。若再變更，需同步更新目前已知專案狀態、檔案版本管理規則與資料夾結構。
- [FROZEN] `exports/` 是向量檔轉存圖片的建議資料夾。若變更，需同步更新匯出圖片資料夾規劃與資料夾結構。
- [FROZEN] Taylor Kanban repo 未驗證前，不記錄其內部技術細節。若變更，需先補上驗證來源、驗證日期與影響範圍。
- [FROZEN] 初版不直接實作前端元件庫，也不重構 Taylor Kanban。若變更，需建立新的實作規格或任務文件。
- [FROZEN] Everline 元件放大與縮小使用 8 px 尺寸級距並維持內部比例。若變更，需同步更新 design token、元件規格與既有候選向量稿。

### Open Questions：未決問題

- 待確認：Taylor Kanban 的正確 repo 連結與存取權限是什麼？
- 待確認：`exports/` 初期要依格式分層，還是依產品用途分層？
- 待確認：Everline 的第一批設計 token 是否需要直接支援 Taylor Kanban 前端使用？
- 待確認：是否需要建立資產索引文件，例如 `docs/assets-index.md`？
- 待確認：是否需要定義正式版本號規則，例如 `v0.1`、`v0.2` 或日期版號？
- 待確認：元件規格文件的結構與放置方式（是否需要建立 `docs/components.md` 統一收錄，還是維持目前依批次拆檔的 `docs/design-system-v0.1-*-draft.md` 慣例）。2026-07-23 從已刪除的 `docs/TODO.md` 移入，避免刪檔時遺失。
- ✅ 已確認：`docs/spec.md` 是目前主要規格文件位置。
- ✅ 已確認：`works/` 用於存放可編輯設計來源，涵蓋 Illustrator 向量繪圖專案檔與 HTML/CSS 候選元件原型（2026-07-19 起）。
- ✅ 已確認：Everline 初版同時涵蓋設計系統方向與資料夾工作流。

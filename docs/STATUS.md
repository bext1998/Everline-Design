# Everline 狀態

最後更新：2026-07-19

## 收尾狀態

- 狀態：`in-progress`
- 原因：目前已有可辨識的設計來源與預覽，但元件規格、審核狀態與 Taylor Kanban 技術整合仍未完成。
- 本次進度（2026-07-19）：新增單一候選總表 `works/everline-components-master.svg`，重畫既有 9 類元件＋Badge/Tag＋Inline alert，並補上第一批 6 類新元件（Select/Combobox、Menu/Context menu、Tabs、Tooltip、Modal/Dialog、Toast/Snackbar），共 17 類 candidate；同步確認 UI 字型為 Noto Sans TC。第二批、第三批（共 15 類）待使用者確認本批後再排入。

## 目前狀態

- 專案目前以設計語言、GUI 元件參考與向量原始檔管理為主，尚未進入前端元件庫實作。
- 主要規格入口為 `docs/spec.md`。
- 元件參考資料為 `references/gui-components-reference.md`。
- 向量原始檔目前位於 `works/illustrator/everline_p1.ai`。
- 2026-07-13 的設計草圖已更新 Everline Design Language 的第一批可視化 UI 語彙，包含預設按鈕、圖示按鈕、開關按鈕、分割按鈕、下拉選單、單行輸入框、多行文字輸入框與基礎色票。
- 對應的可編輯來源是 `works/illustrator/everline_p1.ai`，目前預覽是 `works/eve工作區域 1.png`。
- `works/everline_p1.svg` 與 `works/everline_p1.pdf` 是 2026-07-16 提供的交換格式；已驗證兩者畫板皆為 1920 × 1080，視覺內容一致。
- 2026-07-19：`works/everline_p1.ai` 搬至 `works/illustrator/`，經使用者同意（`works/72ppi/` 攤平併入 `works/` 見下方「專案整理」）。
- 目前持續維護的完整候選視覺來源是 `works/everline-components-master.svg`（2026-07-19 建立，共 17 類 candidate，明細見上方「收尾狀態」），對應預覽為 `exports/everline-components-master.png`。
- `works/everline-agent-components-v0.1.svg`（原 Badge／Tag、Inline alert 候選稿）已由上述總表取代，標記 `superseded-by`，保留為歷史快照、不再更新；對應舊預覽 `exports/everline-agent-components-v0.1.png` 同樣保留不動。
- 候選規範與 token 分別位於 `docs/design-system-v0.1-draft.md` 與 `tokens/everline-draft.tokens.json`；已涵蓋來源中的 Button、Icon button、Switch、Checkbox、Radio、Split button／Dropdown、Text input／Textarea、Color swatch，以及 Badge／Tag、Inline alert、Select／Combobox、Menu／Context menu、Tabs、Tooltip、Modal／Dialog、Toast／Snackbar，整體尚未定稿。

## 已確認觀察

- 多數 UI 元素具備重複使用價值，後續適合整理為正式元件規格，而不是只停留在單次畫面示意。
- 已出現可共用的狀態模式：default、disabled、danger、outline、on/off、focused。
- 目前畫面偏向深色工作型工具介面，適合延伸成 Taylor 系列產品共用的設計語言。

## 已知限制

- Taylor Kanban repo 與實際技術結構仍未驗證，不應把前端實作細節寫成事實。
- `works/illustrator/everline_p1.ai` 的內部圖層、元件命名與可重用結構尚未文件化。
- 目前已有候選 design token 與第一批完整 component spec 草稿，但尚未建立正式穩定 schema、所有互動狀態的視覺稿或 assets index。
- 原始 SVG 的文字已轉外框，無法由檔案驗證原始字型；字型已由使用者於 2026-07-19 直接確認為 Noto Sans TC，不再是待確認項目。
- `works/everline-components-master.svg` 中既有元件是依已驗證量測值重建，非逐位元組複製原始檔案；新增的 6 類第一批元件僅畫出核心狀態，完整互動／無障礙狀態仍待補齊。

## Issue / PR

- 目前未取得可驗證的 Issue 或 PR 關聯；不自行建立或推測關聯。
- `MAZE_PROJECT.md` 不存在於目前 repository，因此無法補充專案層級的 Issue／PR 對應資料。

## 未追蹤本機工作

- `works/gude-2026-07-13.log`、`works/gude-2026-07-19.log` 為 Illustrator 產生的鎖定／暫存 log，重複出現；2026-07-19 已加入 `.gitignore`（`works/**/*.log`），不必再逐次確認是否納入提交。
- `works/TaylorConceptMockup1.svg`（Taylor 主視窗結構概念圖，`works/illustrator/TaylorConceptMockup1.ai` 的匯出）為 2026-07-19 新增，僅作結構參考，非 Everline 樣式來源。

## 專案整理（2026-07-19）

- 新增 `.gitignore`：排除第三方 Lucide 素材（見下）與 Illustrator log／鎖定檔。
- `docs/lucide-icons-1.24.0/`、`docs/lucide-icons-1.24.0.zip`、`docs/lucide-font-1.24.0.zip` 已從 git 追蹤移除（`git rm --cached`，檔案仍留在本機）並改名為 `docs/lucide-icons/`、`docs/lucide-icons.zip`、`docs/lucide-font.zip`；不重寫既有 git 歷史（避免 force push 風險），已進歷史的舊版本內容視為沉沒成本保留。新環境 clone 本倉庫不會取得這些檔案，需要時自行從 Lucide 上游重新下載。
- `works/illustrator/` 為新增的 Illustrator 專案檔資料夾，收納 `everline_p1.ai`、`everline.ai`（色票）、`TaylorConceptMockup1.ai`；此類工作檔命名不受資產命名規則約束。
- `works/72ppi/` 子資料夾已攤平，內容併入 `works/` 上一層。

## 驗證與同步

- 已檢查工作區狀態、目前分支、遠端與最近提交。
- 設計資產以目前可讀取的 Illustrator 原始檔與 PNG 預覽為準；本專案沒有可執行的測試、lint 或 build 流程。
- 新總表 SVG 已用 headless Chrome 渲染為 PNG 並目視核對版面、色票、間距與各元件狀態，未發現重疊或缺字；`tokens/everline-draft.tokens.json` 已通過 JSON 格式驗證。
- 最後同步時間：2026-07-19。

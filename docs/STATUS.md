# Everline 狀態

最後更新：2026-07-16

## 收尾狀態

- 狀態：`in-progress`
- 原因：目前已有可辨識的設計來源與預覽，但元件規格、審核狀態與 Taylor Kanban 技術整合仍未完成。
- 本次進度：保留既有 Illustrator 工作內容，新增一批由現有 SVG／PDF 延伸的候選元件、token 草稿、規格文件與 PNG 校準預覽。

## 目前狀態

- 專案目前以設計語言、GUI 元件參考與向量原始檔管理為主，尚未進入前端元件庫實作。
- 主要規格入口為 `docs/spec.md`。
- 元件參考資料為 `references/gui-components-reference.md`。
- 向量原始檔目前位於 `works/everline_p1.ai`。
- 2026-07-13 的設計草圖已更新 Everline Design Language 的第一批可視化 UI 語彙，包含預設按鈕、圖示按鈕、開關按鈕、分割按鈕、下拉選單、單行輸入框、多行文字輸入框與基礎色票。
- 對應的可編輯來源是 `works/everline_p1.ai`，目前預覽是 `works/72ppi/eve工作區域 1.png`。
- `works/72ppi/everline_p1.svg` 與 `works/72ppi/everline_p1.pdf` 是 2026-07-16 提供的交換格式；已驗證兩者畫板皆為 1920 × 1080，視覺內容一致。
- Agent 延伸候選稿位於 `works/everline-agent-components-v0.1.svg`，目前包含 Badge／Tag 與 Inline alert；對應預覽為 `exports/everline-agent-components-v0.1.png`。
- 候選規範與 token 分別位於 `docs/design-system-v0.1-draft.md` 與 `tokens/everline-draft.tokens.json`；已涵蓋來源中的 Button、Icon button、Switch、Checkbox、Radio、Split button／Dropdown、Text input／Textarea、Color swatch，以及 Agent 延伸的 Badge／Tag、Inline alert，整體尚未定稿。

## 已確認觀察

- 多數 UI 元素具備重複使用價值，後續適合整理為正式元件規格，而不是只停留在單次畫面示意。
- 已出現可共用的狀態模式：default、disabled、danger、outline、on/off、focused。
- 目前畫面偏向深色工作型工具介面，適合延伸成 Taylor 系列產品共用的設計語言。

## 已知限制

- Taylor Kanban repo 與實際技術結構仍未驗證，不應把前端實作細節寫成事實。
- `works/everline_p1.ai` 的內部圖層、元件命名與可重用結構尚未文件化。
- 目前已有候選 design token 與第一批完整 component spec 草稿，但尚未建立正式穩定 schema、所有互動狀態的視覺稿或 assets index。
- 原始 SVG 的文字已轉外框，無法由檔案驗證原始字型；候選稿暫用 Microsoft JhengHei，仍需人工確認。

## Issue / PR

- 目前未取得可驗證的 Issue 或 PR 關聯；不自行建立或推測關聯。
- `MAZE_PROJECT.md` 不存在於目前 repository，因此無法補充專案層級的 Issue／PR 對應資料。

## 未追蹤本機工作

- `works/gude-2026-07-13.log` 是未追蹤且目前被其他程序鎖定的 log；它不是正式向量來源，本次不納入提交，也不刪除。

## 驗證與同步

- 已檢查工作區狀態、目前分支、遠端與最近提交。
- 設計資產以目前可讀取的 Illustrator 原始檔與 PNG 預覽為準；本專案沒有可執行的測試、lint 或 build 流程。
- 最後同步時間：2026-07-16。

# Everline 狀態

最後更新：2026-07-09

## 目前狀態

- 專案目前以設計語言、GUI 元件參考與向量原始檔管理為主，尚未進入前端元件庫實作。
- 主要規格入口為 `docs/spec.md`。
- 元件參考資料為 `references/gui-components-reference.md`。
- 向量原始檔目前位於 `works/everline_p1.ai`。
- 今天的設計草圖已整理出 Everline Design Language 的第一批可視化 UI 語彙，包含預設按鈕、圖示按鈕、開關按鈕、分割按鈕、下拉選單、單行輸入框與基礎色票。

## 已確認觀察

- 多數 UI 元素具備重複使用價值，後續適合整理為正式元件規格，而不是只停留在單次畫面示意。
- 已出現可共用的狀態模式：default、disabled、danger、outline、on/off、focused。
- 目前畫面偏向深色工作型工具介面，適合延伸成 Taylor 系列產品共用的設計語言。

## 已知限制

- Taylor Kanban repo 與實際技術結構仍未驗證，不應把前端實作細節寫成事實。
- `works/everline_p1.ai` 的內部圖層、元件命名與可重用結構尚未文件化。
- 目前尚未建立正式 design token、component spec 或 assets index。

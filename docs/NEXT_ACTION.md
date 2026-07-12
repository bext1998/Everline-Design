# Everline 下一步

最後更新：2026-07-09

## 下一個 Session 的目標

把今天畫出的可重用 UI 元素整理成 Everline v0.1 的元件清單與命名規則，先讓後續設計、匯出與前端實作有一致語言。

## 建議行動

1. 盤點 `works/everline_p1.ai` 中已畫出的元件種類。
2. 建立或補充第一版元件規格，優先涵蓋 button、icon button、switch、split button、dropdown、text input、color swatch。
3. 為元件狀態建立一致命名，例如 default、disabled、danger、outline、focused、on、off。
4. 從目前色票整理初步 color token 候選，不急著定稿，但要記錄用途與語意。
5. 視需要建立 `docs/components.md` 或 `docs/assets-index.md`，避免把所有細節塞回 `docs/spec.md`。

## 需要決定的事項

- Everline v0.1 要先做「元件規格文件」，還是先做「design token 文件」？
- 今天畫出的按鈕與輸入框是否作為正式 v0.1 起點，或先標記為草稿候選？
- 是否要從 `works/everline_p1.ai` 匯出一張參考 PNG 放入 `exports/`，方便未來不用開 Illustrator 也能快速確認畫面？

## 暫不處理

- 不直接實作前端元件庫。
- 不修改 Taylor Kanban 程式碼。
- 不重命名或搬移 `works/everline_p1.ai`。

# Everline 下一步

最後更新：2026-07-15

## 下一個 Session 的目標

把目前已畫出的可重用 UI 元素整理成 Everline v0.1 的元件規格草稿，先讓後續設計、匯出與前端實作有一致語言。

## 建議行動

1. 盤點 `works/everline_p1.ai` 的圖層、群組與目前 7 類初版元件，確認可重用結構；其中 text input 含單行與多行變體。
2. 建立第一版元件規格草稿，優先涵蓋 button、icon button、switch、split button、dropdown、text input（單行／多行）與 color swatch。
3. 為元件狀態建立一致命名，例如 default、disabled、danger、outline、focused、on、off。
4. 從目前色票整理初步 color token 候選，記錄用途與語意但先不定稿。
5. 再決定建立 `docs/components.md` 或 `docs/assets-index.md`，避免過早擴張文件結構。

## 需要決定的事項

- Everline v0.1 要先做「元件規格文件」，還是先做「design token 文件」？
- 今天畫出的按鈕與輸入框是否作為正式 v0.1 起點，或先標記為草稿候選？
- Split button opened variant 是否採用此候選：關閉時為完整膠囊；開啟時按鈕保留上方大圓角、下緣變直，選單面板上緣接齊、底部保留圓角，高度依選項內容決定？
- 是否要從 `works/everline_p1.ai` 匯出一張參考 PNG 放入 `exports/`，方便未來不用開 Illustrator 也能快速確認畫面？
- 目前 `works/72ppi/eve工作區域 1.png` 是否要在確認輸出來源、格式與用途後，再整理到正式 `exports/`？

## 暫不處理

- 不直接實作前端元件庫。
- 不修改 Taylor Kanban 程式碼。
- 不重命名或搬移 `works/everline_p1.ai`。

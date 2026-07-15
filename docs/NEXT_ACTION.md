# Everline 下一步

最後更新：2026-07-15

## 下一個 Session 的目標

校準第一批 Agent 延伸元件與候選 token，再決定哪些內容能升格為 Everline v0.1 的正式起點。

## 建議行動

1. 由使用者檢視 `docs/design-system-v0.1-draft.md` 與 `exports/everline-agent-components-v0.1.png`，確認既有元件規格化結果及 Badge／Tag、Inline alert 的視覺密度是否符合 Everline。
2. 依已確認的 8 px 縮放級距，確認候選 compact 元件高度採 40 px，或統一使用既有 48 px 控制高度。
3. 確認 UI 字型；原始 SVG 文字已轉外框，目前無法直接取得原字型資訊。
4. 盤點 `works/everline_p1.ai` 的圖層與群組命名，確認已規格化元件能否直接映射至 Illustrator 可重用結構。
5. 校準後再將確認值由 `candidate` 升格；尚未確認前不加入 success／warning 色彩。

## 需要決定的事項

- ✅ 已決定：元件規格與 design token 以同一批 candidate 校準稿同步開始。
- 今天畫出的按鈕與輸入框是否作為正式 v0.1 起點，或先標記為草稿候選？
- Agent 延伸的 Badge／Tag 與 Inline alert 是否符合既有視覺語言，哪些變體需要保留？
- Split button opened variant 是否採用此候選：關閉時為完整膠囊；開啟時按鈕保留上方大圓角、下緣變直，選單面板上緣接齊、底部保留圓角，高度依選項內容決定？
- 是否要從 `works/everline_p1.ai` 匯出一張參考 PNG 放入 `exports/`，方便未來不用開 Illustrator 也能快速確認畫面？
- 目前 `works/72ppi/eve工作區域 1.png` 是否要在確認輸出來源、格式與用途後，再整理到正式 `exports/`？

## 暫不處理

- 不直接實作前端元件庫。
- 不修改 Taylor Kanban 程式碼。
- 不重命名或搬移 `works/everline_p1.ai`。

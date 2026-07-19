# Everline 下一步

最後更新：2026-07-19

## 下一個 Session 的目標

校準第一批新元件（Select/Combobox、Menu/Context menu、Tabs、Tooltip、Modal/Dialog、Toast/Snackbar）與重畫的既有元件，確認 `works/everline-components-master.svg` 的視覺結果後，再決定是否排入第二批（Sidebar／Toolbar／Card／List／Data table／Kanban column／Task card）。

## 建議行動

1. 由使用者檢視 `docs/design-system-v0.1-draft.md` 與 `exports/everline-components-master.png`，確認總表中 17 類元件（既有 9 類＋Badge/Tag＋Inline alert 重畫＋第一批 6 類新元件）的視覺密度、間距與狀態是否符合 Everline 既有語言。
2. 依已確認的 8 px 縮放級距，確認候選 compact 元件高度採 40 px，或統一使用既有 48 px 控制高度（本次 Menu 40px、Toast 56px 皆為候選值，未經此項確認）。
3. ✅ 已確認：UI 字型為 Noto Sans TC（2026-07-19 使用者直接確認），不再是待確認項目。
4. 盤點 `works/illustrator/everline_p1.ai` 的圖層與群組命名，確認已規格化元件能否直接映射至 Illustrator 可重用結構；`works/everline-components-master.svg` 目前只是候選視覺稿，尚未回填至 Illustrator 主來源。
5. 校準後再將確認值由 `candidate` 升格；尚未確認前不加入 success／warning 色彩。
6. 確認 Modal/Dialog 是否需要補畫遮罩（scrim）、Select/Combobox 是否需要搜尋變體、Tooltip 的觸控裝置替代呈現方式——這三項在本批規格中都標記為尚未定義。

## 需要決定的事項

- ✅ 已決定：元件規格與 design token 以同一批 candidate 校準稿同步開始。
- ✅ 已決定：UI 字型為 Noto Sans TC。
- ✅ 已決定：後續所有候選元件統一維護在單一總表 `works/everline-components-master.svg`，不再為每批新增獨立檔案。
- 今天畫出的按鈕與輸入框是否作為正式 v0.1 起點，或先標記為草稿候選？
- 總表中重畫的 Badge／Tag、Inline alert 是否與原候選稿視覺一致，是否需要微調？
- Split button opened variant 是否採用此候選：關閉時為完整膠囊；開啟時按鈕保留上方大圓角、下緣變直，選單面板上緣接齊、底部保留圓角，高度依選項內容決定？（本次 Select/Combobox 的 open 變體沿用同一邏輯，一併確認）
- 第二批（Sidebar／Toolbar／Card／List／Data table／Kanban column／Task card）是否照原順序進行，還是依實際產品需求調整優先序？

## 暫不處理

- 不直接實作前端元件庫。
- 不修改 Taylor Kanban 程式碼。
- 不再重命名或搬移 `works/illustrator/everline_p1.ai`（2026-07-19 已完成一次搬移，見 `docs/STATUS.md`）。
- 不在使用者校準第一批新元件前，開始第二批。

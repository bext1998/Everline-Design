# Everline 下一步

最後更新：2026-07-20

## 下一個 Session 的目標

第二批 7 類元件（Sidebar/Navigation rail、Toolbar、Card/Tile、List、Data table、Task card、Kanban column）的 SVG candidate 已於 2026-07-20 審查通過（見 `docs/STATUS.md`）。下一步是把審查通過的元件個別轉為 `works/html/` 的 HTML/CSS 候選規格（「畢業」）；本次會議未執行，另約時間進行。

## 建議行動

1. 依 `docs/design-system-v0.1-batch2-draft.md` 逐一把第二批元件轉為 HTML/CSS，比照 `AGENTS.md`「HTML/CSS 候選元件原型」規則：CSS custom properties 對應 `tokens/everline-draft.tokens.json` 既有語意 token，不另建命名；轉換後在 `works/everline-components-batch2.svg` 對應區塊標記 `superseded-by`。
2. 轉換前建議先決定第二批刻意擱置的三個跨元件問題（拖曳／拖放視覺、空狀態／載入中佔位、密度／分頁），避免 HTML/CSS 版本又各自長出不同做法。
3. 待確認：compact 元件統一採 40px 還是 48px——第二批的 Toolbar compact（40px）與 Sidebar/Card/List/Data table（48px）目前並存，未有統一決定。
4. 盤點 `works/illustrator/everline_p1.ai` 的圖層與群組命名；第一批、第二批的 SVG 候選稿都尚未回填至 Illustrator 主來源。

## 需要決定的事項

- ✅ 已決定：Illustrator 構思 → SVG 候選＋人類審查 → 確認後轉 HTML/CSS（「畢業」）的完整流程。細節見 `AGENTS.md`、`docs/spec.md`、`docs/STATUS.md`。
- ✅ 已決定：`component.list-item.*` 共用 token 只套用於 List／Data table／Kanban column，不回頭改動 Select／Split button／Menu。
- 待確認：compact 元件高度統一（見上方建議行動 3）。
- 待確認：第三批（桌面工具與補充能力，共 8 類）是否照 `docs/TODO.md` 原順序進行。

## 暫不處理

- 不直接實作前端元件庫。
- 不修改 Taylor Kanban 程式碼。
- 不再重命名或搬移 `works/illustrator/everline_p1.ai`。
- 第二批的 HTML/CSS 轉換本次不執行，已審查通過但另約時間進行。

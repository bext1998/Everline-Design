# Everline 接手筆記

給下一個 session 的 agent：這是最快進入狀況的地方，只給「現在是什麼狀態」的地圖，不重複規則本身或詳細規格內容。規則去讀 `AGENTS.md`；這裡讀不到答案時，才去讀對應的完整文件。

## 30 秒看懂現況

- Everline 是 Taylor Kanban 的圖形介面設計語言，目前是規格＋SVG 候選稿階段，還沒有可執行的前端元件庫。
- 元件流程：Illustrator 構思 → SVG 候選稿＋人類審查 → 確認沒問題後轉 `works/html/` 的 HTML/CSS（「畢業」，之後才是該元件的規格權威來源，SVG 版本變歷史快照）。
- 進度：第一批 18 類（`works/everline-components-master.svg`）、第二批 7 類（`works/everline-components-batch2.svg`）皆已完成 SVG candidate 並經使用者審查通過。**尚未有任何元件「畢業」成 HTML/CSS**——`works/html/` 目前是空的。

## 最近一次工作（2026-07-20）

- 確立並寫入完整的「Illustrator → SVG 候選＋審查 → HTML/CSS 畢業」流程規則（`AGENTS.md`／`docs/spec.md`／`docs/STATUS.md` 皆已同步；過程中有一次方向誤解又修正，教訓見下）。
- 完成第二批 7 類元件（Sidebar/Navigation rail、Toolbar、Card/Tile、List、Data table、Task card、Kanban column）的 SVG candidate，規格見 `docs/design-system-v0.1-batch2-draft.md`。
- 新增共用 `component.list-item.*` token（只套用於 List／Data table／Kanban column，未回頭改動 Select／Split button／Menu）。
- 使用者審查時抓出並修正 4 個視覺問題（Toolbar 圖示未對齊同一水平線、Toolbar 兩容器零間距黏在一起、Data table 排序箭頭沒貼齊文字、Kanban 卡片高度不一致；細節見 `docs/STATUS.md` 2026-07-20 條目）。
- 精簡了多份文件（`docs/TODO.md`、`docs/design-system-v0.1-draft.md`、`README.md`、`docs/STATUS.md`）。

**兩個值得記住的教訓**：(1) 使用者很在意文件／候選稿是否臃腫到 agent 讀不完——新內容預設考慮開新檔案（例如第二批 SVG 與規格都獨立成檔），不要無限累加進舊檔案。(2) 使用者說「把 X 換成 Y」時，不要假設 Y 完全取代 X 在流程裡的角色——先確認 Y 接手的是哪一段（這次曾誤以為 HTML/CSS 會取代 SVG 審查階段，實際上 SVG 審查沒被取代，只是審查通過後多了 HTML/CSS 這一步）。(3) 發現一個手繪圖示對齊錯誤時，要重新檢查整組同類圖示找出根本原因，不要只修被指出的那一個實例。

## 接下來要做什麼

細節與待決事項見 `docs/NEXT_ACTION.md`（每次工作結束都應該更新那份，不要在這裡重複列）。目前摘要：第二批已審查通過的 7 類元件轉為 HTML/CSS（「畢業」）尚未開始，另約時間進行。

## 這個 repo 的文件地圖

- `AGENTS.md`：所有 agent 必須遵守的規則、資料夾責任、凍結邊界。**規則問題先讀這個。**
- `docs/spec.md`：正式規格、FROZEN Decisions、工程防護層——規則變更要跟這份同步。
- `docs/STATUS.md`：目前已確認的現況，按時間記錄決策與變更。
- `docs/NEXT_ACTION.md`：下一步待辦與待決問題。
- `docs/TODO.md`：元件層級的進度勾選清單。
- `docs/design-system-v0.1-draft.md` / `docs/design-system-v0.1-batch2-draft.md`：各元件的視覺規格（用途／結構／狀態／無障礙），依批次獨立成檔。
- `tokens/everline-draft.tokens.json`：候選 design token（DTCG 格式）。
- `works/illustrator/`：Illustrator 構思來源；`works/everline-components-master.svg`（第一批）、`works/everline-components-batch2.svg`（第二批）：SVG 候選稿；`works/html/`：HTML/CSS 候選稿（目前尚無內容）。
- `references/gui-components-reference.md`：外部 GUI 元件研究，僅供參考，不是正式規格。

## 維護這份筆記

每次重大進度（完成一批元件、確立新規則、修正衝突決策）結束時，更新「最近一次工作」與「30 秒看懂現況」，避免這份筆記本身變成又一個過期文件。

# Everline 接手筆記

給下一個 session 的 agent：這是最快進入狀況的地方，只給「現在是什麼狀態」的地圖，不重複規則本身或詳細規格內容。規則去讀 `AGENTS.md`；這裡讀不到答案時，才去讀對應的完整文件。

## 30 秒看懂現況

- Everline 是 Taylor Kanban 的圖形介面設計語言，目前是規格＋候選設計來源階段，還沒有可執行的前端元件庫。
- 元件流程：Illustrator 構思 → SVG 候選稿＋人類審查 → 確認沒問題後轉 `works/html/` 的 HTML/CSS（「畢業」，之後才是該元件的規格權威來源，SVG 版本變歷史快照）。
- 進度：第一批 17 類（`works/everline-components-master.svg`）已完成 SVG candidate；第二批 7 類的權威候選規格已畢業至 `works/html/batch2/`。`works/everline-components-batch2.svg` 是歷史視覺快照。

## 最近一次工作（2026-07-23）

- 將第二批 7 類元件轉為 `works/html/batch2/` 的框架中立 HTML/CSS/JS 互動型錄；CSS custom properties 對應既有候選 token，未新增 token 或套件。
- 實作並驗收 Sidebar 模式、Toolbar 選取、Card／Task card 選取、兩種 List 變體、Data table 排序與選取、Kanban normal／empty／limit-reached；不含拖放、loading、分頁、密度與 resizing。
- `works/everline-components-batch2.svg` 已用 `superseded-by` 標記為歷史快照；規格與狀態文件已同步。
- 事後發現並修正 3 個真實 bug（Kanban 欄寬 token 誤植、`limit-reached` 卡片數與徽章不符、Kanban 欄位與卡片背景同色導致無法辨識分界），詳見 `docs/STATUS.md`；並把畢業前的驗證規則寫進 `AGENTS.md`。
- **移除 `docs/TODO.md`、`docs/NEXT_ACTION.md`**：元件層級待辦與下一步規劃改用 GitHub Issues 追蹤（`gh issue list`），不再靠 markdown 檔案人工維護，避免兩邊飄移、也不用每次都問 agent「接下來要做什麼」。
- 精簡 `docs/spec.md`：拿掉套用軟體工程規格範本但實際上不可執行的 Contract／Acceptance Criteria／Test Plan／Drift Risk Analysis（尤其是「Test Plan」——這個專案沒有程式碼可以跑，取這個名字會誤導讀者），只留 FROZEN Decisions 與 Open Questions。

**教訓**：(1) 使用者很在意文件／候選稿是否臃腫到 agent 讀不完——新內容預設考慮開新檔案，不要無限累加進舊檔案；但反過來，套用制式規格範本硬湊齊「完整性」也是一種臃腫，格式本身不能凌駕在「這個專案實際需要什麼」之上。(2) 使用者說「把 X 換成 Y」時，不要假設 Y 完全取代 X 在流程裡的角色——先確認 Y 接手的是哪一段。(3) 發現一個手繪圖示對齊錯誤時，要重新檢查整組同類圖示找出根本原因，不要只修被指出的那一個實例。(4) SVG 審查通過只代表視覺定案，不代表內容邏輯（例如徽章數字）或轉成 HTML/CSS 後的 token 完整性也沒問題——這兩件事要分開驗證，而且驗證要用像素量測，肉眼比對不可靠。

## 接下來要做什麼

**不再有 `docs/NEXT_ACTION.md`**——待辦事項在 GitHub Issues，跑 `gh issue list` 看目前開著的項目。第三批（桌面工具與補充能力，共 8 類）建議的製作順序、跟第二批遺留的跨元件設計問題，都各自開了 Issue，細節見對應 Issue 內文，不在文件裡重複列。

## 這個 repo 的文件地圖

- `AGENTS.md`：所有 agent 必須遵守的規則、資料夾責任、凍結邊界。**規則問題先讀這個。**
- `docs/spec.md`：正式規格、FROZEN Decisions——規則變更要跟這份同步。
- `docs/STATUS.md`：目前已確認的現況，按時間記錄決策與變更。
- GitHub Issues：元件層級待辦、下一步規劃與待決問題，取代原本的 `docs/TODO.md`、`docs/NEXT_ACTION.md`。
- `docs/design-system-v0.1-draft.md` / `docs/design-system-v0.1-batch2-draft.md`：各元件的視覺規格（用途／結構／狀態／無障礙），依批次獨立成檔。
- `tokens/everline-draft.tokens.json`：候選 design token（DTCG 格式）。
- `works/illustrator/`：Illustrator 構思來源；`works/everline-components-master.svg`：第一批 SVG 候選稿；`works/everline-components-batch2.svg`：第二批歷史視覺快照；`works/html/batch2/`：第二批 HTML/CSS 候選規格權威來源。
- `references/gui-components-reference.md`：外部 GUI 元件研究，僅供參考，不是正式規格。

## 維護這份筆記

每次重大進度（完成一批元件、確立新規則、修正衝突決策）結束時，更新「最近一次工作」與「30 秒看懂現況」，避免這份筆記本身變成又一個過期文件。

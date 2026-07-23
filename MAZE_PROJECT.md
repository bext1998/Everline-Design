# MAZE_PROJECT — Everline Design 定位與工作流設定

> 由 `maze-project-init` 建立。Agent 讀取規格前必須先由此取得實際路徑。
> 文件搬移或設定變更時才更新；不得記錄 token、API key、密碼或私密憑證。

## 專案資訊

- 專案名稱：Everline（Everline Design）
- 目標工具：Claude Code
- 建立日期：2026-07-24

## 文件

- Spec：docs/spec.md
- Project Brief：未建立——內容與 `docs/spec.md`（專案概述、核心問題、非目標等）高度重疊，2026-07-24 經使用者確認不需要獨立檔案。
- Status：`docs/STATUS.md`（背景事實＋觀察摘要格式，非本技能標準模板格式；2026-07-24 經使用者確認保留現有格式，不套用模板覆蓋）。
- Next Action：未建立——元件層級待辦與下一步規劃改追蹤於 GitHub Issues（`gh issue list`），2026-07-23 經使用者決定不再用獨立 markdown 檔案維護。
- Decisions：未建立——正式決策記錄於 `docs/spec.md` 的 FROZEN Decisions 區塊；決策過程敘述記錄於 `docs/STATUS.md`。

## 自適應 Guidance

- Default profile：minimal（本專案是設計語言／向量資產倉庫，沒有可執行程式碼、測試或 build 流程）
- Model overlay：none
- Host capabilities：未特別設定
- Profile escalation evidence：無

## GitHub

- Repository：bext1998/Everline-Design
- Issue tracking：enabled
- Spec to Issues：disabled（2026-07-24 經使用者確認，目前所有 issue 皆為手動建立，未使用此技能）
- Priority label convention：P0–P3（2026-07-24 新採用；標籤本身尚未建立於 GitHub，新增 issue 標優先度前需先手動建立對應標籤）
- Category label convention：`enhancement`／`documentation`／`bug`／`question`（沿用 repo 既有預設標籤，未新增自訂類別標籤）
- Default assignee policy：self
- Allow label creation：yes

## 備注

無。

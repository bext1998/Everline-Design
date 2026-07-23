# Everline 狀態

最後更新：2026-07-24

本文件只保留「現在是什麼狀態」與仍然有效的背景事實，不做逐日流水帳——詳細的修正過程、逐步推理與驗證數據留在對應的 git commit 與 PR 說明裡，此處只摘要結論。定期回來把已經沉澱為背景事實或已被後續內容取代的條目收斂掉，避免這份文件本身變成又一個過期文件。

## 收尾狀態

- 狀態：`in-progress`
- 原因：目前已有可辨識的設計來源與預覽，但元件規格、審核狀態與 Taylor Kanban 技術整合仍未完成；第三批（8 類）尚未開始。
- 累計進度：第一批 17 類（`works/everline-components-master.svg`）、第二批 7 類（已畢業為 `works/html/batch2/` HTML/CSS 候選規格，權威來源；對應 SVG 為歷史快照）皆已有 candidate；兩批合計 25 類皆仍是 candidate／草稿狀態，尚未逐項確認用途、狀態、無障礙、來源追溯等完整規格條件（見 `AGENTS.md` 元件規格的 12 項完成檢查），非正式定稿。第三批（桌面工具與補充能力，8 類）與第二階段候選（19 類，非必做）尚未開始。
- 待辦、規劃與跨元件擱置決策一律追蹤在 GitHub Issues（`gh issue list`），不在此文件重複列。

## 背景事實

- 專案目前以設計語言、GUI 元件參考與向量原始檔管理為主，尚未進入前端元件庫實作；本專案沒有可執行的測試、lint 或 build 流程，驗證方式是 headless Chrome 渲染＋像素核對，不是自動化測試（`docs/spec.md` 已同步移除誤導性的「Test Plan」用詞，詳見該文件 Open Questions 前一節）。
- 主要規格入口：`docs/spec.md`；元件研究參考（非正式規格）：`references/gui-components-reference.md`。
- 向量原始來源：`works/illustrator/everline_p1.ai`（另有色票來源 `everline.ai`、結構參考 `TaylorConceptMockup1.ai`，皆放在 `works/illustrator/`，此類工作檔命名不受資產命名規則約束）。
- UI 字型已確認為 Noto Sans TC（原始 SVG 文字已轉外框，無法由檔案本身驗證，2026-07-19 由使用者直接確認，不再是待確認項目）。
- 候選規格與 token：`docs/design-system-v0.1-draft.md`（第一批）／`docs/design-system-v0.1-batch2-draft.md`（第二批）、`tokens/everline-draft.tokens.json`。`works/everline-agent-components-v0.1.svg` 已由 master 總表取代，標記 `superseded-by`，保留為歷史快照。
- HTML/CSS 候選流程：Illustrator 構思 → SVG 候選＋人類審查 → 確認後轉 `works/html/` 的 HTML/CSS（「畢業」，該元件之後以 HTML/CSS 為權威來源，SVG 標記歷史快照，不再更新）。完整規則見 `AGENTS.md`，含畢業前的 token 完整性核對與畢業後的像素級驗證要求（2026-07-23 因批次二的多起 token／CSS 落差新增）。
- 第二批畢業後歷經多輪審查與修正（欄寬 token 誤植、Kanban 欄位與卡片背景同色、`limit-reached` 內容與徽章矛盾、跨元件擱置決策拖曳／empty／分頁／resizing、`collapsed` 狀態實作後確認非需求而撤銷、`foreground-subdued` 等 8 個 token/CSS 落差），完整過程見 PR #4、#16、#18、#19 與對應 commit。教訓：批次畢業或處理舊 backlog 項目前，都要先跟已審查來源或使用者重新確認，不能把候選值或舊擱置清單直接當成已核准事實執行。
- `docs/TODO.md`、`docs/NEXT_ACTION.md`、`docs/HANDOFF.md` 已刪除（2026-07-23～24），元件待辦與下一步規劃改用 GitHub Issues，快速接手改讀本文件＋`AGENTS.md`＋`docs/spec.md`。`docs/spec.md` 的「工程防護層」也已精簡，拿掉套用軟體工程規格範本但實際上無法執行的 Contract／Acceptance Criteria／Test Plan／Drift Risk Analysis，只留 FROZEN Decisions 與 Open Questions。
- `.gitignore` 已排除第三方 Lucide 素材（`docs/lucide-icons/`、`docs/lucide-icons.zip`、`docs/lucide-font.zip`，新環境 clone 不會取得，需要時自行從上游重新下載）與 Illustrator log／鎖定檔（`works/**/*.log`）。

## 已確認觀察

- 多數 UI 元素具備重複使用價值，後續適合整理為正式元件規格，而不是只停留在單次畫面示意。
- 已出現可共用的狀態模式：default、disabled、danger、outline、on/off、focused。
- 目前畫面偏向深色工作型工具介面，適合延伸成 Taylor 系列產品共用的設計語言。

## 已知限制

- Taylor Kanban repo 與實際技術結構仍未驗證，不應把前端實作細節寫成事實。
- `works/illustrator/everline_p1.ai` 的內部圖層、元件命名與可重用結構尚未文件化；GitHub Issue #14 曾嘗試追蹤此事，已確認回填圖層命名需要人工在 Illustrator 裡操作、不是 agent 能做的事，故已結案，此限制目前無對應追蹤項目。
- 已有候選 design token 與兩批完整 component 草稿，但尚未建立正式穩定 schema、所有互動狀態的視覺稿或 assets index。
- `works/everline-components-master.svg` 中既有元件是依已驗證量測值重建，非逐位元組複製原始檔案；第一批新增的 6 類元件僅畫出核心狀態，完整互動／無障礙狀態仍待補齊。

## 未追蹤本機工作

- `works/TaylorConceptMockup1.svg`（Taylor 主視窗結構概念圖，`works/illustrator/TaylorConceptMockup1.ai` 的匯出）僅作結構參考，非 Everline 樣式來源。

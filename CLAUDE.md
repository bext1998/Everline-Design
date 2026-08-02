# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

本倉庫的完整 agent 規則、專案定位、事實優先順序、資料夾責任與驗證要求，統一定義於根目錄的 `AGENTS.md`。

**開始任何工作前，請先完整閱讀 `AGENTS.md`，並依其指示先讀 `docs/STATUS.md` 快速掌握現況，再視任務需要一併閱讀 `docs/spec.md`、`README.md`、GitHub Issues 與 `references/gui-components-reference.md`。**

此檔案不重複 `AGENTS.md` 的內容，僅作為 Claude Code 的入口指標。若兩者未來出現差異，以 `AGENTS.md` 為準，並回報使用者以便同步。

## 遠端合併同步規則

- 開始任何專案工作前，必須先執行 `git fetch --prune origin`，核對目前 `HEAD`、本機 `main`、upstream 與 `origin/main`；只 fetch 而未更新本機分支，不得宣稱已同步。
- GitHub PR 合併後，本機工作一律跟進最新 `origin/main`：本機 `main` 必須對齊遠端，後續新工作與修正也必須以最新 `origin/main` 為基準，不得繼續沿用已合併 PR 的舊 head。
- 遇到 squash／rebase 造成 SHA 不同時，先用 `git cherry`、merge-base 或實際 diff 確認 patch 是否已被遠端收納，不得因 ahead／behind 顯示分歧就重複提交相同內容。
- 同步前必須保留使用者與其他 agent 的未提交修改及本機唯一 commit；若無法在不覆蓋內容的前提下跟進遠端，停止並回報使用者，不得自行 stash、強制 reset、rebase 或 force-push。

## Claude Code worktree 規則

- 建立任何 Git worktree 前，必須先向使用者說明用途、基準分支、目標分支與完整目標路徑，並取得明確同意；不得把一般實作或派工要求視為 worktree 授權。
- 經使用者同意後，Claude Code 的 worktree 只能建立在目前倉庫根目錄的 `.claude/worktrees/<worktree-name>/`；不得放在倉庫同層、使用者目錄、暫存目錄或其他專案資料夾外的位置。
- 不得自行改用未經同意的自定義路徑。若 `.claude/worktrees/` 不適用、目標路徑已存在或建立會影響現有內容，停止並請使用者決定。
- 既有 worktree 若不符合上述位置規則，不得自行搬移或刪除；先停止相關工作並回報使用者。

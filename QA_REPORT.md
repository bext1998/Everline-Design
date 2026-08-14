# QA 驗證報告

> 日期：2026-07-27
> 功能：Issue #24 — Kanban column／Task card 與歷史 SVG 候選稿落差核對
> 測試環境：本機 wmux 0.28.0 內建 Chromium，直接載入 `file:///D:/向量繪圖/EverlineDesign/works/html/...`
> 測試者：Codex

---

## 測試結論

**整體結果**：通過

**可以 merge / release？**：可以 merge；本倉庫內容仍是 candidate 原型，不代表 production-ready

**原型決策狀態**：可供實作決策

## 核對基準

- 歷史視覺快照：`works/everline-components-batch2.svg`
- 目前候選規格：`works/html/batch2/index.html`、`works/html/batch2/styles.css`
- Token：`tokens/everline-draft.tokens.json`
- 重用情境：`works/html/taylor-main-window-prototype/`

## 逐狀態結果

| 測試 ID | 元件／狀態 | SVG 基準 | HTML/CSS 結果 | 結果 |
|---|---|---|---|---|
| T-001 | Task card / default | 240×132、radius 16、surface `#333333`、dot 8、tag 28 | 高度、radius、顏色、dot、tag 相符；型錄寬度使用 responsive grid，非固定 240 | 通過 |
| T-002 | Task card / hover | surface `#333333` 加白色 6% overlay | `color-mix(... foreground-inverse 6% ...)` | 通過 |
| T-003 | Task card / selected | 藍色 `#598AE8` 2px 描邊 | `aria-pressed=true` 使用 focus border 2px／`#598AE8` | 通過 |
| T-004 | Task card / done | 藍色 dot；標題與原 tag 降至 0.55 opacity | 已移除 SVG 不存在的第二行狀態文字，保留原 tag 並套用 0.55 opacity | 通過 |
| T-005 | Task card / blocked | 紅色 dot；紅色「已阻擋」tag | 已移除 SVG 不存在的第二行狀態文字；dot／tag 皆為 `#C1272D` | 通過 |
| T-006 | Task card / extended-fields | 高 156、due-date、24px assignee | 高 156；候選欄位與 24px assignee 皆存在，未宣告成正式 Avatar | 通過 |
| T-007 | Kanban / normal | 288×420、radius 16、背景 `#262626`、header 48、card 256×84、gap 4 | wmux 量測為 288×420、header 48、card 84、gap 4；內容從 y=48 後開始 | 通過 |
| T-008 | Kanban / empty | count 0；中央 40px 圓形加號與文案 | count 與內容一致；現有 empty-state 沿用共用 52px 圖示容器 | 通過（刻意共用模式差異） |
| T-009 | Kanban / limit-reached | 紅色 20px 高 `5/5` badge | wmux 量測 badge 20；HTML 列出五張卡，badge 與實際數量一致 | 通過 |
| T-010 | Kanban / loading | 歷史 SVG 未畫 | issue #5 後補 40px spinner，沿用共用 empty-state；無額外 header surface | 通過（刻意新增） |
| T-011 | Taylor 主視窗重用 | 不得疊加未說明裝飾 | header computed background 為透明；card 84、count badge 20 | 通過 |

## Token 與像素核對

| 項目 | SVG | Token／CSS | wmux 實測 |
|---|---:|---:|---:|
| Kanban width | 288px | 288px | 288px |
| Kanban radius | 16px | 16px | 16px |
| Kanban background | `#262626` | `#262626` | `rgb(38, 38, 38)` |
| Kanban header height | 48px | 48px | 48px |
| Kanban count badge | 20px | 20px | 20px |
| Kanban card gap | 4px | 4px | 4px |
| Embedded Task card | 84px | 84px | 84px |
| Standalone Task card | 132px | 132px | 132px |
| Extended-fields Task card | 156px | 156px | 156px |
| Status dot | 8px | 8px | 8px |
| Standalone tag | 28px | 28px | 28px |
| Kanban tag | 24px | 24px | 24px |
| Task card / tag surface | `#333333` / `#4D4D4D` | `#333333` / `#4D4D4D` | 相符 |
| done / danger | `#598AE8` / `#C1272D` | `#598AE8` / `#C1272D` | 相符 |

`component.kanban-column.header-background` 已移除：歷史 SVG 的 header 是欄位背景上的文字與 count badge，沒有獨立 surface。

## 刻意差異

- Task card 型錄寬度由 responsive grid 決定；240px 是 SVG 參考寬度，不是內容不可增長的固定寬度。
- `extended-fields` 保留候選欄位語意，不把 assignee 升格為正式 Avatar 元件。
- `empty-state` 使用 batch2 的共用 52px 圖示容器，未為 Kanban 另造一套 40px 規則。
- `loading`、`is-drag-over` 與拖曳中狀態是 HTML/CSS 階段補上的互動／非同步狀態，歷史 SVG 沒有對應畫面。
- `limit-reached` HTML 顯示五張卡，確保 `5/5` 與實際卡片數一致；歷史 SVG 為節省型錄空間只畫一張代表卡。
- Taylor 主視窗原型的流式欄寬、欄位新增按鈕與 pending badge 都有產品原型層註記，不回寫成 Everline 基礎元件樣式。

## 執行紀錄

- `wmux browser open file:///.../works/html/batch2/index.html`
- `wmux browser eval ...offsetHeight／offsetWidth／backgroundColor`
- `wmux browser screenshot`（成功回傳目前 viewport PNG）
- `wmux browser open file:///.../works/html/taylor-main-window-prototype/index.html?variant=A`
- `py -c "import json; ..."`：token JSON 可解析

## 無法測試的項目

| 項目 | 原因 |
|---|---|
| Noto Sans TC 與 SVG outline 的逐 glyph 像素差 | SVG 文字已轉外框，無法以 DOM 字型 metrics 做等價逐字比較 |
| 實際 Taylor Kanban production 整合 | 目標 repo／技術棧仍未驗證，本次只驗證倉庫內 throwaway prototype |

# Everline GUI 元件參考資料

更新日期：2026-07-08  
用途：本文件是 Everline 的 GUI / 設計系統元件參考資料，不是正式元件規格、前端元件庫或可直接商用的資產授權文件。

## 使用原則

- `references/` 內資料只作為研究與設計參考，不視為 Everline 正式產品資產。
- 若後續要公開發布、商用或納入產品素材，需重新確認圖片、商標、截圖與文件內容的授權條款。
- Taylor Kanban 的實際 repo 與技術結構尚未驗證；本文件只描述可能適用的設計情境，不聲稱其既有實作。
- 圖片若下載到本專案，必須保留來源頁面；若來源授權不適合保存，僅保留來源連結。

## 來源索引

| 來源 | 用途 | 連結 | 備註 |
| --- | --- | --- | --- |
| Material Design 3 | 元件分類、常見互動元件 | [Components](https://m3.material.io/components) | 官方文件；以 action、containment、communication、navigation、selection、text input 等目的分類。 |
| Microsoft Fluent 2 | 桌面 / 生產力產品元件與版面參考 | [Fluent 2](https://fluent2.microsoft.design/) | 官方文件；適合參考工作型應用的密度、狀態與跨平台一致性。 |
| IBM Carbon Design System | 企業級元件、表格、表單、狀態回饋 | [Components overview](https://carbondesignsystem.com/components/overview/components/) | 官方文件；列出 accordion、button、data table、modal、notification、tabs 等元件。 |
| Atlassian Design System | 協作與工作管理產品元件 | [Components](https://atlassian.design/components) | 官方文件；適合看板、任務、團隊協作介面參考。 |
| Apple Human Interface Guidelines | 系統元件與平台一致性 | [Components](https://developer.apple.com/design/human-interface-guidelines/components) | 官方文件；偏平台體驗與原生控制項。 |
| Figma Help Center | 桌面設計工具介面結構 | [Toolbar](https://help.figma.com/hc/en-us/articles/360041064174-Access-design-tools-from-the-toolbar), [Navigation and sidebar](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar) | 官方文件；本專案已下載部分截圖作為參考。 |
| Nielsen Norman Group | UI 元件定義與用語校準 | [UI Elements Glossary](https://www.nngroup.com/articles/ui-elements-glossary/) | 高可信 UX 研究來源；適合校準命名與概念。 |

## 元件參考表

| 元件分類 | 元件名稱 | 用途 | 常見狀態 | 適用於 Everline / Taylor Kanban 的情境 | 參考來源 | 圖片檔案或圖片連結 | 授權 / 使用注意事項 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 基礎操作 | Button | 觸發明確動作，例如新增、儲存、送出、套用。 | default、hover、active、focus、disabled、loading、danger | 可作為所有產品操作語言的基礎，定義 primary、secondary、tertiary 與 destructive 層級。 | [Material buttons](https://m3.material.io/components/buttons), [Carbon button](https://carbondesignsystem.com/components/button/usage/) | 來源頁面連結 | 官方參考；不得直接複製品牌樣式作為 Everline 成品。 |
| 基礎操作 | Icon button | 用圖示觸發常用工具或窄版操作，例如關閉、搜尋、更多、拖曳。 | default、hover、pressed、selected、disabled、focus | 適合工具列、看板卡片快捷操作、側欄收合與表格列操作。 | [Material icon button](https://m3.material.io/components/icon-buttons), [Fluent components](https://fluent2.microsoft.design/components) | 來源頁面連結 | 使用圖示前需確認圖示庫授權；Everline 應另定圖示風格。 |
| 基礎操作 | Toolbar | 集中呈現高頻工具，讓使用者快速切換模式或建立物件。 | default、selected、disabled、overflow、compact | 適合未來向量繪圖、看板編輯器、批次操作模式。 | [Figma toolbar](https://help.figma.com/hc/en-us/articles/360041064174-Access-design-tools-from-the-toolbar) | [images/figma-toolbar-reference.png](images/figma-toolbar-reference.png) | Figma 官方截圖，僅供內部參考與結構分析。 |
| 基礎操作 | Context menu | 根據目前選取物或游標位置提供相關操作。 | closed、open、hover item、disabled item、shortcut shown | 適合任務卡右鍵、圖形物件操作、欄位設定與快速整理。 | [Carbon menu](https://carbondesignsystem.com/components/menu/usage/), [Material menus](https://m3.material.io/components/menus) | 來源頁面連結 | 可參考行為模型，不複製視覺細節。 |
| 基礎操作 | Command menu / Actions menu | 讓使用者搜尋並執行大量命令，降低深層選單負擔。 | empty、searching、results、no results、keyboard focus | 適合 power user 流程，例如快速新增任務、切換頁面、執行批次命令。 | [Figma actions menu](https://help.figma.com/hc/en-us/articles/23570416033943-Use-the-actions-menu-in-Figma-Design) | 來源頁面連結 | 來源為產品說明；Everline 後續需另定命令命名與權限行為。 |
| 輸入與編輯 | Text field | 輸入單行文字、名稱、搜尋字串或短描述。 | empty、filled、focused、disabled、error、readonly | 適合任務標題、標籤名稱、欄位名稱、搜尋與設定值。 | [Material text fields](https://m3.material.io/components/text-fields), [Carbon text input](https://carbondesignsystem.com/components/text-input/usage/) | 來源頁面連結 | 需另定錯誤訊息、字數限制與輔助文字規則。 |
| 輸入與編輯 | Textarea | 輸入多行描述、備註、需求說明或評論。 | empty、filled、focused、disabled、error、resizing | 適合任務描述、卡片評論、設計決策紀錄。 | [Carbon text input](https://carbondesignsystem.com/components/text-input/usage/), [Apple HIG components](https://developer.apple.com/design/human-interface-guidelines/components) | 來源頁面連結 | 需要依產品情境定義高度、換行、字數與自動儲存。 |
| 輸入與編輯 | Select / Dropdown | 從固定選項中選取一項。 | closed、open、selected、disabled、error | 適合狀態、優先級、負責人、排序、篩選條件。 | [Carbon dropdown](https://carbondesignsystem.com/components/dropdown/usage/), [Material menus](https://m3.material.io/components/menus) | 來源頁面連結 | 若選項過多，應改用 searchable select 或 combobox。 |
| 輸入與編輯 | Checkbox | 多選或啟用獨立布林選項。 | unchecked、checked、indeterminate、disabled、focus | 適合批次選取任務、設定選項、清單勾選。 | [Carbon checkbox](https://carbondesignsystem.com/components/checkbox/usage/), [Material checkbox](https://m3.material.io/components/checkbox) | 來源頁面連結 | indeterminate 狀態需清楚對應父子選取關係。 |
| 輸入與編輯 | Radio button | 從互斥選項中選取一項。 | unchecked、checked、disabled、focus、error group | 適合設定頁中少量互斥選項，例如檢視模式或排序規則。 | [Carbon radio button](https://carbondesignsystem.com/components/radio-button/usage/), [Material radio button](https://m3.material.io/components/radio-button) | 來源頁面連結 | 選項多或需說明時，改用 select 或 segmented control。 |
| 輸入與編輯 | Toggle / Switch | 即時開關一個設定或狀態。 | off、on、disabled、focus、loading | 適合顯示完成項目、自動同步、通知開關。 | [Carbon toggle](https://carbondesignsystem.com/components/toggle/usage/), [Material switches](https://m3.material.io/components/switch) | 來源頁面連結 | 切換後若有副作用，需提供清楚回饋或確認。 |
| 輸入與編輯 | Slider | 在連續範圍中調整數值。 | default、dragging、disabled、with value label、range | 適合縮放、透明度、尺寸、密度或時間範圍控制。 | [Carbon slider](https://carbondesignsystem.com/components/slider/usage/), [Material sliders](https://m3.material.io/components/sliders) | 來源頁面連結 | 數值需可理解；重要精確值應搭配 input。 |
| 導覽 | Sidebar | 承載主要區域、頁面、資料夾、圖層或功能入口。 | expanded、collapsed、selected、hover、resizing | 適合看板清單、專案導覽、圖層面板、設計資產分區。 | [Figma navigation and sidebar](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar), [Carbon UI shell](https://carbondesignsystem.com/components/UI-shell/usage/) | [images/figma-navigation-sidebar-reference.png](images/figma-navigation-sidebar-reference.png) | Figma 官方截圖，僅供內部參考與結構分析。 |
| 導覽 | Top bar / App bar | 放置產品名稱、全域操作、搜尋、分享、帳號或頁面狀態。 | default、scrolled、compact、with actions、with breadcrumb | 適合 Taylor 系列產品的全域操作與目前看板上下文。 | [Material top app bar](https://m3.material.io/components/top-app-bar), [Fluent layout](https://fluent2.microsoft.design/layout) | 來源頁面連結 | 應避免把頁面內操作與全域操作混在一起。 |
| 導覽 | Tabs | 在同一上下文內切換同層內容。 | selected、hover、focus、disabled、overflow | 適合卡片詳情的活動 / 設定 / 附件，也適合設定頁分類。 | [Carbon tabs](https://carbondesignsystem.com/components/tabs/usage/), [Material tabs](https://m3.material.io/components/tabs) | 來源頁面連結 | 不應用 tabs 表示跨層級導覽。 |
| 導覽 | Breadcrumb | 顯示目前位置與上層層級，支援回溯。 | default、current、collapsed、hover | 適合多層專案、文件、設計資產分類。 | [Carbon breadcrumb](https://carbondesignsystem.com/components/breadcrumb/usage/), [Atlassian components](https://atlassian.design/components) | 來源頁面連結 | 層級過深時需定義折疊策略。 |
| 導覽 | Navigation rail | 用窄版垂直入口切換主要工作區。 | selected、hover、collapsed labels、notification | 適合桌面工具型 App 的左側主入口，例如檔案、資產、工具、通知。 | [Figma navigation and sidebar](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar), [Material navigation rail](https://m3.material.io/components/navigation-rail) | [images/figma-navigation-sidebar-reference.png](images/figma-navigation-sidebar-reference.png) | Figma 官方截圖，僅供內部參考與結構分析。 |
| 容器與資訊架構 | Card | 封裝一個可掃描、可操作的資訊單元。 | default、hover、selected、dragging、disabled、error | 適合任務卡、素材卡、模板卡、通知摘要。 | [Material cards](https://m3.material.io/components/cards), [Atlassian components](https://atlassian.design/components) | 來源頁面連結 | 後續需區分看板任務卡與一般資訊卡。 |
| 容器與資訊架構 | Panel | 承載側邊設定、屬性檢查、圖層或次級內容。 | open、closed、resizing、pinned、empty | 適合屬性 inspector、filter panel、activity panel。 | [Figma navigation and sidebar](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar), [Atlassian panel discussion](https://www.atlassian.com/blog/ai-at-work/atlassian-design-system-building-the-context-engine-for-the-ai-era) | [images/figma-assets-panel-reference.png](images/figma-assets-panel-reference.png) | Figma 官方截圖，僅供內部參考；Atlassian blog 作概念參考。 |
| 容器與資訊架構 | Modal / Dialog | 阻斷目前流程，要求使用者確認、輸入或處理重要資訊。 | open、loading、error、confirmation、destructive | 適合刪除確認、建立看板、批次操作確認、權限提示。 | [Carbon modal](https://carbondesignsystem.com/components/modal/usage/), [Material dialogs](https://m3.material.io/components/dialogs) | 來源頁面連結 | 不應用於可在頁面內完成的輕量操作。 |
| 容器與資訊架構 | Drawer | 從邊緣滑出承載較完整的次級流程。 | open、closed、dismissible、modal、persistent | 適合任務詳情、篩選條件、活動紀錄、批次編輯。 | [Material navigation drawer](https://m3.material.io/components/navigation-drawer), [Fluent components](https://fluent2.microsoft.design/components) | 來源頁面連結 | 需定義與 modal、panel 的使用邊界。 |
| 容器與資訊架構 | Popover | 在不離開上下文下顯示短內容、選項或輔助控制。 | closed、open、hover trigger、focus trigger、dismissed | 適合日期選擇、快速預覽、更多設定、欄位說明。 | [Carbon popover](https://carbondesignsystem.com/components/popover/usage/), [Material tooltips](https://m3.material.io/components/tooltips) | 來源頁面連結 | 避免承載太複雜流程，需支援鍵盤與焦點管理。 |
| 容器與資訊架構 | Accordion | 收合與展開同類資訊，降低畫面高度。 | collapsed、expanded、disabled、focus | 適合設定分組、FAQ、進階條件、活動歷史分段。 | [Carbon accordion](https://carbondesignsystem.com/components/accordion/usage/), [USWDS accordion](https://designsystem.digital.gov/components/accordion/) | 來源頁面連結 | 不適合隱藏高頻核心操作。 |
| 資料與清單 | Table / Data table | 顯示結構化資料，支援排序、篩選、選取、分頁。 | loading、empty、sorted、selected rows、error、pagination | 適合任務列表檢視、成員管理、素材索引、審核清單。 | [Carbon data table](https://carbondesignsystem.com/components/data-table/usage/), [Fluent components](https://fluent2.microsoft.design/components) | 來源頁面連結 | 欄位密度與行動版策略需另定。 |
| 資料與清單 | List | 連續呈現同類項目，通常比 table 更輕量。 | default、selected、hover、empty、loading、grouped | 適合通知、活動、檔案、搜尋結果、簡化任務列表。 | [Carbon list](https://carbondesignsystem.com/components/list/usage/), [Apple HIG components](https://developer.apple.com/design/human-interface-guidelines/components) | 來源頁面連結 | 項目可操作時需明確區分 row action 與 item selection。 |
| 資料與清單 | Kanban column | 以欄位表示狀態、階段或分類，容納多張任務卡。 | empty、normal、drag-over、collapsed、loading、limit reached | 是 Taylor Kanban 最核心的可能參考元件，用於表達工作流狀態。 | [Atlassian Design System](https://atlassian.design/components), [Material cards](https://m3.material.io/components/cards) | 來源頁面連結 | 這是情境推論，不代表 Taylor Kanban 已有此實作。 |
| 資料與清單 | Task card | 表示單一任務或工作項目，承載標題、狀態、負責人、標籤與時間。 | default、hover、selected、dragging、done、blocked | 適合 Taylor Kanban 看板、待辦、任務詳情入口。 | [Atlassian components](https://atlassian.design/components), [Material cards](https://m3.material.io/components/cards) | 來源頁面連結 | 需後續定義資訊密度與拖曳狀態。 |
| 資料與清單 | Empty state | 當沒有資料或使用者尚未建立內容時，提供狀態與下一步。 | no data、filtered empty、error empty、first use | 適合空看板、無搜尋結果、未建立素材、尚無通知。 | [Carbon empty states pattern](https://carbondesignsystem.com/patterns/empty-states-pattern/), [Atlassian Design System](https://atlassian.design/) | 來源頁面連結 | 文案不能過度行銷，應直接指向下一步。 |
| 狀態回饋 | Alert / Inline notification | 告知重要狀態、錯誤、警告或成功訊息。 | info、success、warning、error、dismissible | 適合同步失敗、權限不足、儲存成功、資料風險提示。 | [Carbon notification](https://carbondesignsystem.com/components/notification/usage/), [Material badges and snackbars](https://m3.material.io/components) | 來源頁面連結 | 需區分頁面級、區塊級與欄位級訊息。 |
| 狀態回饋 | Toast / Snackbar | 短暫顯示非阻斷式回饋。 | shown、dismissed、with action、queued | 適合儲存、複製、移動任務、復原操作。 | [Material snackbar](https://m3.material.io/components/snackbar), [Fluent components](https://fluent2.microsoft.design/components) | 來源頁面連結 | 關鍵錯誤不應只用短暫 toast。 |
| 狀態回饋 | Badge / Tag | 以短標記呈現分類、狀態、數量或屬性。 | neutral、success、warning、danger、selected、dismissible | 適合任務標籤、狀態、優先級、未讀數量、版本標示。 | [Carbon tag](https://carbondesignsystem.com/components/tag/usage/), [Material badges](https://m3.material.io/components/badges) | 來源頁面連結 | 顏色意義需固定，避免同色代表多種語意。 |
| 狀態回饋 | Progress / Loading | 表示作業進度或資料載入中。 | indeterminate、determinate、inline、full-page、error | 適合同步、匯出、搜尋、AI 或批次處理流程。 | [Carbon progress bar](https://carbondesignsystem.com/components/progress-bar/usage/), [Carbon loading](https://carbondesignsystem.com/components/loading/usage/) | 來源頁面連結 | 長時間流程應提供狀態文案與取消策略。 |
| 狀態回饋 | Validation error | 告知欄位或表單不符合要求，並指向修正方式。 | inline error、summary error、warning、required missing | 適合表單、設定、任務建立、命名規則檢查。 | [Material text fields](https://m3.material.io/components/text-fields), [Carbon form](https://carbondesignsystem.com/components/form/usage/) | 來源頁面連結 | 錯誤文案需說明如何修正，避免只顯示「無效」。 |
| 桌面工具介面 | Canvas | 承載主要創作、配置、看板或視覺工作區。 | empty、zoomed、panning、selected objects、read-only | 適合未來向量繪圖、看板視圖、設計資產預覽。 | [Figma navigation and sidebar](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar) | [images/figma-navigation-sidebar-reference.png](images/figma-navigation-sidebar-reference.png) | Figma 官方截圖，僅供內部參考與結構分析。 |
| 桌面工具介面 | Layer panel | 顯示畫面物件、群組、頁面或節點階層。 | expanded、collapsed、selected、hidden、locked、searching | 適合向量設計工具、複雜看板分組、資料層級管理。 | [Figma navigation and sidebar](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar) | [images/figma-navigation-sidebar-reference.png](images/figma-navigation-sidebar-reference.png) | Figma 官方截圖，僅供內部參考；Everline 需另定層級語意。 |
| 桌面工具介面 | Properties inspector | 根據目前選取內容顯示可編輯屬性。 | no selection、single selection、multi-selection、readonly、invalid | 適合任務卡屬性、圖形物件設定、版面 token 調整。 | [Figma navigation and sidebar](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar), [Fluent components](https://fluent2.microsoft.design/components) | 來源頁面連結 | 需定義屬性分組、即時套用與取消策略。 |
| 桌面工具介面 | Asset panel | 搜尋、瀏覽與插入可重用元件或素材。 | empty、searching、filtered、grid view、list view | 適合 Everline 圖示、模板、元件、品牌資產管理。 | [Figma assets tab](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar) | [images/figma-assets-panel-reference.png](images/figma-assets-panel-reference.png) | Figma 官方截圖，僅供內部參考與結構分析。 |
| 桌面工具介面 | Variables / Tokens panel | 管理可重用設計值，例如色彩、間距、模式與 collection。 | empty、editing、searching、grouped、invalid value | 適合 Everline 未來整理 design tokens 與跨產品視覺規則。 | [Figma variables view](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar), [Material tokens](https://m3.material.io/foundations/design-tokens/overview) | [images/figma-variables-panel-reference.png](images/figma-variables-panel-reference.png) | Figma 官方截圖，僅供內部參考；token schema 需另開規格。 |
| 桌面工具介面 | Zoom control | 控制畫布、看板或大型工作區縮放。 | default、zoomed in、zoomed out、fit to screen、disabled | 適合大型看板、向量畫布、素材瀏覽。 | [Figma toolbar](https://help.figma.com/hc/en-us/articles/360041064174-Access-design-tools-from-the-toolbar), [Apple HIG components](https://developer.apple.com/design/human-interface-guidelines/components) | [images/figma-toolbar-reference.png](images/figma-toolbar-reference.png) | 截圖只作結構參考；縮放比例與快捷鍵需後續定義。 |

## 已下載圖片清單

| 檔案 | 來源頁面 | 原始圖片 URL | 用途 | 注意事項 |
| --- | --- | --- | --- | --- |
| [images/figma-toolbar-reference.png](images/figma-toolbar-reference.png) | [Figma toolbar](https://help.figma.com/hc/en-us/articles/360041064174-Access-design-tools-from-the-toolbar) | <https://help.figma.com/hc/article_attachments/33673944882583> | toolbar、icon button、canvas 工具參考 | Figma 官方截圖，僅供內部參考。 |
| [images/figma-navigation-sidebar-reference.png](images/figma-navigation-sidebar-reference.png) | [Figma navigation and sidebar](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar) | <https://help.figma.com/hc/article_attachments/41604909874327> | navigation rail、sidebar、canvas 結構參考 | Figma 官方截圖，僅供內部參考。 |
| [images/figma-assets-panel-reference.png](images/figma-assets-panel-reference.png) | [Figma navigation and sidebar](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar) | <https://help.figma.com/hc/article_attachments/41604909880855> | asset panel、搜尋、資產瀏覽參考 | Figma 官方截圖，僅供內部參考。 |
| [images/figma-variables-panel-reference.png](images/figma-variables-panel-reference.png) | [Figma navigation and sidebar](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar) | <https://help.figma.com/hc/article_attachments/41604909882519> | variables / tokens panel 參考 | Figma 官方截圖，僅供內部參考。 |

## 後續整理建議

- 將本表拆成正式規格前，先選出 Everline v0.1 真正需要的 10-15 個核心元件。
- 優先補齊 button、text field、sidebar、card、modal、table、kanban column、task card、alert、asset panel 的視覺規則。
- 若 Taylor Kanban repo 連結與技術棧確認，再新增前端可消費的 token 格式與 component mapping。

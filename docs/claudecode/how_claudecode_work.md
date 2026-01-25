---
sidebar_position: 1
---

# Claude code 如何運作

了解 agentic loop, built-in tools, 及 claude code 如何與專案互動。

## The agentic loop

當給 claude 一個任務時，它會走過 3 個階段，

1. gather context
2. take action
3. verify results

這些階段是混合的。Claude 在整個過程中都使用 tools，像是搜尋檔案以了解程式碼、編輯程式碼，執行測試驗證結果。

這個 loop 會根據你的他提問調整。如果只是了解程式碼，那可能只需要 gather context 就可以。如果是修正 bug，會須要 3 個階段重複執行。如果是重構，會牽涉到比較廣泛的驗證，Claude 會基於上一步，來決定下一步要做什麼，將數十個步驟串連起來，並在過程中修正方向。

人也是這個 loop 中的一部分，你可以中斷 Claude code 並提示他要改變方向，或提供而外的 context，或要他嘗試另一種方法。

agentic loop 因為這 2 個元件所以強大，

1. model 負責推理
2. tools 負責行動

Claude Code 作為 Claude 的代理框架：它提供工具、上下文管理和執行環境，將語言模型轉變為一個強大的編碼代理。

### Model

Claude code 使用 Claude model 了解你的程式碼並推理出任務。Claude 可以讀任何程式碼，了解 component 如何聯繫，找出需要調整什麼來完成你的目標。對於複雜的任務，它會將工作分解成多個步驟，執行這些步驟，並根據所學到的知識進行調整。

各種模型的選擇有不同權衡，Sonnet 能很好地處理大多數編碼任務。Opus 有強大的推理能力，可以為複雜的架構決策。

當份指南，提到「claude choose」,「claude decides」。這代表模型在執行推理。

### Tools

tools 賦予了 Claude Code 自主性。沒有 tools，Claude 只能回覆文字。有 tools，Claude 就能行動：讀取程式碼、編輯檔案、執行指令、搜尋網路以及與外部服務互動。每次使用工具都會傳回訊息，這些訊息會回饋到循環中，為 Claude 的下一步決策提供依據。

內建的 tools 可以分成 4 種，每一個都代表著不同種類的代理。

1. file operation
2. search
3. excution
4. web
5. code intelligence

這些是主要功能。 Claude 還提供用於產生 subagents、提問、其他編排任務的 tools。

Claude chooses which tools to use based on your prompt and what it learns along the way。

當說要「修正錯誤的測試」，Claude 會

1. 執行測試來使錯誤再發生
2. 讀 error output
3. 搜尋其他相關的程式碼
4. 讀取這些檔案來了解程式
5. 編輯檔案解決問題
6. 重跑一次測試，驗證是否正確。

每次 tool 的使用，都為 claude 帶來新的資訊，從而引導下一步。這就是 agentic loop 的運作方式。

#### 加強 claude code 能力

built-in tools 是基礎。可以透過 skills 擴展 Claude 的知識，透過 MCP 連接外部服務，透過 hooks 自動化流程，或把任務轉交給 subagent。

## Work with sessions

claude code 會儲存你的對話在本地。每一個 message, tool use, 最終結果，都會被儲存。也可以 rewinding, resuming, forking sessions。在 claude 要改 code 時，他也會對受影響的檔案做快照，所以有需要的話，可以恢復。

session 是短暫的，如果要跨 session 記憶東西，要寫在 CLAUDE.md 上。

## The Context Window

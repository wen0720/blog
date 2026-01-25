---
sidebar_position: 2
---

## Plan mode

在 plan mode，claude 會分析程式碼建立計畫，plan mode 在規劃時，只會執行唯讀操作，對於複雜的任務，或是要探索 codebase，會是合適做法。在提交計劃之前，Claude 會使用 `AskUserQuestion` 了解必要的需求與協助釐清目標。

### 適合使用 plan mode 的時機

- 多步驟的實作：如果這個功能實作需要更動多個檔案時
- 程式碼理解：如果在準備開發前，想要更了解整個 codebase
- Interactive development：想要與 claude 討論開發方向時

### 如何使用 plan mode

#### 在 plan mode 開啟一個新的 session

```
claude --permission-mode plan
```

## 使用 claude code 寫測試

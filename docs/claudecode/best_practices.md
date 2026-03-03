---
sidebar_position: 3
---

# Best Practices

如何充分利用 claude code，文件中，提供了一些技巧與模式。

大多數的 best practice 都基於一個限制：Claude 的 context 很快就會被填滿，並且隨著 context 被填滿，效能也會下降。

以下是一些可以依循的準則

## 給 Claude 一個方式驗證它做的是否正確

當 Claude 能夠驗證自己的工作時，例如運行測試、比較螢幕截圖和驗證輸出，它的表現會好得多。

1. 提供驗證標準

不好的 prompt：

```
實作一個驗證 email 是否正確的 function
```

好的 prompt：

```
實作一個驗證 email 是否正確的 function，
範例測試案例：user@example.com 為真，invalid 為假，user@.com 為假。實現後運行測試。
```

## 使用 plan mode 將探索與執行分離

推薦的工作流有 4 個階段

1. explore（plan mode）

```
讀 /src/auth 去了解 session 與 login 是如何實作
也去了解專案是如何管理環境變數
```

2. plan（plan mode）

```
要加上 google auth
- 要改哪些檔案
- 建一個 plan
```

這邊可以按 `ctrl+G`，直接編輯 plan

3. implement（normal mode）

切換回正常模式，讓 Claude 編寫程式碼，並根據其計劃進行驗證。

```
基於計畫實作 OAuth 流程，對 callback 進行測試，撰寫測試案例，並修正錯誤。
```

4. commit

要 claude 寫 commit message，並發 pr。

對於那些簡單的問題或是小修改，像是加上 log，修改錯字...，可以用 claude 直接執行。

plan mode 最有用的是如果你有些實作上不確定的部分，或是需要修改到許多的檔案，又或是對要修改的 code 並不熟悉。如果你可以用一句話描述差異，那就不要用 plan mode。

## 提供充足的內容

可以透過不同的方式，透過 prompt 告訴 claude code 相關內容

1. 用 @ 引用其他文件
2. 直接貼上圖片
3. 提供 文件的urls
4. 也可以直接用 cli，`cat error.log | claude`
5. 告訴 claude 自己去抓取需要的檔案

## 設定環境

### CLAUDE.md的撰寫方式

由於 CLAUDE.md 是每次開啟 conversation 時，都必定會載入的文件。如何有效的撰寫是很重要的。CLAUDE.md 應該要簡潔，大方向的載入專案中的重要事項，還有那些從程式碼不容易推論的事。

可以問自己，移除這行，會導致 claude code 出錯嗎？如果不會，就移除吧。

CLAUDE.md 也可以透過 `@/path/to/import`，載入相關檔案。

## 一些可以如何與 claude 溝通的方向

### 問 codebase 問題

如果到一個新的專案，可以透過 claude 了解整個專案或其他細部細節的實作，可以幫助了解專案。

### 使用 AskUserQuestion

使用 AskUserQuestion 來問自己問題，可以幫助釐清一下自己也沒考慮到的方向（包含：技術上實作、邊界案例、UIUX...）。

可以透過這樣把規格都寫好，請 claude 寫成 spec.md 之類的，後續要再開發時，可以先清除 context，然後透過 reference spec.md，開始後續的開發。

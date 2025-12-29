---
sidebar_position: 1
---

## Network mode

### online

這是預設模式，在這個狀態下，如果沒有網路連線，Queries 和 Mutation 不會觸發。
如果已經觸發 query 但在中途網路中斷，當下 state 會保持狀態（pending, error, success）

可以透過 `fetchStatus` 取得 fetch 的狀態

`fetching`：表示 `queryFn` 正在執行當中
`paused`：表示目前 query 沒有在執行，暫停中，直到網路重新連線才繼續
`idle`：表示不是在 fetching 與 paused 的狀態

> 這表示單純用 `pending` 狀態來判斷是否顯示 loading 動畫可能是不足夠的，因為 `pending` + `fetchStatus: paused` 可能代表著首次載入且沒有網路連接

### always

這個模式下，TanStack Query 會忽略 online / offline state，總是執行 fetch。如果你的使用情境是不需要網路連線，像是透過 `AsyncStorage` 讀取資料 `queryFn` 或是只是要回傳 `Promise.resolve(5)`

此模式下：

- 因為不需要網路連線，query 永遠不會變成 paused
- retry 也不會暫停，如果 query 失敗，會進入 `error` state。
- refetchOnReconnect 預設會是 false

### offlineFirst

TanStack Query 會執行 `queryFn` 一次，但會暫停 retry。如果是用 serviceworker 攔截 request 並快取，使用這個模式會很有用。

此模式下，第一次 fetch 因為是從離線快取而來的，所以可能會成功。但如果沒有命中快取，網路請求會發出然後失敗，這個情況就像是 online 模式且 retry 失敗一樣。

## reference

https://tanstack.com/query/latest/docs/framework/react/overview

# Next.js 14

此紀錄基於 Next.js 14 文檔。

## Routing

### 特定檔名意義

在 Next.js 這個基於 file system 建構 route 的系統中，有一些 js 檔名具有特殊意義。

- layout.js
- template.js
- error.js
- loading.js
- not-found.js
- page.js

在同一個 route segment 的這些特殊檔案，會按照特定的層級渲染

```jsx=
<Layout>
  <Template>
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loading />} />
        <ErrorBoundary fallback={<NotFound />}>
          <Page />
        </ErrorBoundary>
      </Suspense>
    </ErrorBoundary>
  </Template>
</Layout>
```

所以 ErrorBoundary 不會處理同一層級的 Layout/Template

### template

看起來，在以上這樣 component 中，Template 是蠻特別的，以下簡單介紹。
如上可以發現，Layout 跟 Template 都包裹著 page。
而他們之間的差異是，Layout 可以在 route 改變時，持續保留狀態，Template 則是會隨著 route 改變重新 create component instance，也就是重 mount 的意思。

Next.js 文檔說明，在某些特定情況下，可能有需求會用到像 tempalte 這種，會隨著 route 改變而重 mount 的特性。e.g. logging page view

### Route Groups

目前看到的使用特點：

1. 在檔案架構上，把相關的路由集中，且並且不會改變網址
2. 可以透過檔案架構的編排，讓不同的頁面共享特定 layout

```
app
├── layout.js
├── (marketing)
│   └── layout.js
│   └── /about
│       └── page.js
├── (dashborad)
│   └── layout.js
│   └── /dashborad
│       └── /edit
│           └── page.js
│       └── /[id]
│           └── page.js
```

上面的案例

1. 網址 xxx.com/about 會指向 `/about/page.js`
2. dashboard 相關頁面，可以有自己的 layout，並且 (marketing) 存在的用意是，e.g. 如果首頁的 header 與 dashboard 的 header 不一樣，但又想要放在 layout 裡，這樣首頁的 header 就不能放在最上層的 app/layout.js 裡，因為這樣 dashboard 也會吃到。所以才會有一層 (marketing) 資料夾，可以把大部分的主要 layout 內容放在 (marketing)/layout.js，app/layout.js 留下最簡單的 `<html><body></body></html>`，而 dashboard/layout.js 則實現自己的 header 版本，這樣就可以拆分出 2 種不同的版型，這也是 route groups 的用途。

### Prefetching

Prefetching 是在使用者尚未造訪網頁時，預先在背景 preload route 的機制。

有 2 種方式實現 route 的 prefetch。

1. `<Link>` component：在 `<Link>` 元件進到 viewport 的時候，該 route 會自動 prefetch。
2. `router.prefetch()`：也可以透過 `useRouter` hook，去 prefetch route。

`<Link>` component 的 prefetch 行為，在 static route 或 dynamic route 有不同的行為。

在 static route，prefetch 預設是 true，整個 route 都會被 prefetched 和 cached。

在 dynamic route，以整個 render tree 來說，只有從 shared layout 到 loading.js 這段（可以參考上方特定檔名的元件架構），會被 prefetched，並且 cached 30s。這減少了原本需要 fetch 整個 route 的時間，而且也代表可以更快的讓使用者看到 loading 畫面。

---

---

## Data fetching

### fetching data on the server with `fetch`

Next.js 延伸了 web fetch api 的功能，在 server 上的每個 request，都可以設定 cache 和 revalidate 機制。
在 server component render react component 時，react 會自動 memoize fetch request。

這其實還有其他限制：

1. 在 route handler 中，fetch request 不會 memoize，因為這邊不是 react render component tree 的環節。
2. fetch memoization 只在同一次 react render 時有效，下次 render 就會被重置，也就是 memoization 不會橫跨不同的 request。

## Rendering

### Next.js 如何處理 server/client component

**1. 在 server 端**

Next.js 使用 react api 來編排渲染。渲染工作被拆分成多個模組，每個模組對應一個單獨的路由段。

- server component 會被渲染成一個特定的格式叫做 RSC payload。
- client component 與 RSC payload 會被用來 "prerender" HTML

:::info
什麼是 React Server Component Payload(RSC Payload)

RSC payload 是渲染過後的 React server component tree 的 壓縮過的 2 進位表示。
讓 react 在 client 端用來更新瀏覽器的 DOM。

RSC Payliad 內容包含：

1. server component 的渲染結果
2. client component 應該在哪裡渲染的 placeholder，以及其引用的 js file
3. 任何從 server component 傳到 client component 的 props
   :::

**2. 在 client 端（初次載入）**

1. HTML 會根據路由，快速顯示無法互動的畫面給使用者。
2. RSC payload 被用來協調 client 與 server 端的 tree
3. javascript 用來 hydrate client component，讓 app 能互動。

在 Next.js 中，rendering 依據不同的 route 區分，以啟用 streaming 和 partial rendering。並且有 3 種不同的 server rendering 策略。

1. static rendering（預設）
2. dynamic rendering
3. streaming

### Server Rendering Strategies

其實一個頁面可能包含 static rendering 跟 dynamic rendering，這是一個光譜的概念。

### Static rendering

有 2 種情況，第一個是在 build time 就 render 好。另外是透過 data revalidation 在背景執行（time-based 可理解，不確定 on-demand base 如何實作）。

### Dynamic rendering

在 server rendering 發生時，如果發現有 `dynamic function` 或 `uncached data request`，Next.js 就會將整個 route 切換到 dynamic rendering。

何謂 `dynamic function`，是依賴那些只能在 request time 才能取得的資料的 function。像是 cookies, request header, url search params。在 Next.js 裡，dynamic function 是 `cookies()`、`headers()`，另外，如果在 Page component 使用了 searchParams 參數，都會在 request time 被視為 dynamic rendering。

`uncached data request` 的可能性太多了，見[官網](https://nextjs.org/docs/14/app/building-your-application/data-fetching/fetching-caching-and-revalidating#opting-out-of-data-caching)

| Dynamic Functions | Data       | Route             |
| ----------------- | ---------- | ----------------- |
| 無                | cached     | static rendering  |
| 有                | not cached | dynamic rendering |
| 無                | not cached | dynamic rendering |
| 有                | cached     | dynamic rendering |

作為 Next.js 的使用者，我們不是直接的去選擇什麼時候要 staic/dynamic rendering，我們考量的是，什麼時候要 cache 或 revalidate 特定 data，以及什麼時候要做 streaming。

## Caching Data

關於 cache 相關策略，
有 request memoization, Data cache, full route cache, router cache。

request memoization 與 react cache api 相關。
Data cache 概念上與 http header 相關。

## About server function

這邊是我自己了解了一下 server function 後的筆記。

- server function 讓 client 端可以呼叫 server 上的 async function（類似 RPC 的概念）
- server action 專指那些被傳進 action props 或在 action props 中執行的 server function。也就是說，就名詞定義來說，，server function 包含 server action。
- server function 主要是被設計來 mutate 伺服器端的狀態，並不推薦用來做 data fetch，所以通常一次只處理一個 action，且不會 cache 回傳值
- 不論是傳進 server function 的 argument 或 server function 的 return 值，因為橫跨 client-server，都要可以被 serialized。
- 傳入 server function 的參數應視為 untrusted，應 validate or escape。

探討幾件事：

如上所述，server function 其實是被設計用來傳給 client 端使用的。

Q：那可以在 server 端執行 server function 嗎？
實測是可以的，而且在 server 端執行時，可以併發，不會按順序執行。
但在 client side，會按順序執行。

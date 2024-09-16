---
sidebar_position: 2
---

## Next.js

### 在不同環境下，Next.js 的運作方式

1. Development vs Production
**Development**
next.js 針對開發體驗優化：Typescript、ESLint intergration、Fast Refresh
**Production**
next.js 針對終端使用者優化：主要在於將程式編譯使運行時更有效率。Next.js 透過 SWC 將程式壓縮、打包、編譯。
**名詞**
minification：在 production，next.js 會將 css 和 js 壓縮。
bundling：將開發時被模組化的各個檔案，依照彼此的相依性重組為一個檔案，藉以減少瀏覽器請求文件的數量。
code spliting：把 bundle 的檔案再依載入順序分割成小檔。預設 `/pages` 裡的 js 就會被自動分割成一個檔案。另外如果有 code 在多個 page 中出現，這些 code 會再被抽取出來成另一個檔案。

3. 渲染環境：client vs server
next.js 可以選擇在同一個專案下，會不同的 page 選擇不同的渲染模式，CSR/SSR/SSG

### routing
出現在 viewport 裡的 Link component，next.js 會先去 prefetch 該頁的 code。

### assets, metadata, css

#### css
next.js 預設支援 css/sass
支援 css module，css 檔名要命名為 xx.module.css
css module 會在 buildtime 被從 bundle 檔中抽取出來，在不同頁面 next.js 會自動載入相關 .css 檔

### pages/_app.js
_app.js default export 的 function 會作為整個 react 元件的最上層。包裹所有 page。可以在這裡記錄一些狀態，或添加全域樣式。global css 只能放在 _app.js 裡，因為如果放在其他頁面，去過那個頁面之後，就會影響其他頁。

### prerendering

#### getStaticProps
只能在 page 中 epxort。使用這個 function，會在 build time 時向外拿一次資料（透過 database or file system...），然後把畫面 render 出來。


## Doc
https://nextjs.org/learn/basics/create-nextjs-app

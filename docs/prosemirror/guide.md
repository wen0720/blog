---
sidebar_position: 1
---

# proseMirror guide 翻譯

## 自己的整理

### plugin / node view / decoration 的差異
plugin 用來改變編輯器的文檔，可以加一些按鍵綁定、修改編輯器的狀態...
node view 為特定節點擴展自定義的結構
decoration 將文檔添加視覺效果

## 介紹
ProseMirror 提供了能完成文字編輯器的一系列工具與概念。

PM 的主要原則是讓 code 能有完全對於 document 的掌控，能完全知道發生什麼事。document 不是 html，是指一個自訂的資料結構，這個結構可以規範什麼樣的 DOM 可以包含在結構中，所有的更新都經過一個特定的點，讓你可以觀察與回應。

core module 的設計是以模組化與客製化的能力為主要考量。

有 4 個重要的 module，進行任何編輯都需要這些。還有一些額外的插件，但可以忽略，如果你只需要做一些簡單的功能。或者你也可以自己做一個相關插件取代。

重要的 module 包含：

1. prosemirror-model
定義用來描述編輯器內容的文件模型，是 state 的一部分。

2. prosemirror-state
提供描述整個編輯器狀態的資料結構，包括選取範圍與狀態改變的變更機制（transaction system）。

3. prosemirror-view
實現了可以顯示 editor state 的 ui 介面，使用 html editable element，並處理使用者互動。

4. prosemirror-transform
提供可以修改 document 的功能，並且可以被紀錄與重複，這是 state module 的 transaction system 的基礎，也是有這些功能，使協作功能、復原功能可以實現


### transactions
當使用者與 view 互動時，會產生 state transaction，代表在更改 state 時，並不是在內部更改 document 的狀態，而是將每個改變都 create 一個 transaction。transaction 就是描述與原 state 的差異，可以被 state apply 成一個新的 state。

預設的上述的機制都發生在幕後。可以寫 **plugin** 或是 **設定自己的 view** 來 hook。
例如：dispatchTransaction，是 EditorView  可傳入的參數，dispatchTransaction 是一個 callback，在 transaction 被創建時觸發。

每一次 state 的更新，都透過 EditorView.updateState，每一個編輯更新都由 dispatch transaction 觸發。

### plugins
plugin 透過不同的方式來擴充編輯器與編輯器狀態。有些特別簡單，像是 keymap plugin。有些則是涉入較多，像是 history plugin。因為 plugin 在創立 state 時註冊，因為 plugin 可以取得 state transaction。

### commands
大部分的編輯動作都是一個 command。
prosemirror command 提供一系列基本的編輯 command，也包含一些基本的操作功能包（baseKeymap），像是 delete, enter 等。

### content
整個編輯器的 document state 是存在 EditorState.doc 裡。這是一個唯讀的資料結構，用多層級的 node 表示 document，類似於 DOM 結構。

## Documents


### Structure
PM document 是一個 class Node。
class Node 有 property content 是 class Fragment
而 Fragment 有 property content 是 [NODE]

Fragment 是代表 子 node 的集合

node 與 fragment 都是 persistent 的特性。這意味著我們不該 mutate 它。

如果是這樣一段 html
`<p>This is <strong>strong text with <em>emphasis</em> </strong></p>`
在 DOM Tree 裡概念上是這樣
```js=
{
    type: 'p',
    content: [
        {
            type: 'text',
            text: 'This is',
        },
        {
            type: 'strong',
            content: [
                {
                    type: 'text',
                    text: 'strong text with'
                },
                {
                    type: 'em',
                    content: [
                        {
                            type: 'text',
                            text: 'emphasis'
                        }
                    ]
                }
            ]
        }
    ]
}
```

但在 ProseMirror 概念是這樣

```js=
{
    type: 'p',
    content: [
        {
            type: 'text',
            text: 'This is',
        },
        {
            type: 'text',
            text: 'strong text with',
            mark: [{ type: 'strong' }]
        },
        {
            type: 'text',
            text: 'emphasis',
            mark: [{ type: 'strong' }, { type: 'em' }]
        },
    ]
}
```

所以實際上，ProseMirror 把 inline 元素 flatten 了，ProseMirror document 實際上是 block 元素的樹狀結構。

這更符合我們傾向於思考和處理此類文本的方式。它允許我們使用字元偏移量而不是樹中的路徑來表示段落中的位置，並且可以更輕鬆地執行拆分或更改內容樣式等操作，而無需執行笨拙的樹操作。


## Document transformations

### steps
更新 docuement 這個行為，可以分解成多個 `step`，通常不需要直接用到 `step`，但知道如何實作是有用的。

steps 的例子：用 `replaceStep` 取代 document 中的一塊。
step 可以被 apply 進 document，建立一個新的 document

```js=
console.log(myDoc.toString()); // p('hello');
// A step that deletes the content between position 3 and 5
let step = new ReplaceStep(3, 5, Slice.empty);
let result = step.apply(mydoc);
console.log(result.doc.toString()); // p('heo')
```

apply step 是一個相對直觀的行為，意思是，是有可能會報錯的。例如：如果嘗試刪除 opening token（`<p>` 標籤），可能會導致 token 不平衡。這也是為什麼 apply 會回傳一個 result object。result 會在成功時回傳 doc，失敗時回傳 error message。

通常會習慣使用 Transform 提供的一系列 helper function 處理 step，這樣就不用顧慮太多細節。

### Transform
一個編輯動作，可能會產生一個或多個 step。
如果要操作一系列的 step，最方便的方式是使用 Transform。

Transform 這個 class 就是用來建立與追蹤一系列 step 的抽象

```js=
let tr = new Transform(myDoc);
tr.delete(5, 7); // delete between position 5 and 7
tr.split(5); // split the parent node at position 5

console.log(tr.doc.toString()); // The modeified document
console.log(tr.steps.length); // 2
```

transform 大部分的 method 都會回傳自己，也就是可以把方法 chain 起來。
`tr.delete(5, 7).split(5)`

### Mapping
當改變 document，每個 postion index 其實也會改變。例如插入一個字元或是刪除字元，都會導致整個 doc 的 index 與之前不一樣。

通常會需要在文字的變更中，保留位置。ex: selection boundaries。
為了這個需求，proseMirror 的 step 提供 [map](https://prosemirror.net/docs/ref/#transform.StepMap)，
可以透過比較改變前後的 index 變化。

```js=
let step = new ReplaceStep(4, 6, Slice.empty); // delete 4-5
let map = step.getMap();
console.log(map.map(8));  // -> 6 (原本是 8 變成 6)
console.log(map.map(2)); // -> 2 (原本是 2 不變)
```

Tramsform 有 mapping 這個 property 紀錄了一系列 steps 的 maps。

```js=
let tr = new Transform(myDoc);
tr.split(10) // split a node, +2 tokens at 10
tr.delete(2, 5) // -3 tokens at 2

console.log(tr.mapping.map(15)) // -> 14
console.log(tr.mapping.map(6)) // -> 3
console.log(tr.mapping.map(10)) // -> 9
```

某些時候，並不是很清楚原始的 index 要 map 到哪一個位置。例如：前面例子 index 10，究竟應該把 10 放在分割的後面或者是前面。

如果其實 index 10 應該在前面，可以這樣做 `tr.mapping.map(10, -1)`

將各種 step 定義的小而直觀的原因是，讓這樣子的 mapping 紀錄可以實現。甚至可以反轉 step。

### Rebasing

當透過 step 或是 position map 實作較複雜的行為，例如：追蹤變更紀錄，或是在多人協作中增加其他功能，可能會使用到 rebase steps。

:::info
太抽象了，有實作這段，再來說明
:::

## The editor state
編輯器要記得狀態有哪些，如何文章的資料結構（document）外，還有 current selection、目前 mark 的狀態。
ProseMirror state 有 3 個主要的狀態就是 doc, selection, storeMarks。

plugin 也需要儲存 state。undo history 也需要記得歷史紀錄。這就是為什麼 editorState 裡，也有儲存目前 active 的 plugin。這些 plugin 也可以儲存 plugin 自己的 state。

### Selection
PM 支援多種不同的 selection。所有的 selection 都是繼承 Class Selection 的實例。editor state 裡的 selection 也是 immutable 的，要改變 selection，要建一個新的 selection object，與一個新的 state。

`.from`：selection 當中，文本前端的那個 point
`.to`：selection 當中，文本後端的那個 point
`.anchor`：selection 當中，一開始釘下的 point，不會動的那個 point
`.head`：selection 當中，在移動的 point

### Transaction
在一般正常編輯的時候，newState 會根據舊的 state 產生。

state 可以 apply transaction 來產生新的 state。

`Transaction` 繼承自 `Transform`，transaction 會追蹤 selection 與其他有狀態的元件，Transaction 實際上被歸類在 prosemirror-state，像是 store marks 的改變，也會追蹤。

我覺得可以說 Transaction 是針對編輯器有加上了一些特化功能的 Transform。

所以 Transaction 有一系列修該編輯器相關狀態的 method。`setStoreMarks`、`ensureMarks`、`scrollIntoView`...等。

### Plugins
當建一個新的 editorState 時，可以帶入一個 array 設定一系列的 plugin。這些 plugin 會被存在 state 裡面，並且可以在 plugin 裡 apply transaction，或影響 editor 處理 state 的行為。

```js=
let myPlugin = new Plugin({
    props: {
        handleKeyDown(view, event) {
            console.log('A key was pressed');
            return false; // We did not handle this
        }
    }
});

let state = EditorState.create({ schema, plugins: [myPlugin] });
```

plugin 也可以定義自己的 state
所以其實 PM 有分有 state 的 plugin 和沒有 state 的 plugin。
有 state 的 plugin 一定要放在 EditorState 被建立。

```js=
let transactionCounter = new Plugin({
    state: {
        init() { return 0 },
        apply(tr, value) { return value + 1 }
    }
})

function getTransactionCount(state) {
    transactionCounter.getState(state);
}
```

getState 會從整個 editorState 中提取 plugin 的 state。
整個 editor state 是 immutable 的，所以 apply method 需回傳一個新值。

#### metadata
metadata 主要用於對 plugin 在 apply 新的 state 時，加上一些資訊。
metadata 的相關 method 是透過 transaction 處理的。有 `tr.getMeta()`，`tr.setMeta()`，
也就是會標記該 transaction 的狀態。

例如：undo history plugin，在進行 執行 undo 時，會標記該 transaction，當 plugin 發現這個 transaction 有被標記時，有別於一般的紀錄更新（把 transaction 加到 undo stack），plugin 會將 undo stack 最上面的 transaction 搬移到 redo stack。

而為了讓 plugin 能夠判斷不同情況，就要用 metadata 來輔助。例如上面的 transactionCounter，如果有特殊的情境要讓 count 不 +1 的話。可以這樣：

```js=
let transactionCounter = new Plugin({
    state: {
        init() { return 0 },
        apply(tr, value) {
            if (tr.getMeta(transactionCounter)) {
                return value;
            }
            return value + 1;
        }
    }
})

function markAsUncounted(tr) {
    tr.setMeta(transactionCounter, true);
}
```

setMeta 的 type 定義，實際上 value 可以是 any
setMeta 的 key 推薦使用 Plugin 本身，如果要 string 的話，就要確保其唯一性。
有些 PM 的插件裡面，有用 string 當作 key。

```ts=
function setMeta(
    key: string | Plugin | PluginKey
    value: any
): Transaction
```

## The View Component
PM editor view 是用來轉換 editor state 至 DOM 的元件。並允許使用者進行一些編輯(editing actions)。

EditorView 元件對於 editing actions 的定義是嚴謹的。主要為直接對編輯器的操作，像是 typing, clicking, copying, pasting, dragging，不超過以上範圍。因此像是，menu，快捷鍵行為綁定等功能，並不屬於 EditorView 元件的職責範圍，需要透過 plugin 來實現。

Browser 透過 contentEditable 可以讓 DOM 元素被編輯，讓元素可以被 focus 與 select，也可以在其中輸入內容。View 將 PM document 轉換為 DOM，並且讓 DOM 的編輯也連動到 editor state 上(ex: selection...)。

EditorView 本身也註冊了許多 DOM events，並將這些 event 轉換為適當的 transaction。例如：貼上這個行為，被貼上的內容會被轉換為 ProseMirror document Slice，並被插入 document 中。

許多事件也被原樣傳遞，然後才跟著 PM 的資料模型被重新解釋。Browser 對於 cursor 與 selection 的行為十分在行。所以大部分 cursor 的動作都被 browser 處理，在處理完後，PM 才去檢查目前的 DOM selection 是否符合到 PM 的 text selection。假若不符合，便會 dispatch 關於 selection 的 transaction。

一般的打字，也是留給 browser 處理，因為干擾打字可能會破壞瀏覽器提供的原始功能，例：拼字檢查、自動補全...等。editorView 會監聽 browser 的 dom 內容改變後，parse 目前的結構，並生成可以提供修訂原始 state 的 transaction。

### Data flow
所以 editorview 將給定的 editor state 顯示出來。當 DOM event 觸發時，editorview 建立 transaction，並且可以透過 apply tr 建立一個新的 state，最後將新的 state 給 view 執行 `updateState(state)`
<!-- ![截圖 2024-09-11 下午2.37.06](https://hackmd.io/_uploads/H1s79hChR.png) -->

如上圖是其資料流。

### Props
props 可以理解為 react props。就是 ui component 的參數。
state 也是一個 prop。所有其他的 props 在運行時都可以被更新。
Plugin 也可以帶入 props，如果 props 被定義了多次（可以從 EditorView 或 Plugin 定義 props），一般來說，會按順序確定 props 的值為何，依序執行。EditorView 為最先的，其次依據 plugin 的順序執行。
如果是 handler function，會一直執行直到 return true 的那一個為止。
對於一些可以有多種值的 props，就會被聚集起來。（ex：attribue, decoration)

<!-- plugin -->

### Decorations
Decoration 讓你可以控制 view 如何顯示文本。但 Decoration 不會在 document 中插入 node，而是有自己的 tree 結構。
Decoration 分成 3 種：
1. Node Decoration：對一個 node DOM 加上 style 或 attribute
2. Widget Decoration：在給定 position 插入一個 DOM node，這並不在 document 中。
3. Inline Decoration：類似 Node Decoration，但作用在 inline node 上。

為了要有效率的繪製與比對 decorations，需要透過 decotation set 加入 decoration。
decotation set 是一個 Tree 的 資料結構

```js=
let purplePlugin = new Plugin({
    props: {
        decorations(state) {
            return DecorationSet.create(state.doc, [
                Decoration.inline(0, state.doc.content.size, { style: 'color: purple' })
            ])
        }
    }
})
```

如果有大量 decoration，每次重繪都要透過 DecorationSet recreate 大量 decoration，是耗效能的。針對這種情況，建議把 decorationSet 寫進 plugin state 裡。透過 decorationSet.map 處理。

### Node View
:::info
自己的理解：node view 是一個內容可以自定義的元件，node view 必須跟 schema 的 spec 搭配。spec 定義外面的 DOM 結構。node view 可以在對內部的內容做客製功能。

nodeSpec 的 toDOM 定義了外面的 DOM 結構，例：
['p', 0]
node view 像是可以用 js 調整 0 裡面的東西
:::

待補

## commands
在 PM，command 專指一個術語，是實現 editor action 的 function。

根據實際情況，command 可以是一個複雜的介面。在簡單的情形下，command 是一個 function 接收 editor state 與 dispatch function 做為參數，並且 return true or false。

為了要知道 command 在給定的 state 下是否可以執行，但又必須確保在確定可執行後，在觸發 dispatch，command 被設計成，如果參數**只有給 state**，command 只會 return true or false，來確定 command 是否可執行。

例：
```js=
function deleteSelection(state, dispatch) {
    if (state.selection.empty) {
        return false;
    }
    if (dispatch) {
        dispatch(state.tr.deleteSelection);
    }
    return true;
}
```

prosemirror-commands 模組提供了許多 editing commands。像是 deleteSelection。也有較複雜的像是 joinBackward。joinBackward 主要是應用在 backspace 鍵觸發時，若在游標置於 textblock 最前方時，要實作 2 個 block 合併的操作。

:::info
chainCommad 好難解釋，有機會再補
:::

有些時候，command 需要跟 view 互動，這時候 command 會再多一個參數 view。
所以 command 完整的 type 是這樣
```ts=
(
    state: EditorState,
    dispatch: (tr: Transaction) => void,
    view?: EditorView
) => boolean
```
## 參考文章
https://prosemirror.net/docs/guide/

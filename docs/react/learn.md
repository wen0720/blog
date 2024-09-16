---
sidebar_position: 1
---

# React

## 寫 react 重要的事情
1. 究竟什麼狀態要用 useState()，要好好思考，是什麼狀態在控制畫面 render
2. 用 pure function 的概念去思考
    - 避免 mutate 到外部已存在的 variable
    - same input, same output(所寫的 react component 應該要回傳一致的 jsx)

3. 在 rendering 時執行的 function，必須是 pure，但 event handler... 不需要是 pure

## 關於 useState
1. 當有狀態需要在 react 更新組件間被記住時，用 useState
2. state 在 component 裡是私有的
3. 每個當下的 state 是固定的，像快照般。就算是非同步操作，也不會因為 state 再後續有變化，而影響非同步執行的 function，[詳見 state as a snapshot](https://react.dev/learn/state-as-a-snapshot)

## 關於 useEffect
- 在 rendering 的時候，如果以一些 side effect 行為，可以 useEffect 裡面處理。
- 應用場景通常不是 使用者互動，因為互動會在 handler 裡處理。
- 一般來說，useEffect 在 react commit 後執行（render 完 Dom 後）
- 如果前次 render 的 dependency 值與這次一樣，useEffect 會被 react 跳過
- 通常決定要以什麼為 dependency 的準則是 useEffect 裡用到什麼樣的狀態
- 如果 dependency 是空的，則代表只會在 component mount 時執行一次
- Strict Mode 下，react 為了測試程式穩定性，會 remount component。
- 如果因為 remount 導致程式有問題，通常需要 cleanup function
- 在執行下一次 effect 時，react 會 call cleanup function

useEffetc 會比較前次 render，如果作為 dependency 的 state 在 2 次 render 中不一樣（Object.is()）
則會在這次 render 之後，執行 callback

## 你可能不需要 effect
- 如果在 render 時計算其他值，不需要 effect
- 要 cache 某個相對耗效能的操作，使用 useMemo（我覺得就像是 vue 的 computed）
- 如果要透過改變 prop 重設 子component 內部所有的 state，可以給子 componet 加上 key
- 如果要改變許多不同元件的 state，盡量放在一個 event 一起更新，善用 react batch update 的設計
- 如果要在不同的元件同步同一個狀態值，先考慮 lift state up
- 可以在 effect 裡 fetch data，但要加上 cleanup function 避免 race condition

## 如何判斷何時該用 useEffect
情境：當要決定程式邏輯應該放在 event handler 或是 useEffect 時，要從使用者的視角思考，這段邏輯究竟是特定互動，或者是 user 在 component render 後，才會呈現的內容，若是前者，請放在 event handler，若是後者，請放在 useEffect。

## 在寫 useEffect 的時候，應該思考什麼
react 官方建議，寫 useEffect 要專注在狀態什麼時候該重新同步，而**不是**思考現在 component 是什麼階段（mounted/unmount...）

在 react 裡，所有在 component 裡的變數，都視為 reactive 的，
有些變數可能是依據不同的 props 有不同的值，
但同樣在 render 時會改變，
所以是 reactive 的。
```jsx=
function ChatRoom({ roomId, selectedServerUrl }) { // roomId is reactive
  const settings = useContext(SettingsContext); // settings is reactive
  const serverUrl = selectedServerUrl ?? settings.defaultServerUrl; // serverUrl is reactive
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // Your Effect reads roomId and serverUrl
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId, serverUrl]); // So it needs to re-synchronize when either of them changes!
  // ...
}
```

### React.StrictMode
在這個模式底下，react 會 render component 2 次，這是為了測試 component 是不是 pure function

## JSX 介紹
react 推薦使用 JSX。透過 JSX 來產出 react 的元件。

### 為什麼要使用 JSX
react 認為畫面渲染的邏輯與 ui 邏輯、事件處理、狀態改變，應該要一起處理。
所以相較於把 html 標記語言和程式邏輯分離，react 認為更應該把一小部分的這些東西一起處理，也就是 component 的概念。

### JSX 可預防 XSS 攻擊
所有注入 JSX 的變數都會被轉為字串，可以確保其他非自己 app 的程式，也不會造成 xss 攻擊。

### JSX 即物件
Babel 會 compile JSX 為 React.createElement()

```jsx=
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);
```
```jsx=
const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);
```

`React.createElement` 會產出類似這樣的物件(這是簡單版)

```jsx=
// 簡單的表示，實際上更複雜
const element = {
    type: 'h1',
    props: {
        className: 'greeting',
        children: 'Hello, world'
    }
}
// 這個 object 叫做 'React elements'，React 會用這個 object 去建立 DOM 並持續更新。
```

## Rendering Element

Element 是 react app 的最小單元。
```jsx=
const element = <h1>Hello, world</h1>
```
React element 是一個 plain object（大致上的意思是物件的 prototype 是 Object.prototype）
相較於 DOM 來說，開銷是更小的。
React DOM 會去依照 React element 去更新 DOM

:::info
要注意的是 element 不是 component。componet 是由 element 組成的。
:::

### 將 element 渲染為 DOM 元素
會透過一個 root div，讓 React DOM 管理裡面的渲染邏輯
```jsx=
const root = ReactDOM.createRoot(document.getElementBtId('root'));
const element = <h1>hello world</h1>
root.render(element);
```

React element 是 immutable 的，所以一但建立之後，就無法改變他的子層或attribute。
一個 element 就像是電影中的某一個影格，代表某個狀態下，ui 的樣子。
改變 ui 的唯一辦法就是創一個新的 element，然後重新 `root.render()` 一次

:::info
實際上，大部分的 React app 只執行 root.render() 一次。之後會介紹，如何去封裝有狀態的 component。
:::

### React 只 update 有需要更新的部分

ReactDOM 會將 element 和它的 children 與先前的狀態做比較，必且只更新必要的 DOM。

但只要 component 的 state 有改變，整個 component 包含其子 component 都會 re-render。
要注意的是，componet render 產生的是 renderering elements，

## Components 和 props

Componet 讓我們把 ui 切成可以複用、獨立且隔離的一個單元。概念上，component 就像是 Javscript Function，接受任意的輸入(也就是 props)，並且回傳 React elements。

### Function components
```jsx=
function Welcome(props) {
    return `<h1>Hello!, {props.name}</h1>`
}
```

### class components
```jsx=
class Welcome extends React.Component {
    render() {
        return {
            <h1>Hello!, {this.props.name}</h1>
        }
    }
}
```

可以創造一個自定義的元件，給 React render

```jsx=
const element = <Welcome name="paper" />
const root = React.createRoot(document.getElementById('app'))
root.render(element)
```
當 react 發現這是一個自定義元件時，會把 jsx 上的 attribute 和 children 當作 object 傳入，也就是我們說的 props。

複習一下 code 上面的發生什麼事
1. root.render()  帶入了 `<Welcome name="paper"/>`
2. 觸發 welcome componet 並帶入 `{name: 'paper'}` 為 props
3. welcome component 回傳 `<h1>Hello!, paper</h1> element`
4. React Dom 更新 dom 以符合  `<h1>Hello!, paper</h1>`

## Hooks
hook 只能放在 react component 的第一層，不要在 if..else, loop 裡面使用 hook

### useState
使用 useState 是在告訴 React 希望該 component 記住這個 state

## 關於 state 的更新
if you would like to update the same state variable multiple times before the next render, instead of passing the next state value like setNumber(number + 1), you can pass a function that calculates the next state based on the previous one in the queue
```jsx=
function StateWontChangeUtilNextRender() {
  const [count, setCount] = useState(0);

  return <div>
    <p>{count}</p>
    <Button onClick={() => {
      // 這樣 count 只會加 1 次
      // setCount(count + 1);
      // setCount(count + 1);
      // setCount(count + 1);

      // 若要在 react 下次 render 前，持續增加 count，可以這樣寫
      // react 會把傳入的 function 加入 queue ，等到下次 render 時，帶入前一個 queue 的 state 執行
      setCount((prevCount) => prevCount + 1);
      setCount((prevCount) => prevCount + 1);
      setCount((prevCount) => prevCount + 1);
    }}>+1 還 +3</Button>
  </div>
}
```

### 何謂 batching
React processes state updates after event handlers have finished running. This is called batching.

## Preserving state and Resetting state
1. React 透過 component render tree 繫結 state 到相對應的 component。其實 state 並不是儲存在 component 裡，儘管從程式碼看起來像是如此。（State is not kept in JSX tags. It’s associated with the tree position in which you put that JSX.)
2. react 預設透過 render tree 的 order 來辨別 component，可以透過 key 來告訴 recact 這個 component 的唯一性。

## React 更新畫面的流程(Render and Commit)
:::info
“Rendering” means that React is calling your component, which is a function.
:::

1. Trigger a render
    2 種可能會導致 component render，1 是 component 的初次 render，2 是 component 或是他祖先的 state 被改變了。
2. React renders your components
    - 初次 render：react call root component（btw: react 使用 createElement 建立元素）
    - 後續的 render：React call 有改變 state 的 component（btw：此時 react 會去比對並紀錄 commponet 有變動的地方）
3. React commits changes to the DOM
    - 初次 render：react 透過 appendChild() 將所有 DOM node 加入畫面
    - 後續的 render：react 透過最小的改動更新畫面

## React 如何處理大量更新 state 而產生的多次 render
react 等所有 handler 跑完之後，才會去更新 states
React processes state updates after event handlers have finished running. This is called batching.

updater function 必須是 pure function，因為它在 react render component 時執行。

## Why is mutating state not recommended in React?
- debug：透過 conosle.log debug 時，如果每次都返回一個值，就可以看出物件改變的歷程。
- optimization：如果前次 state、props 與這次相同，react 就可以跳過不處理，這是其優化的策略。如果禁止 mutate object 的話，就可以相當簡單的用 `obj === obj` 來判斷是否相同了。

還有其他原因，但我覺得相對不那重要

## useCallback

# 其他 lib
SWR, Redux

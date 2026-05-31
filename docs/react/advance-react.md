---
sidebar_position: 3
---

## React component 的生命週期與重要階段

### mounting

當 component 第一次出現在畫面上時，就叫做 mounting。這也是 react 首次建立 component instance、初始化 state、執行 hooks，把 element append 進 DOM。最後，我們在畫面上看到，我們在元件內渲染的東西。

### unmounting

當 react 探測到 component 不再被需要後，會執行 clean up function，銷毀 component instance，component state，並從 DOM 中移除。

### re-rendering

這是 react 使用新的 state 更新已經存在的 component。與 mounting 相比，re-rendering 是輕量的。react 只是使用了已經存在的 component instance，執行 hooks，執行必要的計算，更新 DOM 必要的 attribute。

## react 的更新邏輯

### 觸發 re-render 的時機

什麼時候會觸發 component re-render 呢？只有一個方法，更新 state。當觸發 state 更新後，便會 re-render 該 component 底下的所有子 component。

### react 不會向上更新 render tree

另外很重要的一點，當 state 改變時，react re-render 是由改變 state 的那個 component 往其子代傳遞。

### re-render 更具體來說，是如何實現

re-render 其實就是指 react call `react component`。

re-render 是指，react 執行 function 以及其流程中所有需要被執行的（hooks），從這些 function 的回傳中，react 會建立一個物件樹，稱作「fiber tree」或「vitual DOM」。接著 react 會比對 before 和 after re-render 的 2 個物件樹，找出需要新增、移除、更新的 DOM，並更新畫面。

如果 element（objects）在 before 跟 after re-render 後，是一樣的（透過 Object.is 比對）。react 就會跳過該 component 及其底下子 component 的 re-render。

如果 Object.is 的結果是 false，
react 會去比對 react element 的 type 值，
如果一樣，則 react 會 re-render component，
如果不一樣，則 react 會 unmount 當前 component，mount 新的 component

## Memoization

#### useMemo 與 useCallback 的差異

useMemo 跟 useCallback 基本上沒有差異。只是 useMemo 是會 cache 住 function 回傳的值，而 useCallback 是 cache 住 function 本身。

`React.memo` 的用意在於避免 component re-render。當使用 `React.memo(Component)` 時，當 Component 的 parent 觸發 state 更新時，如果 Component 的 props 沒有改變， Component 不會被re-render。

#### useMemo

關於 `useMemo` 的使用情境，雖然說最常想到的是用於昂貴的計算時，但什麼是昂貴的計算卻很不好評估，因為執行時間是會隨著使用情境而改變的，前端最終面向一般 user，以 RAIL model 所提供的每次互動應該在 100ms 內為標準，仍然需要去參考使用者的裝置、當下是否有其他程式同時運作...等。

從另一個角度來說，re-render element 所花費的時間，通常還是高過於 javascript 計算的時間，所以與其想盡辦法縮短每次 re-render 都要做的昂貴計算（甚至不確定是否在所有情境下都是昂貴的計算），不如先減少 re-render 發生的可能。

也就是說，如果要用 useMemo 去避開「可能需要的昂貴計算」，除了可以先測量這個計算真實的需要花費的時間，也應該要測量 re-render element 的時間，如果後者遠高於前者，那真正要做的恐怕是盡量減少 re-render。

其他使用情境的話，`useMemo` 還是比較常搭配 `React.memo` 去使用，可以穩定 component props 的 reference，不會在每次 re-render 時，因為 reference 不一樣而 re-render。

## key

key 控制的不是 component 要不要 re-render，而是該不該直接沿用某個 key 的 已存在 element，當 re-render 發生且 key 值一樣時。

也就是說，當一個 Parent 觸發 re-render 時，key 值若保持一樣，元素仍會 re-render，但 react 會沿用原本已經存在的 instance。

```tsx=
function Input({ props }) {
  ....
}

function App() {
  const [isReversed, setIsReversed] = useState(false);
  const items: { label: string }[] = [{ label: 'text1' }, { label: 'text1' }];
  const displayItems = isReversed ? [...items].reverse() : items;

  return (
    <>
      <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isReversed}
            onChange={(e) => setIsReversed(e.target.checked)}
          />
          reverse array
        </label>
      {displayItems.map((item) => (
          <Input key={item.label} label={item.label} />
      ))}
    </>
  )
}
```

在 `setIsReversed` 執行時，Input 元件可以正常保持當前的狀態(input 值)，但仍會 re-render。
可以正常保持狀態是因為 key 在 2 次 re-render 之間，有相同的值，所以復用舊的 instance。

如果要避免 re-render，仍需要將 `Input` 用 memo 包起來。

```tsx=
const Input =  memo(function Input({ props }) {...});
```

這樣，當 parent 觸發 re-render 時，react 就會透過 key 比對，key 存在，且與先前的 props 一致，就會跳過 re-render。

## react render 機制

1. react 會在 re-renders 間比較 2 個 Vitual DOM 之間的差異，react 是比較 2 個 array 中任何層級的相同 index。新的第 1 個元素 與 舊的第 1 個元素相比，以此類推。
2. 如果 element 的 type 與在 array 的位置是相同的，react 會 re-render 該 element。如果在相同的位置上，type 不一樣，react 會 unmount 舊的元件，mount 新的元件。
3. 如果元件內部有透過 array 生成的 dynamic list，react 會無法可靠的在 re-render 之間辨認元素是否改變（插入新 item 或 排序...等）。所以需要透過 key 來辨認。尤其是如果有透過 memo 把 dynamic list 裡的 item，memo 起來，更需要透過唯一的 key 值，在 re-render 間確保 memo 有效。

## react context

1. 如果 context 的 value 有變動，不論 consumer 是否有使用變動到的 value，有使用該 context 的 consumer 都會 re-render。
2. 如果 context provider 的 parent 觸發 re-render，則 context 也會 re-render，如果 value 有變動，則使用 context 的 consumer 也會 re-render。

## 名詞

### component

1 個 function 接受參數並回傳要被渲染在螢幕上的 react elements

```jsx
const componentA = () => <Test>
```

### react element

一個物件，描述應該如何被渲染在畫面上。其中，property type，可以是 DOM element 字串（'h1'..），或 component instance。

# theme variables

## @theme vs. :root

theme variables 不只是 css 變數，tailwind 同時也會建立相關的 utility class。所以 theme variables 比起 css 變數可以做更多事。theme variables 只能用在 top level，不能用在其他 selector 或 media query 之下。

如果需要 design token 與 tailwindcss ulitily class 連動，那用 @theme 比較好，如果只是需要 css 變數，不需要有相應的 utility class，那用 :root 定義 css 變數即可。

## @theme vs. @theme inline

@theme inline 是直接把值寫入 class 中。
例如：

```css
@theme inline {
  --color-blue-500: rgb(28, 135, 197);
}

/* 會產生 */
.bg-blue-500 {
  background-color: rgb(28, 135, 197);
}
```

但如果是 @theme

```css
@theme {
  --color-blue-500: rgb(28, 135, 197);
}

/* 會產生 */
:root {
  --color-blue-500: rgb(28, 135, 197);
}
.bg-blue-500 {
  background-color: var(--color-blue-500);
}
```

在 @theme 有定義的變數中，只有有被使用到的才會被 generate 進最後的 css 裡。
如果想要總是產生所有的 css 變數，可以使用 @theme static。

```css
@theme static {
  --color-primary: var(--color-red-500);
}
```

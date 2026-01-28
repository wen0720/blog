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

## Work with tests

假設要添加測試在未覆蓋到測試的程式碼上：
步驟如下：

1. 辨識還沒被測試的 code

```
> find functions in NotificationsService.swift that are not covered by tests
```

2. 生成測試框架

```
> add test cases for edge conditions in the notification service
```

3. 生成有意義的測試案例

```
> add test cases for edge conditions in the notification service
```

4. 執行與驗證測試

```
> run the new tests and fix any failures
```

claude 可以針對目前專案已經存在的測試模式、慣例來生成測試。為了更全面的測試，可以請 claude 辨認一些可能遺漏的邊際案例，claude 可以根據程式來提供一些關於「錯誤條件」、「邊界值」、「非預期的輸入」等可能被忽略的測試案例。

## Create pull request

想像要針對這次所更動的程式建立一個文件完整的 pull request

1. 總結這次的調整
2. 建立 pr
3. 審查與完善這次的 pr
4. 增加測試細節

## Handle documentation

假設想要新增 or 更新程式庫的文件

1. 辨認沒有被文件化的程式

```
> find functions without proper JSDoc comments in the auth module
```

2. 產生文件

```
add JSDoc comments to the undocumented functions in auth.js
```

3. 審查與完善

```
> improve the generated documentation with more context and examples
```

4. 驗證文件

```
   > check if the documentation follows our project standards
```

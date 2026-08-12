# BASIC

## SELECT DISTINCT

`SELECT DISTINCT` 與 `SELECT DISTINCT ON` 的差別。`SELECT DISTINCT` 會移除所有從 query 回來一樣的 rows。`SELECT DISTINCT ON` 則是移除那些符合的 experssion，只保留第一個相符的，而這些 expression 是由你自由指定的。需要注意的是，每組資料的第一行是無法預測的，除非有使用 `ORDER BY` 去確保資料照你想要的排序。

## JOIN

### Question

#### 使用了 GROUP BY，是否就不能 SELECT 不是 GROUP BY 或 不在 aggregation 的 column

牽涉到 SQL 的執行順序，SELECT 在 GROUP BY 之後，所以只能 SELECT 到 GROUP BY 之後還會留下來的 column。
但 GROUP BY 後留下來的 column，目前實際經驗，可以不一定要寫在 GROUP BY 裡。

## QUERY PERFORMANCE

### 名詞

startup cost：產出第一筆資料前，要付出的 cost
total cost：產出全部資料，要付出的 cost

### postgres planner

postgres planner 基於 query performance 的考量，會分析多個因素去決定要使用什麼策略執行 query。
通常在 sequential scan 和 index scan 中做選擇。
考量的因素有：row 的數量、filter 需求、table size...

### 使用 index 的時機

index 常見的應用場景在篩選和排序，透過先用額外空間建立已經排序好的資料，加快 query 時的篩選和排序。

當使用一些 postgresSQL 的語法時，其實背後也有用到 index。例如：PRIMARY KEY, UNIQUE。這邊會使用到 index 主要是因為每次加入新的值時，都要確保新的值是唯一的，如果有建立 index，就不用每次都要跑一次全部的值。

但應只在非常頻繁使用的 query，且已經出現效能相關議題的情況下，建立 index，除非出現明確的效能問題，不然不要過早建立 index。並且要 drop 掉沒有在使用的 index。

因為建立 index 就要消耗空間去儲存，並且 planner 也需要在每次執行 query 時，去評估每個 index，看有沒有可以使用的，這也會影響 qeury 時間。所以 index 絕對不是越多越好。

### index 類型

**B-Tree**
postgresSQL 中，預設的 index 類型是 B-tree。常用來做 exact match、sort operation、ordering。

**Hash**
只適合處理 strict equality checks，其他不適合。

**BRIN**
適合用在極為龐大的 table，在這個情境下，btree 可能不再適合。BRIN 是更小更緊湊的，因此可以更方便的建立更大的 table 索引

**GIN INDEX**

測試：建立索引之後，會不會 INSERT 變慢？
在 movies 建立 GIN Index 之後，insert 新的 row 沒有變慢。

### Question

#### index 在 database 中，該如何理解

index 存在的目的是為了加快查詢效能，避免逐筆查詢。預設透過 btree 建立索引，讓查詢時，可以更快地找到要找的資料。

#### 在 query performance analysis 中，cost unit 是如何運作的？

cost unit 以本機讀取 single sequential page read 的時間為 1 個 unit。每個裝置都可能不一樣。所以這是一個相對單位。
在相同的環境（裝置）中，提供可以被比較的固定單位。

#### EXPLAIN ANALYZE 的 cost 可以怎麼解讀

e.g. `cost=810.22..983.11`

第一個 cost 是回傳第一筆資料所需的 cost unit。
第二個 cost 是回傳全部資料所需的 cost unit。

## Views, Subqueries & Arrays

### View

view 是一個虛擬的 table，讓我們可以簡化複雜 query 或資料過濾。為了便利（簡化複雜的 query 與 join）與安全性（可以限制使用者只能存取 view，不能存取底層 table）而該使用的功能。

### Materialized View

Materialized View 與 View 的差別是，他不是即時更新的資料，而是用快照的概念，把 query 執行當下的資料存起來，變成一張真正的 table。
也因為變成 table，所以可以對 Materialized View 做 index。

## Window Functions

### 用途

Window function 會針對與當前 row 相關的一組 rows(稱為 window)進行計算，並把結果放回每一筆 row 裡，而不像 aggregate function 那樣把多筆 rows 縮成一筆。

這組 rows(window)由 OVER 子句定義，可搭配 PARTITION BY、ORDER BY 指定範圍與順序。對 aggregate function(如 SUM、AVG)加上 OVER 即可當成 window function 使用；另外也有一些專門的 window function（如 ROW_NUMBER、RANK、LAG），本身就必須搭配 OVER。

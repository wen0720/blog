# Self-Referencing Foreign Key

在關聯式資料庫裡，FK 代表這個欄位連接到另一個 table 的 PK，用來建立 2 個表之間的關係。

而也有一種 FK 的形式，被稱為 self-referencing foreign key，在同一個 table 裡參照特定欄位，如此建立了同一個 table 裡，row 與 row 之間的關係。

self-referencing foreign key 又被稱為 recursive foreign key。在這個 table 的 FK reference 到同一張 table 的 PK。簡而言之，這樣建立了同樣一張 table 裡，2 個 row 之間的關係。這個概念在表示單一實體的層級關係或遞回式關係時特別有用。像是，組織架構圖、分類、巢狀物件。

## 常見場景

- _層級式資料_：經典的案例是組織結構圖，每個 employee 要跟 manager 匯報，而所有的 manager 也都是 employee。在這個場景中，employee table 會有一個自我參照的 key 指向 manager_id。

- _分類樹_：在電子商務平台管理產品分類時，每一個分類都有一個父分類，如此表示出一個樹狀結構。所以 category table 就會有一個 parent_category_id 欄位，在同一張 table 中參照父 category 的 id。

- _討論串_：在論壇或評論區塊，每一個回覆可以被關聯於另一個回覆，形成一個討論串。所以 comments table 就需要有一個 parent_comment_id 做自我參照。

## Self-Reference Foreign Key 如何使用

如果有一個 employee table 被設計用來儲存組織資訊。

| id  | name     | manager_id |
| --- | -------- | ---------- |
| 1   | Boss     | NULL       |
| 2   | Manager1 | 1          |
| 3   | Manaegr2 | 1          |
| 4   | Staff1   | 2          |
| 5   | Staff2   | 2          |

從表中可以看出來，Manager1 與 Manager2 由 Boss 管理。
Staff1 與 Staff2 由 Manager1 管理。
透過 Manager_ID reference Employee_ID 來表示這樣的層級關係。

用 SQL 語法，可以這樣表示

```sql
CREATE TABLE employees (
    id integer PRIMARY KEY,
    name text,
    manager_id integer REFERENCES employees(id) ON DELETE RESTRICT
);
```

接著加入資料

```sql
INSERT INTO employees
  (id, name, manager_id)
VALUES
  (1, 'Boss', NULL),
  (2, 'Manager1', 1),
  (3, 'Manager2', 1),
  (4, 'Staff1', 2),
  (5, 'Staff2', 2);
```

透過 join 列出每個人的管理者

```sql
SELECT
  l.id, l.name, l.manager_id, r.name AS manager_name
FROM
  employees l
LEFT JOIN
  employees r
ON
  l.manager_id = r.id
```

## Self-Referencing Foreign Key 的好處

1. 資料完整性：使用 self-referencing foreign key 可以確保層級資料保持一致，避免 orphaned records。
2. Query 簡單化：在處理多層級的資料時，可以讓 SQL query 變得直觀
3. 資料庫正規化：透過單一表格代表複雜的層級關係，幫助減少冗餘。

## Self-Referencing Foreign Key 的潛在議題

1. 複雜度：用 self-referencing foreign key 管理大量或多層級的資料是複雜的。
2. Performance：Recursive queries，特別是涉及的資料層級很深時，會消耗大量效​​能。
3. 循環引用：要避免 row 間接引用到自己，會導致無限迴圈。

## Reference

[Understanding Self-Referencing Foreign Keys: A Beginner’s Tutorial](https://database.guide/understanding-self-referencing-foreign-keys-a-beginners-tutorial/)

---
sidebar_position: 1
---

# Learn

## Schemas and Types

GraphQL 的 type system 描述資料如何從 API 被查詢。

### 本章重點

- 根據選擇用於建立 GraphQL 服務的 lib，可以透過 SDL 的方式來建立 schema（language-agnostic）。或者也可以透過 compile 提供欄位資料的 code，來建立 schema。
- interface 與 type 的差別：graphQL 的 interface 是 abstract 的，常被用來實踐 type，雖然可以在 schema `type Query` 中作為回傳的型別，但實際上還是要在 resolver 中確定實際回傳的 type。
- GraphQL 的基本 scalar types 有 `Int`, `Float`, `String`, `Boolean`, `ID`，可以自定義。
- interface 與 Union type 是 abstract type，讓單一 field 可以輸出不同的特定 object type。
- input object type 可以被 fields argument 與 directive argument 使用，可以產生相較於 scalar types 更複雜的值
- directives：主要應用情境是當 field arguments 不好用 或 某些重複的行為產生時，directives 透過 @ + directive name 來修改 GraphQL schema 或 operation，依照規格，預設的 directive 有 `@include`、`@skip`、`@deprecated`...，還有[其他](https://spec.graphql.org/draft/#sec-Type-System.Directives.Built-in-Directives)。

### Root Operation Types

schema 包含主要的 3 個 root operation Types，query, mutation, subscription。基本上 operation type 就是在定義 api entry point。

### interface 理解

GraphQL 的 interface 與 typescript 不同，基本上是一個 abstract type。可以透過先定義一個基礎的規格，再讓其他 type 延伸它。

```
interface Character {
  id: ID
  name: String!
}

type PowerMan implements Character {
  id: ID
  name: String!
  # new field
  power: Int
}

type SkillMan implements Character {
  id: ID
  name: String!
  # new field
  skill: SomeEnumSkill
}
```

不過，schema 在定義時，是可以回傳 interface 的。e.g. query type

```
schema {
  query: {
    hero(style: SomeEnumStyle): Character
  }
}
```

但最終仍會透過 resolver 去決定會取得 SkillMan 或 PowerMan

## Queries

GraphQL 支援三種主要的 operation type：query, mutation, subscription。

可以透過 query keyword 定義 query，並命名 query name，方便 server 查 log。

```
query HeroNameAndFriends {
  hero {
    name
  }
}
```

### query 是可以傳入變數的，變數也可以再傳到底下的 fragment 或 field argument

## Mutations

根據 GraphQL 的規格，除了 mutation 以外，其餘的欄位解析都應該是 side effect-free 且 idempotent。

### Mutation 的執行是按順序的

```
mutation {
  firstShip: deleteStartShip(id: "3001")
  secondShip: deleteStartShip(id: "3002")
}
```

query 通常是 excute in parallel，但 mutation 是 run in series。
如上的 mutation，`firstShip: deleteStartShip` 會先執行，等到執行完後，再執行 `secondShip: deleteStartShip`。
但這與 database transaction 不同，因為沒有 rollback 機制。

### Introspection

透過 GraphQL query 查詢 GraphQL schema。

## 問題

1. 要取得 List 裡的 object type 的所有 field，如何寫 query，且不用列出全部的 key?

Ans：如果要複用的話，可以用 fragment，不過似乎沒有一個一次回傳全部欄位的關鍵字。

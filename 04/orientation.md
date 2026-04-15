# 第4週：データベース設計（3）アソシエーション

## 今日のゴール

外部キーとモデルの関係を結びつけて、`has_many` と `belongs_to` を使ってテーブル同士のつながりをRailsのコードで表せるようになる。

---

## 前回のおさらい

前回は、ER図をもとにマイグレーションを書いて、データベースの形を作りました。

- `categories` テーブルを作った
- `articles` に `category_id` を追加した
- `comments` テーブルを作った
- `comments` に `article_id` が入っている

つまり、データベース側では、もう「どのデータがどこにつながるか」は表現できています。

今週やるのは、その関係をRailsのモデルに書くことです。

---

## アソシエーションとは

アソシエーションは、モデル同士のつながりをRailsのコードで表す仕組みです。

たとえば：

- 記事は1つのカテゴリに属する
- カテゴリは複数の記事を持つ
- 記事は複数のコメントを持つ
- コメントは1つの記事に属する

こうした関係を、Railsでは `belongs_to` や `has_many` で書きます。

※ ここには後で、DB の外部キーと model の association の対応図を追加します。

<!-- TODO: category_id / article_id と belongs_to / has_many の対応関係を図で示す -->

---

## `belongs_to`

`belongs_to` は、「このモデルは、1つの別モデルに属する」という意味です。

たとえば `articles` テーブルには `category_id` があります。

これは、「1つの記事は、1つのカテゴリに属する」と読めます。

だから `Article` モデルにはこう書きます。

```ruby
class Article < ApplicationRecord
  belongs_to :category
end
```

`belongs_to` は、ふつう外部キーを持っている側に書きます。

今回なら：

- `articles` に `category_id` があるので `Article` に `belongs_to :category`
- `comments` に `article_id` があるので `Comment` に `belongs_to :article`

---

## `has_many`

`has_many` は、「このモデルは、複数の別モデルを持つ」という意味です。

さっきと逆側から見ると：

- 1つのカテゴリには、複数の記事が入る
- 1つの記事には、複数のコメントがつく

だから、次のように書けます。

```ruby
class Category < ApplicationRecord
  has_many :articles
end
```

```ruby
class Article < ApplicationRecord
  has_many :comments
end
```

`has_many` は、相手を複数持つ側に書きます。

---

## どちら側に何を書くか

迷ったときは、まず外部キーを見ます。

今回の関係なら：

- `articles.category_id`
- `comments.article_id`

ここから、次のように決まります。

| 外部キー | `belongs_to` を書くモデル | `has_many` を書くモデル |
|---|---|---|
| `articles.category_id` | `Article` | `Category` |
| `comments.article_id` | `Comment` | `Article` |

つまり、外部キーがある側が `belongs_to`、その反対側が `has_many` です。

---

## モデルファイルはどこにあるか

モデルファイルは `app/models/` にあります。

今回使うのは次の3つです。

- `app/models/article.rb`
- `app/models/category.rb`
- `app/models/comment.rb`

第1週で <ruby>scaffold<rt>スキャフォールド</rt></ruby> を使ったので、`article.rb` はすでにあります。

ただし `category.rb` と `comment.rb` は、まだない可能性があります。その場合は自分で作ります。

※ ここには後で、`app/models/` フォルダの位置がわかるスクリーンショットを追加します。

<!-- TODO: VS Code / Codespaces で app/models を開いた状態のスクリーンショットを追加する -->

---

## アソシエーションを書くと何がうれしいか

アソシエーションを書くと、Railsで自然な形で関連データにたどれます。

たとえば：

```ruby
article.category
category.articles
article.comments
comment.article
```

このように、「どのカテゴリに属するか」「そのカテゴリの記事一覧は何か」「その記事のコメントは何か」を、Railsらしい書き方で取り出せます。

つまり、外部キーを自分で毎回追いかけなくてよくなります。

---

## 今週から来週へ

今週は、モデルに association を書きます。

- 第2週：ER図で関係を決めた
- 第3週：migration でカラムを作った
- 今週：model に `belongs_to` / `has_many` を書く
- 来週：この関係を使いながら scaffold なし CRUD に入る

来週以降、記事一覧や詳細画面を自分で作るときに、

- `@article.category`
- `@article.comments`

のような形で関連データを扱えることが大きな武器になります。

---

## まとめ

今日やったこと：

1. association がモデル同士のつながりを表すことを確認した
2. 外部キーがある側に `belongs_to` を書くことを知った
3. 反対側に `has_many` を書くことを知った
4. association を書くと関連データに自然にたどれることを確認した

覚えておくこと：

- 外部キーがある側が `belongs_to`
- 反対側が `has_many`
- DBで作った関係を、Railsのモデルに写すのが今週の作業

# 第4週：練習 ── `has_many` と `belongs_to` を書く

## 今日のゴール

`Article` `Category` `Comment` のモデルに association を書き、`rails console` で関連データをたどれるようになる。

---

## 準備

1. Codespacesを起動する
2. `review_app` ディレクトリに移動する
3. `app/models/` を開く
4. `db/schema.rb` も開いて、外部キーを見返せるようにする

もし `review_app` がない場合は、第1週から第3週の内容を参考に作り直してください。

※ ここには後で、`app/models/` と `db/schema.rb` を並べて開く位置がわかるスクリーンショットを追加します。

<!-- TODO: VS Code / Codespaces で app/models と db/schema.rb を並べて開く手順のスクリーンショットを追加する -->

---

## 今日の目標（達成ライン）

- `必須（全員）`：1〜4 を終える（外部キーを確認する、Category/Comment のモデルを作る、Article/Category/Comment に association を書く、console で確認する）
- `推奨（余裕がある人）`：5 まで進む（関連を自分の言葉で説明する）
- `発展（早く終わった人）`：[Stretch](stretch.md) に進む

orientation とこの練習は、全員が終える前提です。まずは `必須` を確実に終えましょう。

---

## 1. `schema.rb` から外部キーを確認する（15分）

まずは `db/schema.rb` を見て、次の2つのカラムを探してください。

- `articles` テーブルの `category_id`
- `comments` テーブルの `article_id`

### やってみよう

次の2つに答えてみましょう。

1. `category_id` があるので、どのモデルに `belongs_to :category` を書くべきか
2. `article_id` があるので、どのモデルに `belongs_to :article` を書くべきか

<details>
<summary>解答例</summary>

1. `Article`
2. `Comment`

</details>

---

## 2. `Category` と `Comment` のモデルファイルを作る（20分）

`Article` は <ruby>scaffold<rt>スキャフォールド</rt></ruby> で作られているので、すでに `app/models/article.rb` があります。

一方で、`Category` と `Comment` は migration は作りましたが、モデルファイルはまだないかもしれません。

その場合は、次の2つのファイルを作ってください。

- `app/models/category.rb`
- `app/models/comment.rb`

中身は最初はこれだけで構いません。

```ruby
class Category < ApplicationRecord
end
```

```ruby
class Comment < ApplicationRecord
end
```

### 確認ポイント

- `app/models/article.rb`
- `app/models/category.rb`
- `app/models/comment.rb`

の3つがそろっているか確認してください。

※ ここには後で、新しい model ファイルを作る手順のスクリーンショットを追加します。

<!-- TODO: app/models/category.rb と app/models/comment.rb を新規作成する操作のスクリーンショットを追加する -->

---

## 3. `Article` と `Category` を関連づける（25分）

まずは、記事とカテゴリの関係を書きます。

`app/models/article.rb` を開いて、次のようにしてください。

```ruby
class Article < ApplicationRecord
  belongs_to :category, optional: true
end
```

`app/models/category.rb` は、次のようにします。

```ruby
class Category < ApplicationRecord
  has_many :articles
end
```

今回は `Article` に `optional: true` を付けています。最初に scaffold で作った記事の中には、まだカテゴリが設定されていないものがある可能性があるからです。

### やってみよう

書けたら、`rails console` を起動して次を試してください。

```ruby
category = Category.create!(name: "Rails")
article = Article.first || Article.create!(title: "関連づけの練習", body: "association を確認する", category: category)
article.update!(category: category)

article.category
category.articles
```

<details>
<summary>確認例</summary>

- `article.category` で、その記事のカテゴリが見える
- `category.articles` で、そのカテゴリに属する記事の一覧が見える

</details>

---

## 4. `Article` と `Comment` を関連づける（30分）

次は、記事とコメントの関係を書きます。

`app/models/article.rb` を次のようにします。

```ruby
class Article < ApplicationRecord
  belongs_to :category, optional: true
  has_many :comments
end
```

`app/models/comment.rb` は、次のようにします。

```ruby
class Comment < ApplicationRecord
  belongs_to :article
end
```

### やってみよう

さっきの `rails console` の続きで、次を試してください。

```ruby
comment = Comment.create!(article: article, author_name: "田中", body: "コメントの練習")

article.comments
comment.article
```

### 確認ポイント

- `article.comments` でコメント一覧が見えるか
- `comment.article` で元の記事が見えるか

※ ここには後で、`article.comments` と `comment.article` の実行結果例をスクリーンショット付きで追加します。

<!-- TODO: rails console で article.comments と comment.article を実行した結果例のスクリーンショットを追加する -->

---

## 5. 自分の言葉で説明する（20分）

最後に、次の4つを自分の言葉で説明してみましょう。

1. なぜ `Article` に `belongs_to :category` を書くのか
2. なぜ `Category` に `has_many :articles` を書くのか
3. なぜ `Comment` に `belongs_to :article` を書くのか
4. なぜ `Article` に `has_many :comments` を書くのか

`schema.rb` を見ながら説明して構いません。

<details>
<summary>説明例</summary>

`articles` テーブルには `category_id` があるので、記事は1つのカテゴリに属します。だから `Article` に `belongs_to :category` を書きます。

カテゴリ1つに対して記事は複数入るので、`Category` には `has_many :articles` を書きます。

同じように、`comments` テーブルには `article_id` があるので、コメントは1つの記事に属します。だから `Comment` に `belongs_to :article` を書きます。

記事1つに対してコメントは複数つくので、`Article` には `has_many :comments` を書きます。

</details>

---

## まとめ

今日やったこと：

1. `schema.rb` から外部キーを確認した
2. `Category` と `Comment` のモデルファイルを作った
3. `Article` と `Category` の association を書いた
4. `Article` と `Comment` の association を書いた
5. `rails console` で関連データを確認した

次週からは、このつながりを使いながら scaffold なし CRUD に入ります。

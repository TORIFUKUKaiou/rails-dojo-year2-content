# 第4週：練習 ── `has_many` と `belongs_to` を書く

## 今日のゴール

`Article` `Category` `Comment` のモデルに association を書き、`rails console` で関連データをたどれるようになる。

---

## 準備

この練習は、GitHub Codespaces 上で行います。

前回の続きは使わず、 **新しく Codespace を作って** 始めてください。

生徒ごとに前回の状態が違うため、第4週用に `review_app4` という Rails アプリを新しく作ります。

1. GitHubにログインする
2. [このリポジトリ](https://github.com/TORIFUKUKaiou/rails-dojo-year2-content/)を開く（リンクを右クリックして、「リンクを新しいタブで開く」）
3. リポジトリの `Code` ボタン → `Codespaces` タブを開く
4. `Create a codespace on main(+)` をクリックする

    ![](../images/create-a-codespace-on-main.png)

    ---

    **緑のボタンがある場合**は、この手順でも構いません。`Create codespace on main` をクリックしてください。

    ![](https://raw.githubusercontent.com/TORIFUKUKaiou/rails-dojo-year1-content/refs/heads/main/images/create-codespace-on-main.png)
    ---

5. ターミナルに `準備完了` と表示されたら、Codespaces の起動完了

💡 コマンドは一行ずつ実行しましょう。ひとつひとつ実行結果を確かめながら進むのが上達への近道です。

次に、Rails をインストールします。

```bash
gem install rails -v "~> 8.1.0" --no-document
rails -v
```

`rails 8.1.x` のように表示されたら、Rails が使える状態です。

続いて、第4週用の Rails アプリを作ります。

```bash
cd ~/
rails new review_app4
cd review_app4
```

`rails new review_app4` は、必要なファイルとライブラリを作るため時間がかかります。終わるまで待ってください。

次に、<ruby>scaffold<rt>スキャフォールド</rt></ruby> で、今回使う `Category` `Article` `Comment` を作ります。

```bash
rails generate scaffold Category name:string
rails generate scaffold Article title:string body:text category:references
rails generate scaffold Comment article:references author_name:string body:text
```

`category:references` によって、`articles` テーブルに `category_id` が作られます。

`article:references` によって、`comments` テーブルに `article_id` が作られます。

確認したら、マイグレーションを実行します。

```bash
rails db:migrate
```

ここまでできたら、`review_app4` の中にある `app/models/` と `db/schema.rb` を開ける状態にしてください。

---

## 1. `schema.rb` から外部キーを確認する

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

## 2. モデルファイルを確認する

準備で scaffold を実行したので、次の3つのモデルファイルが作られています。

- `app/models/article.rb`
- `app/models/category.rb`
- `app/models/comment.rb`

まず、それぞれのファイルを開いてください。

`app/models/article.rb` には、すでに次のような行が入っているはずです。

```ruby
class Article < ApplicationRecord
  belongs_to :category
end
```

`app/models/comment.rb` には、すでに次のような行が入っているはずです。

```ruby
class Comment < ApplicationRecord
  belongs_to :article
end
```

`category:references` や `article:references` を使って scaffold したので、Rails が `belongs_to` を自動で書いてくれています。

一方で、`app/models/category.rb` はまだ次のように空に近い状態です。

```ruby
class Category < ApplicationRecord
end
```

### 確認ポイント

- `Article` に `belongs_to :category` があるか
- `Comment` に `belongs_to :article` があるか
- `Category` にはまだ association が書かれていないこと

---

## 3. `Article` と `Category` を関連づける

まずは、記事とカテゴリの関係を書きます。

`app/models/article.rb` を開いて、次のようにしてください。

```ruby
class Article < ApplicationRecord
  belongs_to :category
end
```

`app/models/category.rb` は、次のようにします。

```ruby
class Category < ApplicationRecord
  has_many :articles
end
```

`Article` の `belongs_to :category` は scaffold がすでに作っています。

ここでは、逆向きの `has_many :articles` を `Category` に追加します。

### やってみよう

書けたら、`rails console` を起動して次を試してください。

```ruby
category = Category.create!(name: "Rails")
article = Article.create!(title: "関連づけの練習", body: "association を確認する", category: category)

article.category
category.articles
```

<details>
<summary>確認例</summary>

- `article.category` で、その記事のカテゴリが見える
- `category.articles` で、そのカテゴリに属する記事の一覧が見える

</details>

---

## 4. `Article` と `Comment` を関連づける

次は、記事とコメントの関係を書きます。

`app/models/article.rb` を次のようにします。

```ruby
class Article < ApplicationRecord
  belongs_to :category
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
article = Article.last
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

## 5. 自分の言葉で説明する

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
2. scaffold が作ったモデルファイルを確認した
3. `Article` と `Category` の association を確認し、`Category` に `has_many` を書いた
4. `Article` と `Comment` の association を書いた
5. `rails console` で関連データを確認した

[Stretch](stretch.md) へ進みましょう。

次週からは、このつながりを使いながら scaffold なし CRUD に入ります。

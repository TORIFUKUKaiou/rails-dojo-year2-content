# 第3週：練習 ── マイグレーションを手で書く

## 今日のゴール

ER図を見ながら、自分の手でマイグレーションを書いてデータベースの形を作れるようになる。

---

## 準備

この練習は、GitHub Codespaces 上で行います。

前回の続きは使わず、 **新しく Codespace を作って** 始めてください。  
生徒ごとに前回の状態が違うため、第3週用に `review_app3` という Rails アプリを新しく作ります。

1. GitHubにログインする
2. [このリポジトリ](https://github.com/TORIFUKUKaiou/rails-dojo-year2-content/)を開く（リンクを右クリックして、「リンクを新しいタブで開く」）
3. リポジトリの `Code` ボタン → `Codespaces` タブを開く
4. `Create a codespace on main(+)` をクリックする

    ![](../images/create-a-codespace-on-main.png)

    画面の表示が少し違う場合は、`Create codespace on main` と書かれたボタンをクリックしてください。

5. ターミナルに `準備完了` と表示されたら、Codespaces の起動完了

💡 コマンドは一行ずつ実行しましょう。ひとつひとつ実行結果を確かめながら進むのが上達への近道です。

次に、Rails をインストールします。

```bash
gem install rails --no-document
rails -v
```

`rails 8.x.x` のように表示されたら、Rails が使える状態です。

続いて、第3週用の Rails アプリを作ります。

```bash
cd ~/
rails new review_app3
cd review_app3
```

`rails new review_app3` は、必要なファイルとライブラリを作るため時間がかかります。終わるまで待ってください。

次に、<ruby>scaffold<rt>スキャフォールド</rt></ruby> で `articles` を作ります。

```bash
rails generate scaffold Article title:string body:text
```

`db/migrate/` に `xxxx_create_articles.rb` のようなファイルができているはずです。まず開いて、中身を確認してください。

確認したら、マイグレーションを実行します。

```bash
rails db:migrate
```

ここまでできたら、`review_app3` の中にある `db/migrate/` と `db/schema.rb` を開ける状態にしてください。

※ ここには後で、`db/migrate/` と `db/schema.rb` を開く位置がわかるスクリーンショットを追加します。

<!-- TODO: VS Code / Codespaces で db/migrate と db/schema.rb を並べて開く手順のスクリーンショットを追加する -->

---

## 今日の目標（達成ライン）

- `必須（全員）`：1〜4 を終える（既存 migration を読む、categories を作る、category_id を追加する、comments を作る）
- `推奨（余裕がある人）`：5 まで進む（schema.rb と `rails console` で確認する）
- `発展（早く終わった人）`：[Stretch](stretch.md) に進む

orientation とこの練習は、全員が終える前提です。まずは `必須` を確実に終えましょう。

---

## 1. 既存のマイグレーションを読む（15分）

まずは、scaffoldが作った `articles` 用のマイグレーションを開いてください。

ファイル名は次のようになっているはずです。

```text
db/migrate/xxxxxx_create_articles.rb
```

中身はだいたいこうなっています。

```ruby
class CreateArticles < ActiveRecord::Migration[8.1]
  def change
    create_table :articles do |t|
      t.string :title
      t.text :body
      t.timestamps
    end
  end
end
```

### やってみよう

次の3つを自分の言葉で説明してみましょう。

1. `create_table :articles` は何をしているか
2. `t.string :title` は何をしているか
3. `t.timestamps` は何をしているか

<details>
<summary>解答例</summary>

1. `articles` テーブルを作っている
2. `title` という文字列のカラムを作っている
3. `created_at` と `updated_at` を作っている

</details>

---

## 2. `categories` テーブルを手で作る（30分）

前回のER図では、カテゴリを管理する `categories` テーブルが必要でした。

まず、空のマイグレーションファイルを作ります。

```bash
rails generate migration CreateCategories
```

できたファイルを開いて、次のように書いてください。

```ruby
class CreateCategories < ActiveRecord::Migration[8.1]
  def change
    create_table :categories do |t|
      t.string :name
      t.timestamps
    end
  end
end
```

書けたら、実行します。

```bash
rails db:migrate
```

### 確認ポイント

- `db/schema.rb` に `categories` テーブルが増えているか
- `name` `created_at` `updated_at` が入っているか

<details>
<summary>解答例</summary>

`db/schema.rb` に、次のような部分が追加されます。

```ruby
create_table "categories", force: :cascade do |t|
  t.string "name"
  t.datetime "created_at", null: false
  t.datetime "updated_at", null: false
end
```

</details>

---

## 3. `articles` に `category_id` を追加する（25分）

次は、記事がどのカテゴリに属するかを表す `category_id` を追加します。

まず、空のマイグレーションファイルを作ります。

```bash
rails generate migration AddCategoryIdToArticles
```

できたファイルに、次のように書いてください。

```ruby
class AddCategoryIdToArticles < ActiveRecord::Migration[8.1]
  def change
    add_column :articles, :category_id, :integer
  end
end
```

実務では `add_reference :articles, :category` のように書くことも多いです。ただし今回は、`category_id` というカラムを自分の目で確認しやすいように、あえて `add_column` で書きます。

そのあと、実行します。

```bash
rails db:migrate
```

### 確認ポイント

- `articles` テーブルに `category_id` が増えているか
- `db/schema.rb` の `articles` の欄に `category_id` があるか

<details>
<summary>解答例</summary>

`db/schema.rb` の `articles` に、次の1行が追加されます。

```ruby
t.integer "category_id"
```

</details>

---

## 4. `comments` テーブルを手で作る（35分）

次は、コメントを保存する `comments` テーブルを作ります。

まず、空のマイグレーションファイルを作ります。

```bash
rails generate migration CreateComments
```

できたファイルに、次のように書いてください。

```ruby
class CreateComments < ActiveRecord::Migration[8.1]
  def change
    create_table :comments do |t|
      t.integer :article_id
      t.string :author_name
      t.text :body
      t.timestamps
    end
  end
end
```

そのあと、実行します。

```bash
rails db:migrate
```

### 確認ポイント

- `comments` テーブルができているか
- `article_id` `author_name` `body` が入っているか
- 前回のER図と見比べて、対応しているか

※ ここには後で、ER図と migration ファイルを見比べる図を追加します。

<!-- TODO: comments テーブルの ER図と CreateComments migration の対応がわかる図を追加する -->

<details>
<summary>解答例</summary>

`db/schema.rb` に、次のような部分が追加されます。

```ruby
create_table "comments", force: :cascade do |t|
  t.integer "article_id"
  t.string "author_name"
  t.text "body"
  t.datetime "created_at", null: false
  t.datetime "updated_at", null: false
end
```

</details>

---

## 5. `schema.rb` と `rails console` で確認する（20分）

最後に、いまのデータベースの形を確認します。

### `schema.rb` を見る

次の3つがあることを確認してください。

- `categories`
- `articles`
- `comments`

### `rails console` で見る

```ruby
Article.column_names
```

`Article` は scaffold でモデルが作られているので、そのまま確認できます。

一方で、いまの時点では `Category` と `Comment` のモデルファイルはまだ作っていません。なので、`categories` と `comments` の確認は `schema.rb` を中心に行ってください。

### やってみよう

それぞれの結果を見て、次の2つに答えてみましょう。

1. `articles` と `comments` は、どのカラムでつながるか
2. `articles` と `categories` は、どのカラムでつながるか

<details>
<summary>解答例</summary>

1. `comments.article_id`
2. `articles.category_id`

</details>

---

## まとめ

今日やったこと：

1. 既存の migration を読んだ
2. `categories` テーブルを手で作った
3. `articles` に `category_id` を追加した
4. `comments` テーブルを手で作った
5. `schema.rb` と `rails console` で結果を確認した

来週は、このカラムをもとに `has_many` と `belongs_to` を書きます。

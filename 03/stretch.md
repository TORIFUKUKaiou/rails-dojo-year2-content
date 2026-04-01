# 第3週：Stretch ── マイグレーションをもう少し動かす

## 今日のゴール

マイグレーションを「作る」だけでなく、「戻す」「追加する」「次週につなげる」ところまで試して理解を深める。

---

## この課題について

この課題は、[練習](practice.md) を終えた人向けの発展課題です。時間内にすべて終わらなくても構いません。できるところまで進めてください。

---

## 今日の目標（達成ライン）

- `推奨`：課題1〜2 に取り組む
- `発展`：課題3 まで進む
- `さらに余裕がある人`：課題4 まで進む

---

## 課題1：`rollback` を試す（20分）

直前に実行したマイグレーションを1つ戻して、もう一度進めてみましょう。

```bash
rails db:rollback
rails db:migrate
```

### やってみよう

1. `rollback` のあと、どのテーブルまたはカラムが戻ったか確認する
2. `migrate` のあと、元に戻ったか確認する

確認方法は `db/schema.rb` でも `rails console` でも構いません。

<details>
<summary>確認例</summary>

直前の migration が `CreateComments` なら、`rollback` のあと `comments` テーブルが消えます。もう一度 `migrate` すると、`comments` テーブルが戻ります。

</details>

---

## 課題2：`categories` に説明文を追加する（20分）

カテゴリに説明文を持たせたいとします。`description` カラムを追加してください。

まず、マイグレーションファイルを作ります。

```bash
rails generate migration AddDescriptionToCategories
```

中身を次のように書きます。

```ruby
class AddDescriptionToCategories < ActiveRecord::Migration[8.0]
  def change
    add_column :categories, :description, :text
  end
end
```

そのあと、実行します。

```bash
rails db:migrate
```

### 確認ポイント

- `categories` に `description` が増えているか
- `schema.rb` に反映されているか

---

## 課題3：`users` テーブルを先取りして作る（25分）

第2週の Stretch では、投稿者を `users` テーブルに分ける案がありました。

今回は、その設計を migration にしてみます。

### 要件

- `users` テーブルを作る
- `name` カラムを持つ
- `articles` に `user_id` を追加する
- `comments` に `user_id` を追加する

### やってみよう

必要な migration を考えて、ファイルを作ってみましょう。コードを完全に覚えていなくても構いません。前の課題を見ながら書いてよいです。

<details>
<summary>解答例</summary>

たとえば、次の3本になります。

1. `CreateUsers`
2. `AddUserIdToArticles`
3. `AddUserIdToComments`

例：

```ruby
class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :name
      t.timestamps
    end
  end
end
```

```ruby
class AddUserIdToArticles < ActiveRecord::Migration[8.0]
  def change
    add_column :articles, :user_id, :integer
  end
end
```

```ruby
class AddUserIdToComments < ActiveRecord::Migration[8.0]
  def change
    add_column :comments, :user_id, :integer
  end
end
```

</details>

---

## 課題4：次週の association を先取りする（20分）

いま作ったカラムを見て、来週どんな association が必要になるか考えてみましょう。

たとえば：

- `articles` に `category_id` がある
- `comments` に `article_id` がある

このとき、`Article` `Category` `Comment` にどんな `has_many` / `belongs_to` が書かれそうか、言葉で整理してみてください。

<details>
<summary>考え方の例</summary>

- `Article` は1つの `Category` に属するので `belongs_to :category`
- `Category` は複数の `Article` を持つので `has_many :articles`
- `Comment` は1つの `Article` に属するので `belongs_to :article`
- `Article` は複数の `Comment` を持つので `has_many :comments`

</details>

※ ここには後で、`category_id` / `article_id` と `belongs_to` / `has_many` の対応図を追加します。

<!-- TODO: DB の外部キーと Rails の association の対応関係を示す図を追加する -->

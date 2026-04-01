# 第4週：Stretch ── association を深くする

## 今日のゴール

基本の `has_many` / `belongs_to` だけでなく、削除時の挙動や追加の関連まで考えて、association の理解を深める。

---

## この課題について

この課題は、[練習](practice.md) を終えた人向けの発展課題です。時間内にすべて終わらなくても構いません。できるところまで進めてください。

---

## 今日の目標（達成ライン）

- `推奨`：課題1〜2 に取り組む
- `発展`：課題3 まで進む
- `さらに余裕がある人`：課題4 まで進む

---

## 課題1：`User` との関連を足す（25分）

第2週と第3週の Stretch では、投稿者を `users` テーブルに分ける案を考えました。

もし前週までに `users` テーブルと `user_id` を作っているなら、今回は association まで書いてみましょう。

### やってみよう

次の関係をモデルに書いてください。

- 1人のユーザーは複数の記事を書く
- 1人のユーザーは複数のコメントを書く
- 記事は1人のユーザーに属する
- コメントは1人のユーザーに属する

<details>
<summary>解答例</summary>

```ruby
class User < ApplicationRecord
  has_many :articles
  has_many :comments
end
```

```ruby
class Article < ApplicationRecord
  belongs_to :category, optional: true
  belongs_to :user, optional: true
  has_many :comments
end
```

```ruby
class Comment < ApplicationRecord
  belongs_to :article
  belongs_to :user, optional: true
end
```

</details>

---

## 課題2：`dependent: :destroy` を考える（20分）

もし記事を削除したとき、その記事についたコメントも一緒に消したいなら、どう書けばよいでしょうか。

### やってみよう

`Article` の `has_many :comments` を書き換えてみてください。

<details>
<summary>解答例</summary>

```ruby
class Article < ApplicationRecord
  belongs_to :category, optional: true
  has_many :comments, dependent: :destroy
end
```

これで、記事が削除されたときに、その記事に属するコメントも一緒に削除されます。

</details>

---

## 課題3：どの association が必要かを当てる（20分）

次の関係を見て、どのモデルに `has_many`、どのモデルに `belongs_to` を書くか考えてください。

1. `users.id` と `articles.user_id`
2. `articles.id` と `comments.article_id`
3. `categories.id` と `articles.category_id`

<details>
<summary>解答例</summary>

1.
- `Article` に `belongs_to :user`
- `User` に `has_many :articles`

2.
- `Comment` に `belongs_to :article`
- `Article` に `has_many :comments`

3.
- `Article` に `belongs_to :category`
- `Category` に `has_many :articles`

</details>

---

## 課題4：多対多を先取りする（25分）

記事とタグの関係を考えます。

- 1つの記事に複数のタグがつく
- 1つのタグは複数の記事で使われる

この場合、`has_many` と `belongs_to` だけでそのまま書けるか考えてみてください。

<details>
<summary>考え方の例</summary>

記事とタグは多対多です。

- 記事1つにタグが複数
- タグ1つに記事が複数

そのまま1本の外部キーでは表しにくいので、中間テーブルが必要になります。将来的には `has_many :through` のような考え方につながります。

</details>

※ ここには後で、多対多と中間テーブルの図を追加します。

<!-- TODO: articles - article_tags - tags の多対多関係を図で追加する -->

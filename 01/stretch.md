# 第1週：Stretch ── scaffoldを壊して直す

## 今日のゴール

scaffoldが作ったアプリを自分の手で変更する。壊れても構わない。変更して、直して、仕組みを確かめる。

---

## この課題について

この課題は、[練習](practice.md) を終えた人向けの発展課題です。時間内にすべて終わらなくても構いません。できるところまで進めてください。

---

## 今日の目標（達成ライン）

この課題にも、3つの達成ラインがあります。

- `推奨`：課題1〜2 に取り組む
- `発展`：課題3 まで進む
- `さらに余裕がある人`：課題4 と振り返りまで行う

---

## 課題1：カラムを追加する（20分）

Articleテーブルに `author`（著者名）カラムを追加してください。

### 手順

1. マイグレーションを生成する：

```bash
rails generate migration AddAuthorToArticles author:string
```

2. マイグレーションを実行する：

```bash
rails db:migrate
```

3. `db/migrate/` に新しいファイルができているはず。開いて中身を確認する

4. `rails console` で確認する：

```ruby
Article.column_names
```

`"author"` が含まれていれば成功。

### ここまでできたら

- `app/views/articles/_form.html.erb` を開く
- `author` の入力欄を追加する
- `app/controllers/articles_controller.rb` の `article_params` に `:author` を追加する
- ブラウザで記事を作成して、著者名が保存されるか確認する

---

## 課題2：バリデーションを追加する（20分）

タイトルが空の記事を保存できないようにしてください。

### 手順

1. `app/models/article.rb` を開く

2. 以下を追加する：

```ruby
class Article < ApplicationRecord
  validates :title, presence: true
end
```

3. サーバーを再起動して、タイトルを空にして保存してみる

### 確認ポイント

- タイトルが空のとき、保存できないことを確認
- エラーメッセージが表示されることを確認
- タイトルを入力すれば保存できることを確認

### 余裕があれば

- `body` にもバリデーションを追加してみる
- `author` に文字数制限をつけてみる（ヒント：`length`）

---

## 課題3：一覧画面を変更する（20分）

`app/views/articles/index.html.erb` を編集して、一覧画面の見た目を変えてください。

### やること

1. 一覧画面に `author` を表示する
2. タイトルを太字にする
3. 記事が0件のとき「まだ記事がありません」と表示する

### ヒント

```erb
<% if @articles.empty? %>
  <p>まだ記事がありません</p>
<% else %>
  <% @articles.each do |article| %>
    <p><strong><%= article.title %></strong> — <%= article.author %></p>
  <% end %>
<% end %>
```

そのまま写しても構いません。写した上で、1箇所だけ自分で変えてみてください。

---

## 課題4：削除してみる（15分）

記事を削除する機能はscaffoldが作ってくれています。

1. 一覧画面から記事を1つ削除する
2. `articles_controller.rb` の `destroy` アクションを読む
3. 何をしているか、自分の言葉で1行コメントを書く

```ruby
# ここに自分の言葉で書く
def destroy
  @article.destroy!
  # ...
end
```

---

## 振り返り（15分）

以下の質問に、ファイル名で答えてください。正確でなくても構いません。

1. 記事のデータを保存するルールを書くファイルはどれ？
2. ブラウザに表示するHTMLを書くファイルはどれ？
3. 「一覧を表示する」「保存する」などの処理を書くファイルはどれ？
4. テーブルの構造を変更するファイルはどれ？

<details>
<summary>解答例</summary>

1. `app/models/article.rb`
2. `app/views/articles/index.html.erb`
3. `app/controllers/articles_controller.rb`
4. `db/migrate/xxxx_create_articles.rb`

</details>

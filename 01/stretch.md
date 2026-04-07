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
- `発展`：課題3〜4 まで進む
- `さらに余裕がある人`：課題5〜6 と振り返りまで行う

---

## 課題1：カラムを追加する（20分）

Articleテーブルに `author`（著者名）カラムを追加してください。

コマンドを打つときは、新しくターミナルを開いて、`/home/vscode/review_app` で実行してください。

```bash
cd /home/vscode/review_app
```

### 手順

1. マイグレーションを生成する：

```bash
rails generate migration AddAuthorToArticles author:string
```

2. `db/migrate/` に新しいファイルができているはず。開いて中身を確認する

3. マイグレーションを実行する：

```bash
rails db:migrate
```

4. `rails console` で確認する：

```ruby
Article.column_names
```

`"author"` が含まれていれば成功。

---

## 課題2：著者名を保存できるようにする（20分）

`author` カラムを作っただけでは、フォームに入力欄は出ません。保存の許可も必要です。

### 手順

1. `app/views/articles/_form.html.erb` を開く

2. `body` の入力欄の下あたりに、`author` の入力欄を追加する

```erb
  <div>
    <%= form.label :author, style: "display: block" %>
    <%= form.text_field :author %>
  </div>
```

3. `app/controllers/articles_controller.rb` を開く

4. `article_params` に `:author` を追加する

```ruby
def article_params
  params.expect(article: [ :title, :body, :author ])
end
```

5. サーバーを再起動する

```bash
# サーバーが動いているターミナルで Ctrl + C
rails server
```

6. ブラウザで記事を作成して、著者名が保存されるか確認する

### 確認ポイント

- フォームに `author` の入力欄が出る
- 著者名を入力して保存できる
- 保存したあと、エラーにならない

---

## 課題3：著者名を画面に表示する（20分）

保存できても、今のままでは `author` がほとんど表示されません。`index` と `show` の両方で著者名が見えるようにしてください。

### 手順

1. `app/views/articles/index.html.erb` を開く

2. `app/views/articles/show.html.erb` も開く

3. `index` と `show` の両方を見て、どこが共通で使われていそうか考える

4. 必要なファイルを修正して、著者名が表示されるようにする

### ヒント

- `render` という書き方が手がかりになります
- 2つの画面で共通の部品を使っているなら、1か所直すだけで両方に反映されるかもしれません
- 迷ったら、`article.title` や `article.body` がどこで表示されているかを追ってみてください

### 確認ポイント

- 一覧画面で著者名が見える
- 詳細画面でも著者名が見える

---

## 課題4：バリデーションを追加する（20分）

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

## 課題5：一覧画面をさらに変更する（20分）

`app/views/articles/index.html.erb` を編集して、一覧画面の見た目を変えてください。

### やること

1. タイトルを太字にする
2. 著者名を `著者: 〇〇` の形で表示する
3. 記事が0件のとき「まだ記事がありません」と表示する

### ヒント

```erb
<% if @articles.empty? %>
  <p>まだ記事がありません</p>
<% else %>
  <% @articles.each do |article| %>
    <p><strong><%= article.title %></strong></p>
    <p>著者: <%= article.author %></p>
  <% end %>
<% end %>
```

そのまま写しても構いません。写した上で、1箇所だけ自分で変えてみてください。

---

## 課題6：削除してみる（15分）

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

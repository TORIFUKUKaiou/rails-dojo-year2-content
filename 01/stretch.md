# 第1週：Stretch ── <ruby>scaffold<rt>スキャフォールド</rt></ruby>を壊して直す

## 今日のゴール

scaffoldが作ったアプリを自分の手で変更する。壊れても構わない。変更して、直して、仕組みを確かめる。

---

## この課題について

この課題は、[練習](practice.md) を終えた人向けの発展課題です。時間内にすべて終わらなくても構いません。できるところまで進めてください。

> 🌾 `Teams投稿`  
> `19:30` になったら、その時点でどこまで進んだかを Teams に書いてください。  

---

## 今日の目標（達成ライン）

この課題にも、3つの達成ラインがあります。

- `推奨`：課題1〜2 に取り組む
- `発展`：課題3〜7 まで進む
- `さらに余裕がある人`：課題8〜20 と振り返りまで行う

---

## 課題1：カラムを追加する

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

💡 `rails console` から抜けるときは `exit` と入力します。

---

## 課題2：著者名を保存できるようにする

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

3. ブラウザで `/articles/new` を開き、`author` の入力欄が増えていることを確認する

確認ができたら、入力欄だけが増えた状態です。まだこのままではデータベースに保存できないので、次のステップで保存を許可します。

4. `app/controllers/articles_controller.rb` を開き、`article_params` に `:author` を追加する

```ruby
def article_params
  params.expect(article: [ :title, :body, :author ])
end
```

💡 `expect`（エクスペクト） は「期待する」という意味です。`article_params` は、「フォームから送られてきたどの項目を保存してよいか」を決める場所です。ここに `:author` がないと、入力欄があっても値は保存されません。


5. ブラウザで記事を作成して、著者名が保存されるか確認する

### 確認ポイント

- フォームに `author` の入力欄が出る
- 著者名を入力して保存できる
- 保存したあと、エラーにならない
  - エラーになる場合は、サーバーが動いているターミナルで Ctrl + C で一度止めて、 `rails server` で再起動してみてください
  - 再起動をしてもエラーがでる場合は、エラーログをよく読んで解決してください

---

## 課題3：著者名を画面に表示する

保存できても、今のままでは `author` は全く表示されません。`index` と `show` の両方で著者名が見えるようにしてください。

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

<details>
<summary>解答例</summary>

`app/views/articles/_article.html.erb`

```erb
  <div>
    <strong>Author:</strong>
    <%= article.author %>
  </div>
```

</details>

---

## 課題4：バリデーションを追加する

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

<details>
<summary>解答例</summary>

`app/models/article.rb`

```ruby
class Article < ApplicationRecord
  validates :title, presence: true
  validates :body, presence: true
  validates :author, length: { maximum: 20 }
end
```

</details>

---

## 課題5：一覧画面をさらに変更する

`app/views/articles/index.html.erb` を編集して、一覧画面の見た目を変えてください。

### やること

1. 一覧をテーブル構造で表示する
2. タイトルを太字にする
3. 著者名と本文を表示する
4. 各記事に `Show` へのリンクを追加する
5. 記事が0件のとき「まだ記事がありません」と表示する

### ヒント

- `table`、`thead`、`tbody` を使うと表にできます
- `link_to "Show", article` で詳細画面へのリンクが作れます
- 迷ったら、今の `index.html.erb` を少しずつ書き換えていきましょう

そのまま写しても構いません。写した上で、1箇所だけ自分で変えてみてください。

<details>
<summary>解答例</summary>

`app/views/articles/index.html.erb`

```erb
<p style="color: green"><%= notice %></p>

<% content_for :title, "Articles" %>

<h1>Articles</h1>

<% if @articles.empty? %>
  <p>まだ記事がありません</p>
<% else %>
  <table>
    <thead>
      <tr>
        <th>Title</th>
        <th>Author</th>
        <th>Body</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <% @articles.each do |article| %>
        <tr>
          <td><strong><%= article.title %></strong></td>
          <td><%= article.author %></td>
          <td><%= article.body %></td>
          <td><%= link_to "Show", article %></td>
        </tr>
      <% end %>
    </tbody>
  </table>
<% end %>

<%= link_to "New article", new_article_path %>
```

</details>

---

## 課題6：削除してみる

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

<details>
<summary>解答例</summary>

`app/controllers/articles_controller.rb`

```ruby
# 選んだ記事をデータベースから削除する
def destroy
  @article.destroy!
  # ...
end
```

</details>

---

## 課題7：Tailwind CSS を CDN で入れて一覧を派手にする

一覧画面を一気に見た目よくします。授業用なので、まずは CDN で Tailwind CSS を読み込んで構いません。

<ruby>CDN<rt>シーディーエヌ</rt></ruby> は、<ruby>Content Delivery Network<rt>コンテントデリバリーネットワーク</rt></ruby> の略です。インターネット上に置かれているファイルを、その場で読み込んで使う方法です。今回は Tailwind CSS のファイルを自分でインストールせず、`<script>` 1行で読み込みます。これは開発用の使い方です。

### 手順

1. `app/views/layouts/application.html.erb` を開く

2. `<head>` の中に、次の1行を追加する

```erb
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

3. `app/views/articles/index.html.erb` を開く

4. タイトル、テーブル、ボタンに Tailwind の class を付けて、見た目を大きく変える

### ヒント

- `class="text-4xl font-bold"` で大きい見出しにできます
- `class="min-w-full border"` で表らしくできます
- `class="px-4 py-2 rounded bg-blue-600 text-white"` でボタンらしくできます
- 配色は自由です。派手で構いません

### 確認ポイント

- CDN を入れたあと、class を書くと見た目が変わる
- 一覧画面の印象が、最初の scaffold のままとは明らかに変わる

<details>
<summary>解答例</summary>

`app/views/layouts/application.html.erb`

```erb
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

`app/views/articles/index.html.erb`

```erb
<p class="mb-4 text-sm text-green-700"><%= notice %></p>

<% content_for :title, "Articles" %>

<div class="mx-auto max-w-5xl px-6 py-10">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-4xl font-black tracking-tight text-slate-900">Articles</h1>
      <p class="mt-2 text-slate-500">登録されている記事の一覧です</p>
    </div>
    <%= link_to "New article", new_article_path, class: "rounded-lg bg-blue-600 px-4 py-2 font-bold text-white shadow" %>
  </div>

  <% if @articles.empty? %>
    <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
      まだ記事がありません
    </div>
  <% else %>
    <div class="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <table class="min-w-full bg-white text-sm">
        <thead class="bg-slate-900 text-left text-white">
          <tr>
            <th class="px-4 py-3">Title</th>
            <th class="px-4 py-3">Author</th>
            <th class="px-4 py-3">Body</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <% @articles.each do |article| %>
            <tr class="border-t border-slate-100 hover:bg-sky-50">
              <td class="px-4 py-3 font-bold text-slate-900"><%= article.title %></td>
              <td class="px-4 py-3">
                <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  <%= article.author %>
                </span>
              </td>
              <td class="px-4 py-3 text-slate-600"><%= article.body %></td>
              <td class="px-4 py-3">
                <%= link_to "Show", article, class: "font-semibold text-blue-600 hover:underline" %>
              </td>
            </tr>
          <% end %>
        </tbody>
      </table>
    </div>
  <% end %>
</div>
```

</details>

---

## 課題8：一覧のタイトルの下に説明文を入れる

`Articles` の見出しの下に、一覧画面の説明を1行入れてください。

例：

```text
登録されている記事の一覧です
```

<details>
<summary>解答例</summary>

`app/views/articles/index.html.erb`

```erb
<h1 class="text-4xl font-black tracking-tight text-slate-900">Articles</h1>
<p class="mt-2 text-slate-500">登録されている記事の一覧です</p>
```

※ 全体は、課題7 の解答例を参照してください。

</details>

---

## 課題9：`New article` ボタンを目立たせる

`New article` のリンクを、ただの文字リンクではなくボタン風にしてください。

<details>
<summary>解答例</summary>

`app/views/articles/index.html.erb`

```erb
<%= link_to "New article", new_article_path, class: "rounded-lg bg-blue-600 px-4 py-2 font-bold text-white shadow" %>
```

※ 全体は、課題7 の解答例を参照してください。

</details>

---

## 課題10：記事が0件のときの見た目を整える

`まだ記事がありません` の表示を、余白と枠付きのメッセージにしてください。

<details>
<summary>解答例</summary>

`app/views/articles/index.html.erb`

```erb
<div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
  まだ記事がありません
</div>
```

※ 全体は、課題7 の解答例を参照してください。

</details>

---

## 課題11：一覧に作成日時を追加する

一覧画面に `created_at` を追加してください。

ヒント：

- `article.created_at`
- 最初はそのまま表示して構いません

<details>
<summary>解答例</summary>

`app/views/articles/index.html.erb`

`table` > `thead` > `tr` > `th` の位置に配置します。

```erb
<th class="px-4 py-3">Created</th>
```

`tbody` > `tr` > `td` の位置に配置します。

```erb
<td class="px-4 py-3 text-slate-500"><%= article.created_at %></td>
```

</details>

---

## 課題12：著者名をバッジ風にする

一覧画面の著者名を、背景色付きの小さなラベルのように表示してください。

<details>
<summary>解答例</summary>

`app/views/articles/index.html.erb`

```erb
<td class="px-4 py-3">
  <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
    <%= article.author %>
  </span>
</td>
```

※ 全体は、課題7 の解答例を参照してください。

</details>

---

## 課題13：本文を短くして表示する

一覧画面では本文を全部出さず、最初の40文字くらいだけ表示してください。

ヒント：

- `article.body[0, 40]`
- 余裕があれば `...` も付ける

<details>
<summary>解答例</summary>

`app/views/articles/index.html.erb`

```erb
<td class="px-4 py-3 text-slate-600">
  <%= article.body[0, 40] %>...
</td>
```

</details>

---

## 課題14：行に hover 効果を付ける

一覧の各行に、マウスを乗せたとき背景色が変わる class を付けてください。

<details>
<summary>解答例</summary>

`app/views/articles/index.html.erb`

```erb
<tr class="border-t border-slate-100 hover:bg-sky-50">
```

※ 全体は、課題7 の解答例を参照してください。

</details>

---

## 課題15：一覧に `Edit` リンクも出す

`Show` だけでなく、一覧から直接 `Edit` に行けるリンクも追加してください。

### ヒント

- `Show` と同じように、`link_to` でリンクを追加できます
- ルーティングの名前が分からなくなったら、`rails server` を動かしていない別のターミナルで `rails routes` を実行して確認してください
- `edit_article_path` という名前が出てくるはずです

<details>
<summary>解答例</summary>

`app/views/articles/index.html.erb`

```erb
<td class="px-4 py-3 space-x-3">
  <%= link_to "Show", article, class: "font-semibold text-blue-600 hover:underline" %>
  <%= link_to "Edit", edit_article_path(article), class: "font-semibold text-emerald-600 hover:underline" %>
</td>
```

</details>

---

## 課題16：詳細画面をカード風にする

`show.html.erb` を見やすく整えて、タイトル・著者・本文がカードの中にあるような見た目にしてください。

<details>
<summary>解答例</summary>

`app/views/articles/show.html.erb`

```erb
<div class="mx-auto max-w-3xl px-6 py-10">
  <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
    <p class="mb-2 text-sm font-semibold text-slate-400">Article detail</p>
    <%= render @article %>
  </div>

  <div class="mt-6 flex gap-4">
    <%= link_to "Edit this article", edit_article_path(@article), class: "rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white" %>
    <%= link_to "Back to articles", articles_path, class: "rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700" %>
  </div>
</div>
```

</details>

---

## 課題17：`new` と `edit` のフォームを見やすくする

入力欄、ラベル、保存ボタンに class を付けて、フォーム全体を見やすくしてください。

<details>
<summary>解答例</summary>

`app/views/articles/_form.html.erb`

```erb
<%= form_with(model: article) do |form| %>
  <% if article.errors.any? %>
    <div style="color: red">
      <h2><%= pluralize(article.errors.count, "error") %> prohibited this article from being saved:</h2>

      <ul>
        <% article.errors.each do |error| %>
          <li><%= error.full_message %></li>
        <% end %>
      </ul>
    </div>
  <% end %>

  <div class="space-y-6">
    <div>
      <%= form.label :title, class: "mb-2 block text-sm font-bold text-slate-700" %>
      <%= form.text_field :title, class: "w-full rounded-lg border border-slate-300 px-3 py-2" %>
    </div>

    <div>
      <%= form.label :author, class: "mb-2 block text-sm font-bold text-slate-700" %>
      <%= form.text_field :author, class: "w-full rounded-lg border border-slate-300 px-3 py-2" %>
    </div>

    <div>
      <%= form.label :body, class: "mb-2 block text-sm font-bold text-slate-700" %>
      <%= form.textarea :body, class: "w-full rounded-lg border border-slate-300 px-3 py-2" %>
    </div>

    <div>
      <%= form.submit class: "rounded-lg bg-blue-600 px-4 py-2 font-bold text-white" %>
    </div>
  </div>
<% end %>
```

</details>

---

## 課題18：戻るリンクをそろえる

`show`、`new`、`edit` にある戻るリンクの見た目をそろえてください。


リンクの文言は英語でも日本語でも構いません。

<details>
<summary>解答例</summary>

- `app/views/articles/new.html.erb`
- `app/views/articles/show.html.erb`
- `app/views/articles/edit.html.erb`

```erb
<%= link_to "Back to articles", articles_path, class: "rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700" %>
```

</details>

---

## 課題19：自分のテーマカラーを決める

青系、赤系、緑系など、自分でテーマカラーを1つ決めて、一覧・詳細・フォームの見た目に反映してください。

<details>
<summary>解答例</summary>

`app/views/articles/index.html.erb` や `app/views/articles/_form.html.erb`

青系で作っていた class を、たとえば緑系に寄せます。

```erb
<%= link_to "New article", new_article_path, class: "rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white shadow" %>
```

```erb
<tr class="border-t border-slate-100 hover:bg-emerald-50">
```

```erb
<%= form.submit class: "rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white" %>
```

</details>

---

## 課題20：自由改造

ここまでの課題を組み合わせて、自分なりに1つ機能や見た目を改造してください。

例：

- 見出しに絵文字を入れる
- テーブルの列名を日本語にする
- ボタンの角丸や影を変える
- 空のときの画面をもっと派手にする

<details>
<summary>解答例</summary>

`app/views/articles/index.html.erb`

例として、列名を日本語にし、見出しに絵文字を足します。

```erb
<h1 class="text-4xl font-black tracking-tight text-slate-900">📝 記事一覧</h1>
```

```erb
<th class="px-4 py-3">タイトル</th>
<th class="px-4 py-3">著者</th>
<th class="px-4 py-3">本文</th>
```

</details>

---

## 振り返り

以下の質問に、ファイル名で答えてください。正確でなくても構いません。

1. 記事のデータを保存するルールを書くファイルはどれ？
2. 一覧表示のHTMLを書くファイルはどれ？
3. 「一覧を表示する」「保存する」などの処理を書くファイルはどれ？
4. テーブルの構造を変更するファイルはどれ？

<details>
<summary>解答例</summary>

1. `app/models/article.rb`
2. `app/views/articles/index.html.erb`
3. `app/controllers/articles_controller.rb`
4. `db/migrate/xxxx_create_articles.rb`

</details>

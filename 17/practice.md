# 第17週：練習 ── 記事の登録処理をRSpecで確かめる

## この練習について

テストの基本を復習したあと、記事の入力ルールと、リクエストを送った結果の保存・応答を確認します。準備から課題30まで順に進めてください。第16週のCodespace・解答ファイル・追加メソッドは必要ありません。

- コマンドは1行ずつ実行し、終了して入力待ちに戻ってから次へ進みます。
- まず結果を予想し、自分で作成・実行してから解答例を開いて比べます。
- ファイルを変更したら保存します。「ファイル全体」と指定された場合だけ全体を置き換えます。
- テストを追加する場所は、対象ファイルの外側の `RSpec.describe ... do` と最後の `end` の間です。既存の `it` の中には入れません。
- `context` を使った後は、指定された `context` の内側、最後の `end` の前に追加します。各 `do` と `end` の対応を確認します。
- 意図的に失敗させる課題では、失敗を確認してから指定箇所を戻し、成功まで確認します。
- 実行時間・色・記事のIDは環境によって変わります。`0 failures` と実行件数を確認します。`0 examples` は確認したかったテストが実行されていない状態です。

## 準備：新しいCodespaceを作る

GitHubにログインし、次のバッジを新しいタブで開いてください。

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/TORIFUKUKaiou/rails-dojo-rspec-starter)

1. Repositoryが `TORIFUKUKaiou/rails-dojo-rspec-starter`、Branchが `main` であることを確認します。
2. **Create codespace** をクリックします。
3. コンテナの作成とセットアップが終わるまで待ちます。依存ライブラリのインストールと、開発用・テスト用DBの準備は自動で行われます。
4. **File → Open Folder...** で `/home/vscode/rspec_starter` を開きます。
5. **Terminal → New Terminal** でターミナルを開きます。

このリポジトリ自体がRailsアプリです。`rails new` やscaffold、RSpec設定の再生成は行いません。

```bash
cd /home/vscode/rspec_starter
pwd
bin/rails --version
bundle exec rspec --version
```

作業場所が `/home/vscode/rspec_starter`、Railsが `Rails 8.0.2.1`、RSpec本体が `3.13` 系と表示されることを確認します。`rspec-rails` は8.0系で、本体とはバージョン番号が異なります。

セットアップのエラーが出たら、表示を残して先生に確認してください。途中で止めた場合は `bin/setup --skip-server` を実行し、エラーなく終了したことを確認してから進みます。

> [!IMPORTANT]
> この教材のファイルパスは、すべて `/home/vscode/rspec_starter` からの相対パスです。
> 新しいターミナルでは、最初に `cd /home/vscode/rspec_starter` を実行してください。
> RSpecを実行するだけなら、Railsサーバーの起動は不要です。request specも同じです。

---

## 課題1：初期テストを実行する

`spec/models/article_spec.rb` を開き、タイトルを比較する `it` が1件あることを確認します。

```bash
bundle exec rspec spec/models/article_spec.rb
```

`1 example, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

`Article.new` で準備した記事のタイトルが、指定した「はじめてのRSpec」と等しいかを確認しています。記事の保存や入力ルールはまだ確認していません。

</details>

---

## 課題2：意図的な失敗から期待値と実際の値を読む

対象：`spec/models/article_spec.rb`。確認部分だけを変更します。

変更前：

```ruby
expect(article.title).to eq("はじめてのRSpec")
```

変更後：

```ruby
expect(article.title).to eq("別のタイトル")
```

> [!IMPORTANT]
> 失敗の表示を確認するための変更です。この課題内で変更前へ戻します。

```bash
bundle exec rspec spec/models/article_spec.rb
```

`1 example, 1 failure` を確認します。

失敗した行・期待値・実際の値を読んでから、変更前に戻して保存し、同じコマンドを再実行します。

<details>
<summary>解答例・確認</summary>

期待値は「別のタイトル」、実際の値は「はじめてのRSpec」です。準備したタイトルを確認する仕様なので、期待値を戻します。再実行は `1 example, 0 failures` です。

</details>

---

## 課題3：テスト名と実行件数を対応させる

```bash
bundle exec rspec spec/models/article_spec.rb --format documentation
```

表示された「指定したタイトルを持つ」を、ファイルの `it` の説明と見比べます。`require`・`describe`・準備・`expect` がどの行にあるかを確認してください。

<details>
<summary>解答例・確認</summary>

最後は `1 example, 0 failures` です。`describe` は関連するテストをまとめ、`it` が1件の確認になります。`expect` は実際の値と期待する結果を比べます。

</details>

---

## 課題4：入力ルール追加前の画面を確認する

今使っているターミナルを「サーバー用」にして起動します。

```bash
bin/rails server -b 0.0.0.0
```

`Listening on http://0.0.0.0:3000` を確認し、起動したままにします。VS Codeの **Ports** タブからポート3000の **Open in Browser** をクリックします。URLの末尾を `/articles` にしてください。

| 操作 | 確認する内容 |
|---|---|
| New article → Create Article | Titleに `画面の確認`、Bodyに `登録できました` を入力して登録する |
| 詳細画面 | タイトル・本文が表示される |
| Back to articles → New article | TitleもBodyも空欄のままCreate Articleを押す |
| 詳細画面 | 空欄の記事でも登録できる |
| 各記事の詳細画面 → Destroy this article | 今作った2件を削除し、一覧から消えることを確認する |

空欄でも登録できるのは開始状態の動作です。次の課題でルールを追加します。**Terminal → New Terminal** で「コマンド用」を開き、`cd /home/vscode/rspec_starter` を実行します。以降のRSpecはコマンド用で実行し、サーバー用は課題29まで起動したままにします。

<details>
<summary>解答例・確認</summary>

正常な記事と空欄の記事の両方が登録でき、削除後に一覧から消えれば確認完了です。ブラウザのデータは開発用DBに入ります。

</details>

---

## 課題5：入力ルールと、正常な記事のテストを追加する

仕様は「タイトルは必須・10文字以内、本文は必須」です。`app/models/article.rb` のファイル全体を次にします。

```ruby
class Article < ApplicationRecord
  validates :title, presence: true, length: { maximum: 10 }
  validates :body, presence: true
end
```

`spec/models/article_spec.rb` の初期テストは残し、正常な記事を確認する次の `it` を追加します。

```ruby
it "正常な記事は有効だが、判定だけでは保存されない" do
  count_before = Article.count
  article = Article.new(title: "Railsの練習", body: "モデルを確認します")

  expect(article).to be_valid
  expect(article.persisted?).to eq(false)
  expect(Article.count).to eq(count_before)
end
```

`be_valid` は入力ルールを調べます。`persisted?` は保存済みかを調べ、`Article.count` はDBの記事数を返します。

```bash
bundle exec rspec spec/models/article_spec.rb
```

`2 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

有効と判定されても保存済みにはならず、記事数も変わりません。`it` は2件です。判定と保存は別の操作です。

</details>

---

## 課題6：空文字・空白・未設定のタイトルを確かめる

対象：`spec/models/article_spec.rb`。次の3条件を別々の `it` として追加します。本文はすべて `"本文は入力されています"` とし、タイトルだけを変えます。

| タイトル | 期待する判定 |
|---|---|
| `""` | 無効 |
| `"   "`（半角スペース3個） | 無効 |
| `nil`（値がない） | 無効 |

```bash
bundle exec rspec spec/models/article_spec.rb
```

`5 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "空文字のタイトルは無効である" do
  article = Article.new(title: "", body: "本文は入力されています")

  expect(article).not_to be_valid
end

it "空白だけのタイトルは無効である" do
  article = Article.new(title: "   ", body: "本文は入力されています")

  expect(article).not_to be_valid
end

it "未設定のタイトルは無効である" do
  article = Article.new(title: nil, body: "本文は入力されています")

  expect(article).not_to be_valid
end
```

`presence: true` はこの3条件をすべて無効にします。本文を正常な値にして、タイトルの必須ルールだけを調べます。

</details>

---

## 課題7：本文だけが空欄の場合を確かめる

対象：`spec/models/article_spec.rb`。タイトルを `"Railsの練習"`、本文を `""` として、無効であることを確認する `it` を追加してください。

```bash
bundle exec rspec spec/models/article_spec.rb
```

`6 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "本文が空欄なら無効である" do
  article = Article.new(title: "Railsの練習", body: "")

  expect(article).not_to be_valid
end
```

タイトルだけでなく、本文の必須ルールも確認できました。

</details>

---

## 課題8：文字数上限の境界を確かめる

対象：`spec/models/article_spec.rb`。タイトルが9文字・10文字・11文字の3件を追加します。本文は正常な値にします。`"あ" * 10` は「あ」を10回並べた10文字の文字列です。

| 文字数 | 判定 |
|---|---|
| 9 | 有効 |
| 10 | 有効 |
| 11 | 無効 |

```bash
bundle exec rspec spec/models/article_spec.rb
```

`9 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "9文字のタイトルは有効である" do
  article = Article.new(title: "あ" * 9, body: "本文は入力されています")

  expect(article).to be_valid
end

it "10文字のタイトルは有効である" do
  article = Article.new(title: "あ" * 10, body: "本文は入力されています")

  expect(article).to be_valid
end

it "11文字のタイトルは無効である" do
  article = Article.new(title: "あ" * 11, body: "本文は入力されています")

  expect(article).not_to be_valid
end
```

上限ちょうどの10文字も認める仕様です。短い入力だけでは、上限を間違えた実装を見つけられないことがあります。

</details>

---

## 課題9：contextで条件を整理して画面とも比べる

`context` は条件ごとにテストをまとめます。`spec/models/article_spec.rb` の9件を、解答例の条件ごとに整理してください。各 `it` 内の準備・確認は残し、件数や期待値は変えません。

```bash
bundle exec rspec spec/models/article_spec.rb --format documentation
```

`9 examples, 0 failures` と、条件の見出しが表示されることを確認します。ブラウザで `/articles/new` を開き、Titleを空欄、Bodyを `本文は入力されています` として登録してください。フォームに `Title can't be blank` のエラーが表示され、登録されないことを確認します。その後Titleを `ルール確認` に直して登録し、詳細画面を確認してから、その記事を削除します。サーバーは起動したままです。

<details>
<summary>解答例・確認</summary>

整理後のテストファイル全体です。

```ruby
require "rails_helper"

RSpec.describe Article, type: :model do
  it "指定したタイトルを持つ" do
    article = Article.new(title: "はじめてのRSpec", body: "テストを練習します")

    expect(article.title).to eq("はじめてのRSpec")
  end

  context "タイトルと本文が入力されている場合" do
    it "正常な記事は有効だが、判定だけでは保存されない" do
      count_before = Article.count
      article = Article.new(title: "Railsの練習", body: "モデルを確認します")

      expect(article).to be_valid
      expect(article.persisted?).to eq(false)
      expect(Article.count).to eq(count_before)
    end
  end

  context "タイトルが空欄の場合" do
    it "空文字のタイトルは無効である" do
      article = Article.new(title: "", body: "本文は入力されています")

      expect(article).not_to be_valid
    end

    it "空白だけのタイトルは無効である" do
      article = Article.new(title: "   ", body: "本文は入力されています")

      expect(article).not_to be_valid
    end

    it "未設定のタイトルは無効である" do
      article = Article.new(title: nil, body: "本文は入力されています")

      expect(article).not_to be_valid
    end
  end

  context "本文が空欄の場合" do
    it "本文が空欄なら無効である" do
      article = Article.new(title: "Railsの練習", body: "")

      expect(article).not_to be_valid
    end
  end

  context "タイトルの文字数を確認する場合" do
    it "9文字のタイトルは有効である" do
      article = Article.new(title: "あ" * 9, body: "本文は入力されています")

      expect(article).to be_valid
    end

    it "10文字のタイトルは有効である" do
      article = Article.new(title: "あ" * 10, body: "本文は入力されています")

      expect(article).to be_valid
    end

    it "11文字のタイトルは無効である" do
      article = Article.new(title: "あ" * 11, body: "本文は入力されています")

      expect(article).not_to be_valid
    end
  end
end
```

エラーは入力ルールに合わないことを知らせる意図した表示です。モデルの判定をブラウザの登録結果と対応させます。

</details>

---

## ここからrequest specへ

request specでは、リクエストを送った結果の保存と応答を確認します。ブラウザを起動するテストではありません。`type: :request` によって、`get`・`post`・`response` が使えるようになります。`articles_path` は `/articles`、`new_article_path` は `/articles/new` を表します。

---

## 課題10：記事一覧のGETを確認する

エクスプローラーで `spec` の下に `requests` フォルダを作り、その中に `articles_spec.rb` を新規作成します。ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe "記事の登録", type: :request do
  it "記事一覧を取得できる" do
    get articles_path

    expect(response).to have_http_status(200)
    expect(response.body).to include("Articles")
  end
end
```

`get` はページを取得するリクエストです。`response` は応答、200は正常な応答、`response.body` は返されたHTMLです。`include` で文字列を含むかを調べます。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`1 example, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

一覧の応答が200で、HTMLに見出しの `Articles` が含まれています。モデルテストとは別のファイルなので、この実行は1件です。

</details>

---

## 課題11：入力フォームのGETを確認する

対象：`spec/requests/articles_spec.rb`。`get new_article_path` でフォームを取得し、応答が200、HTMLに `New article` とタイトル・本文の入力欄が含まれるテストを追加します。入力欄は `name="article[title]"` と `name="article[body]"` で確認できます。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`2 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "新規登録フォームを取得できる" do
  get new_article_path

  expect(response).to have_http_status(200)
  expect(response.body).to include("New article")
  expect(response.body).to include('name="article[title]"')
  expect(response.body).to include('name="article[body]"')
end
```

フォームのHTMLを確認しています。実際のブラウザで文字を入力する操作とは異なります。

</details>

---

## 課題12：正常なPOSTで記事数が増えることを確認する

対象：`spec/requests/articles_spec.rb`。次の `it` を追加します。

```ruby
it "正常な記事を保存し、詳細画面へリダイレクトする" do
  count_before = Article.count

  post articles_path, params: {
    article: { title: "Railsの練習", body: "登録処理をテストします" }
  }

  expect(Article.count).to eq(count_before + 1)
end
```

`post` は登録リクエストを送り、`params` は入力値を渡します。外側の `article:` の中に `title:` と `body:` を入れる形は、記事フォームに合わせています。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`3 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

リクエストの前後を比べ、1件増えたことを確認します。ブラウザで登録した記事に依存しません。このデータはテスト用DBで作られ、テスト終了時に戻されます。

</details>

---

## 課題13：タイトルと本文が保存されたことを確認する

対象：`spec/requests/articles_spec.rb`。課題12の同じ `it` の中で、記事数の確認の後に保存内容の確認を追記します。新しい `it` は作りません。

```ruby
article = Article.last
expect(article.title).to eq("Railsの練習")
expect(article.body).to eq("登録処理をテストします")
```

`Article.last` は最後の記事を取り出します。このテストで正常な記事を1件登録した後に使っています。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`3 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

`expect` を増やしても `it` は増えていないので3件です。記事数だけでなく、送った内容が保存されたことも確認します。

</details>

---

## 課題14：登録後の応答と移動先を確認する

対象：`spec/requests/articles_spec.rb`。課題12〜13の同じ `it` に、次の2行を追記します。

```ruby
expect(response).to have_http_status(302)
expect(response).to redirect_to(article_path(article))
```

302は移動先を知らせる応答です。`article_path(article)` は保存した記事の詳細画面のパスです。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`3 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

登録の `it` 全体は次です。

```ruby
it "正常な記事を保存し、詳細画面へリダイレクトする" do
  count_before = Article.count

  post articles_path, params: {
    article: { title: "Railsの練習", body: "登録処理をテストします" }
  }

  expect(Article.count).to eq(count_before + 1)
  article = Article.last
  expect(article.title).to eq("Railsの練習")
  expect(article.body).to eq("登録処理をテストします")
  expect(response).to have_http_status(302)
  expect(response).to redirect_to(article_path(article))
end
```

応答が302であるだけでなく、保存した記事の詳細画面が移動先であることを確認します。リダイレクト先のHTMLまで取得しているわけではありません。

</details>

---

## 課題15：空欄のタイトルでは記事が増えないことを確認する

対象：`spec/requests/articles_spec.rb`。Titleを `""`、Bodyを `"本文は入力されています"` としてPOSTし、記事数が変わらないテストを追加してください。正常な登録のテストは残します。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`4 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "タイトルが空欄なら保存せず、フォームを返す" do
  count_before = Article.count

  post articles_path, params: {
    article: { title: "", body: "本文は入力されています" }
  }

  expect(Article.count).to eq(count_before)
end
```

</details>

---

## 課題16：無効な入力の応答とエラー表示を確認する

対象：`spec/requests/articles_spec.rb`。課題15の同じ `it` に、次の3行を追記します。

```ruby
expect(response).to have_http_status(422)
expect(response.body).to include("New article")
expect(response.body).to include("prohibited this article from being saved")
```

422は、この入力では登録を受け付けられなかったことを表します。`New article` はフォームの見出し、最後の文字列はスターターの入力エラーの見出しの一部です。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`4 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "タイトルが空欄なら保存せず、フォームを返す" do
  count_before = Article.count

  post articles_path, params: {
    article: { title: "", body: "本文は入力されています" }
  }

  expect(Article.count).to eq(count_before)
  expect(response).to have_http_status(422)
  expect(response.body).to include("New article")
  expect(response.body).to include("prohibited this article from being saved")
end
```

保存されないこと、422の応答、フォームと入力エラーが返ることを組み合わせて確認します。

</details>

---

## 課題17：本文だけが空欄の登録を確認する

対象：`spec/requests/articles_spec.rb`。Titleを `"Railsの練習"`、Bodyを `""` としてPOSTするテストを追加します。保存されず、422の応答とエラー付きフォームが返ることを確認してください。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`5 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "本文が空欄なら保存せず、フォームを返す" do
  count_before = Article.count

  post articles_path, params: {
    article: { title: "Railsの練習", body: "" }
  }

  expect(Article.count).to eq(count_before)
  expect(response).to have_http_status(422)
  expect(response.body).to include("New article")
  expect(response.body).to include("prohibited this article from being saved")
end
```

</details>

---

## 課題18：必須項目が両方空欄の登録を確認する

対象：`spec/requests/articles_spec.rb`。TitleもBodyも `""` のテストを追加し、保存されず、422の応答とエラー付きフォームが返ることを確認してください。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`6 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "タイトルと本文が空欄なら保存しない" do
  count_before = Article.count

  post articles_path, params: {
    article: { title: "", body: "" }
  }

  expect(Article.count).to eq(count_before)
  expect(response).to have_http_status(422)
  expect(response.body).to include("New article")
  expect(response.body).to include("prohibited this article from being saved")
end
```

片方ずつのテストも残します。両方空欄のテストだけでは、それぞれの必須ルールを確認しきれません。

</details>

---

## 課題19：request specを条件ごとに整理する

対象：`spec/requests/articles_spec.rb`。GETの2件は外側に残し、正常なPOSTの1件を「正常な入力の場合」、空欄のPOSTの3件を「必須項目が空欄の場合」の `context` にまとめます。既存6件の内容は保ちます。

```bash
bundle exec rspec spec/requests/articles_spec.rb --format documentation
```

`6 examples, 0 failures` と条件の見出しを確認します。

<details>
<summary>解答例・確認</summary>

整理後のファイル全体です。

```ruby
require "rails_helper"

RSpec.describe "記事の登録", type: :request do
  it "記事一覧を取得できる" do
    get articles_path

    expect(response).to have_http_status(200)
    expect(response.body).to include("Articles")
  end

  it "新規登録フォームを取得できる" do
    get new_article_path

    expect(response).to have_http_status(200)
    expect(response.body).to include("New article")
    expect(response.body).to include('name="article[title]"')
    expect(response.body).to include('name="article[body]"')
  end

  context "正常な入力の場合" do
    it "正常な記事を保存し、詳細画面へリダイレクトする" do
      count_before = Article.count

      post articles_path, params: {
        article: { title: "Railsの練習", body: "登録処理をテストします" }
      }

      expect(Article.count).to eq(count_before + 1)
      article = Article.last
      expect(article.title).to eq("Railsの練習")
      expect(article.body).to eq("登録処理をテストします")
      expect(response).to have_http_status(302)
      expect(response).to redirect_to(article_path(article))
    end
  end

  context "必須項目が空欄の場合" do
    it "タイトルが空欄なら保存せず、フォームを返す" do
      count_before = Article.count

      post articles_path, params: {
        article: { title: "", body: "本文は入力されています" }
      }

      expect(Article.count).to eq(count_before)
      expect(response).to have_http_status(422)
      expect(response.body).to include("New article")
      expect(response.body).to include("prohibited this article from being saved")
    end

    it "本文が空欄なら保存せず、フォームを返す" do
      count_before = Article.count

      post articles_path, params: {
        article: { title: "Railsの練習", body: "" }
      }

      expect(Article.count).to eq(count_before)
      expect(response).to have_http_status(422)
      expect(response.body).to include("New article")
      expect(response.body).to include("prohibited this article from being saved")
    end

    it "タイトルと本文が空欄なら保存しない" do
      count_before = Article.count

      post articles_path, params: {
        article: { title: "", body: "" }
      }

      expect(Article.count).to eq(count_before)
      expect(response).to have_http_status(422)
      expect(response.body).to include("New article")
      expect(response.body).to include("prohibited this article from being saved")
    end
  end
end
```

</details>

---

## 課題20：上限直前と上限ちょうどの登録を確認する

対象：`spec/requests/articles_spec.rb`。外側の `RSpec.describe` の中に「タイトルの文字数を確認する場合」という `context` を追加し、9文字と10文字の正常な登録の2件を書きます。記事数・保存内容・302の応答・詳細画面への移動先を確認してください。本文は `"本文は入力されています"` とします。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`8 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
context "タイトルの文字数を確認する場合" do
  it "9文字のタイトルは登録できる" do
    count_before = Article.count

    post articles_path, params: {
      article: { title: "あ" * 9, body: "本文は入力されています" }
    }

    expect(Article.count).to eq(count_before + 1)
    article = Article.last
    expect(article.title).to eq("あ" * 9)
    expect(article.body).to eq("本文は入力されています")
    expect(response).to have_http_status(302)
    expect(response).to redirect_to(article_path(article))
  end

  it "10文字のタイトルは登録できる" do
    count_before = Article.count

    post articles_path, params: {
      article: { title: "あ" * 10, body: "本文は入力されています" }
    }

    expect(Article.count).to eq(count_before + 1)
    article = Article.last
    expect(article.title).to eq("あ" * 10)
    expect(article.body).to eq("本文は入力されています")
    expect(response).to have_http_status(302)
    expect(response).to redirect_to(article_path(article))
  end
end
```

</details>

---

## 課題21：上限を超えるタイトルの登録を確認する

対象：`spec/requests/articles_spec.rb`。課題20の文字数の `context` 内に、11文字では登録できないテストを追加します。記事数が変わらず、422とエラー付きフォームが返ることを確認してください。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`9 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "11文字のタイトルは登録できない" do
  count_before = Article.count

  post articles_path, params: {
    article: { title: "あ" * 11, body: "本文は入力されています" }
  }

  expect(Article.count).to eq(count_before)
  expect(response).to have_http_status(422)
  expect(response.body).to include("New article")
  expect(response.body).to include("prohibited this article from being saved")
end
```

モデルの文字数判定に加え、登録リクエストを送った結果も確認できました。

</details>

---

## 課題22：必須ルールの不具合を両方のテストで検出する

対象：`app/models/article.rb`。タイトルの行だけを次のように変更します。本文の必須ルールは残してください。

変更前：

```ruby
validates :title, presence: true, length: { maximum: 10 }
```

変更後：

```ruby
validates :title, length: { maximum: 10 }
```

> [!IMPORTANT]
> 必須ルールを意図的に外す課題です。この課題内で変更前へ戻します。テストの期待値は変えません。

```bash
bundle exec rspec spec/models/article_spec.rb
```

`9 examples, 3 failures` を確認します。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`9 examples, 1 failure` を確認します。

どの入力で失敗したかを読み、タイトルの行を変更前へ戻します。上の2コマンドを再実行し、どちらも `9 examples, 0 failures` に戻ったことを確認してください。

<details>
<summary>解答例・確認</summary>

モデルでは空文字・空白・nilの3件、request specではタイトルだけが空欄の1件が失敗します。本文も空欄のリクエストは、本文のルールで引き続き拒否されます。

</details>

---

## 課題23：Strong Parametersの不具合を登録テストで検出する

対象：`app/controllers/articles_controller.rb` の `article_params` 内の1行だけを変更します。

変更前：

```ruby
params.expect(article: [ :title, :body ])
```

変更後：

```ruby
params.expect(article: [ :title ])
```

> [!IMPORTANT]
> 本文を受け取らない不具合を意図的に入れます。この課題内で変更前へ戻します。モデルとテストは変更しません。

```bash
bundle exec rspec spec/models/article_spec.rb
```

`9 examples, 0 failures` を確認します。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`9 examples, 3 failures` を確認します。

モデルは成功するのに、登録テストが失敗する理由をコードで確かめます。変更前へ戻し、両方を再実行して `9 examples, 0 failures` を確認してください。

<details>
<summary>解答例・確認</summary>

正常な登録と9文字・10文字の登録が、記事数を増やせず失敗します。送った本文が捨てられ、本文の必須ルールにより保存できません。モデルテストは直接タイトル・本文を準備するため、controllerの受け取り方は確認していません。

</details>

---

## 課題24：保存されないだけでは正しい応答とは限らないことを確認する

対象：`app/controllers/articles_controller.rb` の **createアクションのelse側**です。次のHTMLの行だけを変更します。update側やJSONの行は変更しません。

変更前：

```ruby
format.html { render :new, status: :unprocessable_content }
```

変更後：

```ruby
format.html { render :new, status: :ok }
```

> [!IMPORTANT]
> 無効な入力なのに200を返す不具合を意図的に入れます。この課題内で変更前へ戻します。期待する422は変更しません。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`9 examples, 4 failures` を確認します。

記事数の確認は成功している一方、422を期待する確認が失敗することを読み取ります。変更前へ戻して再実行し、`9 examples, 0 failures` を確認してください。

<details>
<summary>解答例・確認</summary>

タイトル空欄・本文空欄・両方空欄・11文字の4件が失敗します。保存されないことだけを確認していたら、この応答の不具合を見逃します。

</details>

---

## 課題25：仕様変更を先にテストへ反映する

**新しい仕様：タイトルは必須・20文字以内。本文は引き続き必須です。**

まずテストだけを変更します。モデルの上限は、課題26まで10のままにします。

- モデルテスト：既存の「11文字のタイトルは無効である」の `it` を、11文字が有効である確認へ変更する。
- request spec：既存の「11文字のタイトルは登録できない」の `it` を、11文字を保存し、詳細画面へリダイレクトする確認へ変更する。
- テストを追加するのではなく、その2件の名前と確認内容を置き換える。9文字・10文字・空欄のテストは残す。

> [!IMPORTANT]
> 実装が旧仕様のままなので、変更したテストは意図的に失敗します。ここでは期待値を旧仕様へ戻さず、課題26でモデルを新仕様へ変更します。

```bash
bundle exec rspec spec/models/article_spec.rb
```

`9 examples, 1 failure` を確認します。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`9 examples, 1 failure` を確認します。

<details>
<summary>解答例・確認</summary>

置き換えるモデルの `it`：

```ruby
it "11文字のタイトルは有効である" do
  article = Article.new(title: "あ" * 11, body: "本文は入力されています")

  expect(article).to be_valid
end
```

置き換えるrequest specの `it`：

```ruby
it "11文字のタイトルは登録できる" do
  count_before = Article.count

  post articles_path, params: {
    article: { title: "あ" * 11, body: "本文は入力されています" }
  }

  expect(Article.count).to eq(count_before + 1)
  article = Article.last
  expect(article.title).to eq("あ" * 11)
  expect(article.body).to eq("本文は入力されています")
  expect(response).to have_http_status(302)
  expect(response).to redirect_to(article_path(article))
end
```

期待値を変える根拠は、新しい仕様です。単に実際の結果に合わせて成功させる変更とは異なります。

</details>

---

## 課題26：モデルを新しい仕様に合わせる

対象：`app/models/article.rb`。`maximum: 10` だけを `maximum: 20` に変更します。両方の必須ルールは残します。

```bash
bundle exec rspec spec/models/article_spec.rb
```

`9 examples, 0 failures` を確認します。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`9 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

変更後のモデル全体：

```ruby
class Article < ApplicationRecord
  validates :title, presence: true, length: { maximum: 20 }
  validates :body, presence: true
end
```

11文字の記事は有効になり、POSTでも保存できるようになりました。

</details>

---

## 課題27：新しい上限の境界を両方で確認する

モデルテストとrequest specの、文字数の `context` にそれぞれ19文字・20文字・21文字の3件を追加します。既存の9・10・11文字のテストは残します。

| 文字数 | モデル | POSTの結果 |
|---|---|---|
| 19 | 有効 | 保存され、302と詳細画面への移動先が返る |
| 20 | 有効 | 保存され、302と詳細画面への移動先が返る |
| 21 | 無効 | 保存されず、422とエラー付きフォームが返る |

```bash
bundle exec rspec spec/models/article_spec.rb
```

`12 examples, 0 failures` を確認します。

```bash
bundle exec rspec spec/requests/articles_spec.rb
```

`12 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

追加するモデルの3件：

```ruby
it "19文字のタイトルは有効である" do
  article = Article.new(title: "あ" * 19, body: "本文は入力されています")

  expect(article).to be_valid
end

it "20文字のタイトルは有効である" do
  article = Article.new(title: "あ" * 20, body: "本文は入力されています")

  expect(article).to be_valid
end

it "21文字のタイトルは無効である" do
  article = Article.new(title: "あ" * 21, body: "本文は入力されています")

  expect(article).not_to be_valid
end
```

追加するrequest specの3件：

```ruby
it "19文字のタイトルは登録できる" do
  count_before = Article.count

  post articles_path, params: {
    article: { title: "あ" * 19, body: "本文は入力されています" }
  }

  expect(Article.count).to eq(count_before + 1)
  article = Article.last
  expect(article.title).to eq("あ" * 19)
  expect(article.body).to eq("本文は入力されています")
  expect(response).to have_http_status(302)
  expect(response).to redirect_to(article_path(article))
end

it "20文字のタイトルは登録できる" do
  count_before = Article.count

  post articles_path, params: {
    article: { title: "あ" * 20, body: "本文は入力されています" }
  }

  expect(Article.count).to eq(count_before + 1)
  article = Article.last
  expect(article.title).to eq("あ" * 20)
  expect(article.body).to eq("本文は入力されています")
  expect(response).to have_http_status(302)
  expect(response).to redirect_to(article_path(article))
end

it "21文字のタイトルは登録できない" do
  count_before = Article.count

  post articles_path, params: {
    article: { title: "あ" * 21, body: "本文は入力されています" }
  }

  expect(Article.count).to eq(count_before)
  expect(response).to have_http_status(422)
  expect(response.body).to include("New article")
  expect(response.body).to include("prohibited this article from being saved")
end
```

</details>

---

## 課題28：変更していない必須入力の動作も再確認する

```bash
bundle exec rspec spec/models/article_spec.rb spec/requests/articles_spec.rb --format documentation
```

`24 examples, 0 failures` を確認します。表示された名前から、モデルの空文字・空白・nil・本文空欄と、POSTのタイトル空欄・本文空欄・両方空欄のテストを見つけてください。文字数の仕様を変えた後も、これらの条件が引き続き無効であることを確かめます。

<details>
<summary>解答例・確認</summary>

モデル12件とrequest spec12件です。文字数上限だけを変えたので、必須入力のテストは期待値を変更せず成功する必要があります。件数が少ない場合は、追記・保存・`it` の入れ子・ファイル名を確認します。

</details>

---

## 課題29：全件実行とブラウザの操作で最終確認する

```bash
bundle exec rspec --format documentation
```

`24 examples, 0 failures` を確認してから、起動中のサーバーを使い、ブラウザで次を順に試します。アプリに新しいルールが反映されていない場合は、保存状態を確認してページを再読み込みします。それでも古い動作の場合は、サーバー用ターミナルで **Ctrl+C** を押し、`bin/rails server -b 0.0.0.0` を再実行します。`Listening on http://0.0.0.0:3000` を確認してから、同じブラウザのページを再読み込みしてください。

| 操作 | 入力・確認する内容 |
|---|---|
| `/articles/new` で正常な登録 | Titleに `最終確認`、Bodyに `ブラウザでも確認します`。登録後に両方が表示される |
| Edit this articleで更新 | Titleを `更新の確認` にして更新する。詳細と一覧に新しいタイトルが表示される |
| 同じ記事をもう一度編集 | Titleを空欄にして更新する。エラーが出る。Back to articlesで一覧に戻り、保存済みタイトルは `更新の確認` のままである |
| New articleで本文空欄 | Titleに `本文チェック`、Bodyは空欄。エラーが出て保存されない |
| New articleで21文字 | Titleに `123456789012345678901`、Bodyに `境界の確認`。文字数のエラーが出て保存されない |
| 同じフォームで20文字へ修正 | Titleを `12345678901234567890` にする。登録でき、詳細に20文字のタイトルが表示される |
| 今作った2件の詳細でDestroy this article | 削除後、一覧から消える |

テストで作った記事が開発用の一覧に増えていないことも確認します。操作確認後は、サーバー用ターミナルで **Ctrl+C** を押して停止してください。

<details>
<summary>解答例・確認</summary>

正常な登録・更新・削除と、無効な入力を拒否する表示が確認できれば完了です。request specは登録処理を確認しましたが、実際のブラウザ操作や今回の更新・削除まで自動で確認したわけではありません。

</details>

---

## 課題30：確認した内容と修正理由を記録する（考察問題・実行しない）

> [!IMPORTANT]
> この課題は考察問題です。アプリやテストのコードを変更したり、コマンドを実行したりしません。
> アプリ直下に `practice17_report.md` を作り、次の項目への答えを書いて保存してください。

1. 課題29の全件実行の最後の結果を貼る。
2. 正常なPOSTと無効なPOSTについて、記事数・応答・画面へ返る内容の違いを書く。
3. 課題23で失敗したテストと、成功したモデルテストの違いを書く。修正したファイルと理由も書く。
4. 課題24で記事数の確認だけでは不十分だった理由を書く。
5. 課題25で期待値を変えてよい理由を、課題23との違いを含めて書く。
6. `be_valid` と登録のPOSTで、DBへの保存について何が違うかを書く。
7. 課題29のブラウザでの登録・更新・無効な入力・削除の結果を書く。

<details>
<summary>解答例・確認</summary>

記録例です。実行結果と画面の結果は自分が確認したものを書きます。

- 全件実行は24件、失敗0件。
- 正常なPOSTは1件増え、302と詳細画面への移動先が返る。無効なPOSTは増えず、422とエラー付きフォームが返る。
- 課題23はcontrollerが本文を受け取らない不具合。モデルテストは直接本文を準備するため成功する。Strong Parametersに `:body` を戻した。
- 課題24は保存されない点は正しくても、200の応答が仕様に合わない。
- 課題25は上限が20文字へ変わったので期待値を変える。課題23は仕様を変えていないので実装を直す。
- `be_valid` は判定だけ。POSTはcontrollerを通り、有効な入力ならテスト用DBへ保存する。

</details>

---

## 作業を終える前に

`practice17_report.md` をTeamsに提出してください。バックアップとして、VS Codeの **File → Open Folder...** で `/home/vscode` を開き、エクスプローラーの `rspec_starter` フォルダを右クリックして **Download...** からPCにも保存します。ダウンロードしたフォルダに `app`、`spec`、`Gemfile`、`practice17_report.md` が含まれることを確認してください。

Codespaceを停止した場合は、[Codespaces一覧](https://github.com/codespaces)から同じものを再開できます。Codespace自体を削除する前に、変更をバックアップしてください。次週はチーム開発準備へ進むため、今回のCodespaceが残っていることは前提にしません。

Practiceが終わったらStretchへ進みましょう。

参考：[RSpec Railsのrequest spec](https://rspec.info/features/8-0/rspec-rails/request-specs/request-spec/)・[Rails 8.0のバリデーション](https://guides.rubyonrails.org/v8.0/active_record_validations.html)

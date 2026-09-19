# 第16週：練習 ── Railsアプリを作り、RSpecで確かめる

## この練習について

自分でRailsアプリを作り、記事の登録・更新・削除をブラウザで確認します。そのあとRSpecを導入し、テストの作成・実行・失敗の読み取り・修正に取り組みます。

準備から課題30まで順に進めてください。課題で作るファイルは後の課題でも使います。

- コマンドは1行ずつ実行し、終了して入力待ちに戻ってから次へ進みます。
- ファイルを変更したら保存してから実行します。
- 「ファイル全体」と指定された場合だけ全体を置き換えます。追記や部分変更の課題では、指定箇所以外を残します。
- まず自分で作成・実行し、そのあと解答例を開いて比較します。異なる場合は、仕様とコードを見比べて直し、再実行します。
- 意図的に失敗させる課題では、失敗を確認してから修正します。修正後の成功まで確認して次へ進みます。

## 準備1：Codespacesを起動する

GitHubにログインし、次のバッジを右クリックして新しいタブで開いてください。

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/TORIFUKUKaiou/rails-ready-codespace)

1. Repositoryが `TORIFUKUKaiou/rails-ready-codespace`、Branchが `main` であることを確認します。
2. 作成画面の **Create codespace** をクリックします。
3. VS Codeが開き、コンテナの準備が終わってターミナルに入力できるまで待ちます。
4. ターミナルが見えない場合は、メニューの **Terminal → New Terminal** を選びます。

この環境にはRuby・Rails・SQLiteが入っています。アプリやRSpecの設定は、自分で作ります。

ターミナルで実行します。

```bash
cd /home/vscode
pwd
ruby -v
rails -v
sqlite3 --version
```

作業場所が `/home/vscode`、Railsが `Rails 8.0.2.1` と表示されることを確認します。RubyとSQLiteもバージョンが表示されれば使える状態です。

起動エラーや `command not found` が出た場合は、その表示を残して先生に確認してください。

## 準備2：rails newでアプリを作る

次のコマンドを実行します。

```bash
rails _8.0.2.1_ new rspec_practice --database=sqlite3 --skip-test --skip-bundle
cd /home/vscode/rspec_practice
```

- `_8.0.2.1_`：使うRailsのバージョンを指定します。
- `--database=sqlite3`：SQLiteを使います。
- `--skip-test`：標準のMinitest用ファイルを生成しません。RSpecは後で追加します。
- `--skip-bundle`：ライブラリのインストールを次の手順で自分で行います。

すでに同名のフォルダがある場合は、上書きや削除をせず確認してください。前の作業を再開する場合は `cd /home/vscode/rspec_practice` から続けます。

VS Codeの **File → Open Folder...** で `/home/vscode/rspec_practice` を開きます。「コンテナで再度開く」操作は不要です。左側に `app`、`config`、`db`、`Gemfile` が見えることを確認してください。

`Gemfile` を開き、`gem "rails", ...` の行だけを次に変更して保存します。他の行は残します。

```ruby
gem "rails", "8.0.2.1"
```

生成時だけでなく、アプリで使うRailsもこのバージョンに揃えます。

続けて、その行のすぐ下に次の1行を追加して保存します。

```ruby
gem "json", "~> 2.0"
```

Rails 8.0.2.1に合わせてJSON処理のライブラリを2系に揃えます。3系では記事フォームを開く際に互換性のエラーが起きるためです。

ターミナルで実行します。

```bash
cd /home/vscode/rspec_practice
bundle install
bin/rails --version
```

`Bundle complete!` と `Rails 8.0.2.1` を確認します。インストールに失敗した場合は、次へ進まずエラーを確認してください。

今回は `--skip-bundle` を指定したので、通常はアプリ作成時に行われるJavaScriptの初期設定も自分で実行します。

```bash
bin/rails importmap:install
bin/rails turbo:install
bin/rails stimulus:install
```

`config/importmap.rb`、`app/javascript/application.js`、`app/javascript/controllers/` が作成されることを確認します。ブラウザで使うJavaScriptの設定です。既存ファイルの上書きを尋ねられた場合は、表示内容を確認してから進めてください。

> [!IMPORTANT]
> この教材に出てくる `app/models/article.rb` や `spec/total_spec.rb` は、すべて `/home/vscode/rspec_practice` からの相対パスです。
> 新しいターミナルを開いたら、最初に `cd /home/vscode/rspec_practice` を実行してください。

## 準備3：Article CRUDとDBを作る

今回はテストの演習に進むため、CRUDのひな形をscaffoldで生成します。

```bash
bin/rails generate scaffold Article title:string body:text
bin/rails db:create
bin/rails db:migrate
```

`app/models/article.rb`、`app/controllers/articles_controller.rb`、`app/views/articles/` が作られていることを確認します。

`db/schema.rb` を開き、`articles` テーブルに `title` と `body` があることを確認してください。migrationのクラスにあるバージョンや、`schema.rb` は書き換えません。

## 準備4：ブラウザでCRUDを確認する

今使っているターミナルを「サーバー用」にします。

```bash
bin/rails server -b 0.0.0.0
```

`Listening on http://0.0.0.0:3000` を含む起動メッセージが出たら、そのまま起動しておきます。

VS Codeの **Ports** タブでポート3000の地球儀アイコン（Open in Browser）をクリックします。URLの末尾のパスを `/articles` にして開いてください。別タブで開けば、教材と見比べられます。

| 操作 | 入力・確認する内容 |
|---|---|
| New article → Create Article | Titleに `RSpecの練習`、Bodyに `自分でアプリを作りました` を入力して登録する |
| 作成後の詳細画面 | 入力したタイトルと本文が表示される |
| Edit this article → Update Article | Titleを `RSpecの練習を始めます` に変え、詳細画面でも変わることを確認する |
| Back to articles | 一覧に更新した記事がある |
| Show this article → Destroy this article | 記事を削除し、一覧から消えることを確認する |

見た目や英語の表示には多少の違いがあっても、登録・更新・削除の結果を確認します。最初の `/` に表示されるRailsの案内画面だけでは、CRUDの確認は終わっていません。

確認が終わったら、サーバー用ターミナルで **Ctrl+C** を押して停止します。次はGemfileを変更するため、サーバーを止めた状態で進めます。

## 準備5：RSpecを導入する

`Gemfile` の既存の `group :development, :test do` の内側に、次の1行を追加します。既存のgemは残してください。

```ruby
  gem "rspec-rails", "~> 8.0.0"
```

保存して、ターミナルで順に実行します。

```bash
bundle install
bin/rails generate rspec:install
RAILS_ENV=test bin/rails db:prepare
bundle exec rspec --version
```

- `bundle install`：RSpecと必要なライブラリをインストールします。
- `rspec:install`：`.rspec`、`spec/spec_helper.rb`、`spec/rails_helper.rb` を生成します。
- `RAILS_ENV=test`：今回のコマンドだけ、テスト用の環境を指定します。開発用とは別のDBを準備します。
- バージョン表示：`RSpec 3.13` と、`rspec-core` などのバージョンが表示されます。RSpec本体と `rspec-rails` は別のバージョン番号です。

`.rspec` には実行オプションが、`spec/rails_helper.rb` にはRailsを使うテストの設定が入っています。生成された内容はそのまま使います。

## 準備6：最初のテストを作る

VS Codeのエクスプローラーで `spec` フォルダを右クリックし、**New File** から `total_spec.rb` を作ります。ファイル全体を次にします。

```ruby
RSpec.describe "買い物の合計" do
  it "100円の商品を3個買うと300円になる" do
    price = 100
    quantity = 3
    total = price * quantity

    expect(total).to eq(300)
  end
end
```

保存したら、課題1で実行します。`_spec.rb` は、RSpecがテストファイルを探すための名前の決まりです。

## テスト課題の進め方

ここからのコマンドは、特に指定がなければ `/home/vscode/rspec_practice` のターミナルで実行します。RSpecを実行するためにサーバーを起動する必要はありません。

「テストを追加」とある課題では、対象ファイルの**外側の `RSpec.describe ... do` と最後の `end` の間**に、新しい `it ... end` を追加します。既存の `it` の内側には入れません。

各課題で件数も確認します。時間・色・実行順は環境によって変わります。`0 failures` だけでなく、期待した件数が実行されているかを見てください。

---

## 課題1：最初のテストを実行する

準備6で保存したファイルを実行してください。

```bash
bundle exec rspec spec/total_spec.rb
```

結果の最後から、実行件数と失敗件数を読み取ってください。

<details>
<summary>解答例・確認</summary>

```text
1 example, 0 failures
```

1件実行し、失敗は0件です。`0 examples` の場合は、ファイル名・保存状態・`it` が書かれているかを確認します。

</details>

---

## 課題2：意図的に期待値を変え、失敗を読む

> [!IMPORTANT]
> 失敗の表示を確認する課題です。この課題では、意図的に正しくない期待値を書きます。

対象：`spec/total_spec.rb`。`expect(total).to eq(300)` を `expect(total).to eq(500)` に変えて保存します。計算部分は変えません。

```bash
bundle exec rspec spec/total_spec.rb
```

`Failure/Error`、`expected`、`got`、ファイル名と行番号を探してください。

<details>
<summary>解答例・確認</summary>

表示の抜粋：

```text
Failure/Error: expect(total).to eq(500)

  expected: 500
       got: 300

1 example, 1 failure
```

期待した値は500、計算された値は300です。行番号はコード内の空行やコメントによって変わります。

</details>

---

## 課題3：仕様に合わせて期待値を戻す

仕様は「100円の商品を3個買うと300円」です。`spec/total_spec.rb` の間違っている箇所を直し、同じコマンドで再実行してください。

```bash
bundle exec rspec spec/total_spec.rb
```

<details>
<summary>解答例・確認</summary>

```ruby
expect(total).to eq(300)
```

`1 example, 0 failures` に戻ります。今回は計算処理ではなく、課題2で変えたテストの期待値を直します。

</details>

---

## 課題4：テスト名を実行結果に表示する

`spec/total_spec.rb` の `it` の説明だけを `単価100円・個数3個の合計は300円になる` に変えて保存します。計算と期待値はそのままです。

```bash
bundle exec rspec spec/total_spec.rb --format documentation
```

`--format documentation` はテスト名を表示するオプションです。どの確認が成功したか、説明文と結果を対応させてください。

<details>
<summary>解答例・確認</summary>

表示の抜粋：

```text
買い物の合計
  単価100円・個数3個の合計は300円になる

1 example, 0 failures
```

名前の変更ではテストの件数や判定は変わりません。

</details>

---

## 課題5：値引き後の金額を確認する

対象：`spec/total_spec.rb`。新しい `it` を1件追加してください。

priceを100、discountを20として、引き算で値引き後の金額を求め、80になることを確認します。

```bash
bundle exec rspec spec/total_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加する部分：

```ruby
it "20円引きの金額は80円になる" do
  price = 100
  discount = 20
  discounted_price = price - discount

  expect(discounted_price).to eq(80)
end
```

`2 examples, 0 failures` を確認します。

</details>

---

## 課題6：文字列の組み立てを確認する

対象：`spec/total_spec.rb`。新しい `it` を1件追加してください。

nameに「山田」を入れ、文字列の式展開で「山田さん」を作って確認します。式展開は `"#{name}さん"` と書きます。

```bash
bundle exec rspec spec/total_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加する部分：

```ruby
it "名前にさんを付ける" do
  name = "山田"
  greeting = "#{name}さん"

  expect(greeting).to eq("山田さん")
end
```

`3 examples, 0 failures` を確認します。

</details>

---

## 課題7：日本語の文字数を確認する

対象：`spec/total_spec.rb`。新しい `it` を1件追加してください。

textに「テスト」を入れ、`text.length` が3になることを確認します。`length` は文字数を返します。

```bash
bundle exec rspec spec/total_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加する部分：

```ruby
it "テストは3文字である" do
  text = "テスト"

  expect(text.length).to eq(3)
end
```

`4 examples, 0 failures` を確認します。

</details>

---

## 課題8：空文字の結果を確認する

対象：`spec/total_spec.rb`。新しい `it` を1件追加してください。

textに空文字 `""` を入れ、文字数が0になることを確認します。空文字は何も文字が入っていない文字列です。

```bash
bundle exec rspec spec/total_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加する部分：

```ruby
it "空文字は0文字である" do
  text = ""

  expect(text.length).to eq(0)
end
```

`5 examples, 0 failures` を確認します。

</details>

---

## 課題9：個数が0の場合を確認する

対象：`spec/total_spec.rb`。新しい `it` を1件追加してください。

priceを100、quantityを0にします。掛け算したtotalが0になることを、新しいテストで確認します。最初の3個のテストも残してください。

```bash
bundle exec rspec spec/total_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加する部分：

```ruby
it "個数が0なら合計は0円になる" do
  price = 100
  quantity = 0
  total = price * quantity

  expect(total).to eq(0)
end
```

`6 examples, 0 failures` を確認します。

</details>

---

## ここからモデルのテストへ

`Article.new` は確認用の記事を作りますが、DBには保存しません。各 `it` の中で必要なデータを作り、ほかのテストで作った変数やブラウザで登録した記事に頼らずに確認します。

---

## 課題10：記事のタイトルを確認する

`spec` の中に `models` フォルダを作り、その中に `article_spec.rb` を作成します。ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe Article, type: :model do
  it "指定したタイトルを持つ" do
    article = Article.new(title: "はじめてのRSpec", body: "テストを練習します")

    expect(article.title).to eq("はじめてのRSpec")
  end
end
```

```bash
bundle exec rspec spec/models/article_spec.rb
```

<details>
<summary>解答例・確認</summary>

`1 example, 0 failures` です。`require "rails_helper"` は、Railsとモデルを使うための設定を読み込みます。これはDBへの保存を確認するテストではありません。

</details>

---

## 課題11：記事の本文を確認する

対象：`spec/models/article_spec.rb`。新しい `it` を1件追加してください。

タイトルを「Ruby」、本文を「毎日練習します」として記事を作り、本文が指定どおりか確認します。

```bash
bundle exec rspec spec/models/article_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加する部分：

```ruby
it "指定した本文を持つ" do
  article = Article.new(title: "Ruby", body: "毎日練習します")

  expect(article.body).to eq("毎日練習します")
end
```

`2 examples, 0 failures` です。

</details>

---

## 課題12：2件の記事がそれぞれのタイトルを持つことを確認する

対象：`spec/models/article_spec.rb`。新しい `it` を1件追加してください。

同じテスト内でfirst_articleとsecond_articleを作り、それぞれ「Ruby」「Rails」のタイトルを持つことを2行のexpectで確認します。

```bash
bundle exec rspec spec/models/article_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加する部分：

```ruby
it "2件の記事はそれぞれのタイトルを持つ" do
  first_article = Article.new(title: "Ruby", body: "文法")
  second_article = Article.new(title: "Rails", body: "Webアプリ")

  expect(first_article.title).to eq("Ruby")
  expect(second_article.title).to eq("Rails")
end
```

`3 examples, 0 failures` です。`expect`が2行でも、`it`は1件です。

</details>

---

## 課題13：空文字を指定した記事を確認する

対象：`spec/models/article_spec.rb`。新しい `it` を1件追加してください。

titleとbodyに空文字を指定し、article.titleが空文字であることを確認します。有効なデータかどうかの判定は第17週で扱います。

```bash
bundle exec rspec spec/models/article_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加する部分：

```ruby
it "空文字のタイトルを持つ" do
  article = Article.new(title: "", body: "")

  expect(article.title).to eq("")
end
```

`4 examples, 0 failures` です。

</details>

---

## 課題14：newだけでは保存されないことを確認する

対象：`spec/models/article_spec.rb`。新しい `it` を1件追加してください。

記事をnewで作り、`article.new_record?` が `true` であることを確認します。`new_record?` は、まだDBに保存していない場合にtrueを返します。trueは文字列ではないので引用符を付けません。

```bash
bundle exec rspec spec/models/article_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加する部分：

```ruby
it "newで作った記事は未保存である" do
  article = Article.new(title: "未保存の記事", body: "確認用")

  expect(article.new_record?).to eq(true)
end
```

`5 examples, 0 failures` です。

</details>

---

## 課題15：表示用メソッドの不具合をテストで見つける

ここからはRailsのモデルに、自分でメソッドを追加します。`def メソッド名` から `end` までがメソッドで、最後に評価した値を返します。

仕様：タイトルが「Ruby」なら、`display_title` は **「Ruby（記事）」** を返します。括弧は全角です。

> [!IMPORTANT]
> 次のモデルには意図的な不具合があります。まず失敗を確認し、修正は課題16で行います。

対象：`app/models/article.rb`。現在は空のモデルなので、ファイル全体を次にします。

```ruby
class Article < ApplicationRecord
  def display_title
    "記事：#{title}"
  end
end
```

次に `spec/models/article_display_spec.rb` を作ります。ファイル全体を次にして実行します。

```ruby
require "rails_helper"

RSpec.describe Article, type: :model do
  it "タイトルの後ろに全角括弧で記事と付ける" do
    article = Article.new(title: "Ruby", body: "文法")

    expect(article.display_title).to eq("Ruby（記事）")
  end
end
```

```bash
bundle exec rspec spec/models/article_display_spec.rb
```

<details>
<summary>解答例・確認</summary>

`1 example, 1 failure` です。

```text
expected: "Ruby（記事）"
     got: "記事：Ruby"
```

仕様と期待値は一致しています。モデルが返す文字列を調べます。

</details>

---

## 課題16：期待値を変えずに実装を直す

対象：`app/models/article.rb`。`display_title` が仕様どおりの文字列を返すように、メソッド内の1行を修正してください。テストの期待値は変更しません。

```bash
bundle exec rspec spec/models/article_display_spec.rb
```

<details>
<summary>解答例・確認</summary>

変更前：

```ruby
"記事：#{title}"
```

変更後：

```ruby
"#{title}（記事）"
```

`1 example, 0 failures` になります。

</details>

---

## 課題17：別のタイトルでも動くことを確認する

対象：`spec/models/article_display_spec.rb`。タイトルが「Rails入門」の場合に「Rails入門（記事）」を返すテストを1件追加してください。

```bash
bundle exec rspec spec/models/article_display_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加する部分：

```ruby
it "別のタイトルにも記事と付ける" do
  article = Article.new(title: "Rails入門", body: "CRUD")

  expect(article.display_title).to eq("Rails入門（記事）")
end
```

`2 examples, 0 failures` です。特定のタイトルをそのまま返す実装では、別の入力を確認できません。

</details>

---

## 課題18：空のタイトルに対する仕様をテストにする

追加の仕様：タイトルが空文字 `""` なら、`display_title` は **「無題（記事）」** を返します。

対象：`spec/models/article_display_spec.rb`。この仕様を確認する `it` を1件、自分で追加して実行してください。

> [!IMPORTANT]
> 今の実装は空文字に対応していません。この課題は新しい仕様のテストが失敗することを確認します。モデルの修正は次の課題です。

```bash
bundle exec rspec spec/models/article_display_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加する部分：

```ruby
it "空のタイトルには無題と付ける" do
  article = Article.new(title: "", body: "本文")

  expect(article.display_title).to eq("無題（記事）")
end
```

`3 examples, 1 failure`。期待値は `"無題（記事）"`、実際の値は `"（記事）"` です。

</details>

---

## 課題19：条件分岐を追加し、既存のテストも確認する

対象：`app/models/article.rb`。`display_title` の中を `if title == ""` で分岐させます。空文字なら「無題（記事）」、それ以外ならタイトルの後ろに「（記事）」を付けて返してください。

```bash
bundle exec rspec spec/models/article_display_spec.rb
```

空文字だけでなく、課題15・17のタイトルも成功しているか確認します。

<details>
<summary>解答例・確認</summary>

`display_title` メソッドだけを次にします。

```ruby
def display_title
  if title == ""
    "無題（記事）"
  else
    "#{title}（記事）"
  end
end
```

`3 examples, 0 failures` です。ここでは空文字の仕様を扱いました。未設定の値 `nil` や空白だけのタイトルについては、この3件では確認していません。

</details>

---

## 課題20：誤った期待値を見つける

対象：`spec/models/article_spec.rb`。最初のテストの期待値だけを、一時的に次に変更します。

```ruby
expect(article.title).to eq("はじめてのRails")
```

> [!IMPORTANT]
> この課題はテストの間違いを確認するため、意図的に期待値を変更します。確認後、この課題内で元に戻します。

仕様は「newで指定したタイトルをそのまま持つ」です。

```bash
bundle exec rspec spec/models/article_spec.rb
```

失敗を読み、newに指定した値と期待値を比較します。仕様に合わせて直し、同じコマンドを再実行してください。

<details>
<summary>解答例・確認</summary>

変更直後は `5 examples, 1 failure`。記事に指定したのは「はじめてのRSpec」です。

期待値を戻します。

```ruby
expect(article.title).to eq("はじめてのRSpec")
```

再実行で `5 examples, 0 failures`。モデルは変更しません。

</details>

---

## 課題21：変数名の記述ミスを直す

対象：`spec/models/article_spec.rb`。最初のテストの `expect(article.title)` だけを `expect(artcle.title)` に変更します。

> [!IMPORTANT]
> 意図的に変数名を間違える課題です。エラーを確認したら、この課題内で修正します。

```bash
bundle exec rspec spec/models/article_spec.rb
```

`NameError` と `artcle` が出ている箇所を探し、準備した変数名と比較して直します。再実行してください。

<details>
<summary>解答例・確認</summary>

変更直後は `5 examples, 1 failure`。`article` を用意していますが、確認側が `artcle` になっています。

```ruby
expect(article.title).to eq("はじめてのRSpec")
```

修正後は `5 examples, 0 failures`。期待値の比較に進む前に、変数名の間違いで失敗していた例です。

</details>

---

## 課題22：endの不足を確認して戻す

対象：`spec/models/article_spec.rb`。ファイルの一番最後の `end` を1行だけ削除して保存します。

> [!IMPORTANT]
> Rubyの構文エラーを確認するための操作です。ほかの行は変更せず、この課題内で削除したendを戻します。

```bash
bundle exec rspec spec/models/article_spec.rb
```

`SyntaxError` を探してください。そのあと最後の `end` を戻して再実行します。

<details>
<summary>解答例・確認</summary>

`SyntaxError` と、`end` が不足していることを示すメッセージが表示されます。この場合、テストの実行前に読み込みが失敗します。期待値を書き換えても直りません。

最後の `end` を戻すと `5 examples, 0 failures` です。

</details>

---

## 課題23：Railsの設定の読み込みを確認する

対象：`spec/models/article_spec.rb`。先頭の1行を、一時的に `#` でコメントにします。

```ruby
# require "rails_helper"
```

> [!IMPORTANT]
> Railsの設定を読み込まない場合のエラーを確認する課題です。この課題内でコメントを外します。

必ず次のように、このファイルだけを実行してください。他のファイルも一緒に実行すると、そちらでRailsが読み込まれることがあります。

```bash
bundle exec rspec spec/models/article_spec.rb
```

エラーを確認したら `#` を外し、同じコマンドで再実行します。

<details>
<summary>解答例・確認</summary>

`NameError` と `uninitialized constant Article` が表示されます。Railsを読み込んでいないため、`Article` が見つかりません。

```ruby
require "rails_helper"
```

元に戻すと `5 examples, 0 failures` です。

</details>

---

## 課題24：ここまでのテストをまとめて実行する

ファイルを指定せずに実行してください。

```bash
bundle exec rspec
```

次の内訳と合っているか確認します。

| ファイル | itの件数 |
|---|---|
| `spec/total_spec.rb` | 6 |
| `spec/models/article_spec.rb` | 5 |
| `spec/models/article_display_spec.rb` | 3 |

<details>
<summary>解答例・確認</summary>

合計で `14 examples, 0 failures` です。件数が違う場合は、追加し忘れや同じテストの重複、ファイル名が `_spec.rb` で終わっているかを確認してください。

失敗があれば、そのファイルだけを実行して直し、最後に全件を再実行します。

</details>

---

## 課題25：本文の文字数を返すメソッドを作る

新しい仕様：`body_length` は本文の文字数を返します。まず「Ruby」なら4を返すテストを作ります。

`spec/models/article_body_spec.rb` を新規作成し、ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe Article, type: :model do
  it "本文Rubyの文字数は4である" do
    article = Article.new(title: "文字数", body: "Ruby")

    expect(article.body_length).to eq(4)
  end
end
```

> [!IMPORTANT]
> まだbody_lengthメソッドを作っていないので、最初の実行では失敗します。その確認後にメソッドを追加します。

```bash
bundle exec rspec spec/models/article_body_spec.rb
```

`NoMethodError` と `body_length` が表示されることを確認します。

次に `app/models/article.rb` の、Articleクラスの最後の `end` の直前へ `body_length` メソッドを追加してください。`display_title` の中には入れません。既存のメソッドは残します。`body.length` を返すようにします。

同じコマンドで再実行してください。

<details>
<summary>解答例・確認</summary>

追加するメソッド：

```ruby
def body_length
  body.length
end
```

最初は `1 example, 1 failure`、追加後は `1 example, 0 failures` です。

</details>

---

## 課題26：日本語の本文でも文字数を確認する

対象：`spec/models/article_body_spec.rb`。本文が「毎日練習」なら文字数は4です。テストを1件追加してください。

```bash
bundle exec rspec spec/models/article_body_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加する部分：

```ruby
it "日本語の本文も文字数を返す" do
  article = Article.new(title: "日本語", body: "毎日練習")

  expect(article.body_length).to eq(4)
end
```

`2 examples, 0 failures` です。

</details>

---

## 課題27：空の本文を確認する

対象：`spec/models/article_body_spec.rb`。本文が空文字なら文字数は0です。テストを1件追加して確認します。

```bash
bundle exec rspec spec/models/article_body_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加する部分：

```ruby
it "空の本文は0文字である" do
  article = Article.new(title: "空の本文", body: "")

  expect(article.body_length).to eq(0)
end
```

`3 examples, 0 failures` です。タイトルと同様、空文字を持つことと、保存を許可するかどうかは別の確認です。

</details>

---

## 課題28：テストが不具合を検出することを確かめる

対象：`app/models/article.rb`。`body_length` の `body.length` を、一時的に `body.length + 1` に変更します。

> [!IMPORTANT]
> 意図的に文字数を1つ多く返す不具合を入れます。テストの失敗を確認してから、この課題内で元に戻します。

```bash
bundle exec rspec spec/models/article_body_spec.rb
```

3件の実際の値を読み、仕様との違いを確認します。メソッドを元に戻し、対象ファイルを再実行します。そのあと全件を実行してください。

```bash
bundle exec rspec spec/models/article_body_spec.rb
bundle exec rspec
```

<details>
<summary>解答例・確認</summary>

不具合を入れた状態では `3 examples, 3 failures`。期待値4・4・0に対して、実際の値は5・5・1です。

`body.length` に戻すと、対象ファイルは `3 examples, 0 failures`、全件は `17 examples, 0 failures` です。テストの期待値を5や1に変えると、不具合を正しいことにしてしまいます。

</details>

---

## 課題29：最後にテストとブラウザの両方で確認する

まず全件を実行し、結果を記録用に残してください。

```bash
bundle exec rspec --format documentation
```

`17 examples, 0 failures` を確認します。

サーバー用ターミナルで起動します。

```bash
cd /home/vscode/rspec_practice
bin/rails server -b 0.0.0.0
```

ポート3000をブラウザで開き、`/articles` にアクセスします。次の操作を行います。

1. Title「最後の確認」、Body「RSpecで確認しました」の記事を作成する。
2. 詳細画面で入力内容を確認する。
3. Titleを「更新も確認」に変更し、更新後の表示を確認する。
4. 記事を削除し、一覧から消えたことを確認する。

今回は `display_title` や `body_length` をビューには組み込んでいません。画面で「（記事）」や文字数が表示されないのは正常です。

確認後、サーバー用ターミナルでCtrl+Cを押して停止します。

<details>
<summary>解答例・確認</summary>

RSpecでは17件の確認が成功し、ブラウザでは作成・更新・削除の結果を確認できれば完了です。

今回のモデルテストは、ルーティング・フォーム・画面表示の一連の操作までは確認していません。そのため、ブラウザでも確認します。

</details>

---

## 課題30：確認内容と修正理由を記録する（考察問題・実行しない）

> [!IMPORTANT]
> この課題は考察問題です。アプリやテストのコードを変更したり、コマンドを実行したりしません。
> `/home/vscode/rspec_practice` の直下に `practice16_report.md` を作り、次の項目への答えを書いて保存してください。

1. 課題29の全件実行の最後の結果を貼る。
2. 課題2の期待値と実際の値、および修正した箇所を書く。
3. 課題15の仕様・実際の値・修正したファイルと理由を書く。
4. `expect` が2行ある課題12が1件のテストとして数えられる理由を書く。
5. `Article.new` のテストでは、保存やブラウザ表示まで確認できない理由を書く。
6. 課題29で行った作成・更新・削除の結果を書く。

<details>
<summary>解答例・確認</summary>

記録例です。実行結果と操作結果は、自分が確認したものを書いてください。

- 全件実行：17 examples, 0 failures。
- 課題2：期待値500、実際の値300。仕様は300なので、テストの期待値を300に戻した。
- 課題15：「Ruby（記事）」を返す仕様なのに「記事：Ruby」を返した。`app/models/article.rb` の文字列の組み立て方を直した。
- 課題12：`it` が1つなので1件として数える。
- `Article.new` は未保存の記事を作る。ブラウザからリクエストを送っていないので画面も確認していない。
- 画面確認：「最後の確認」で作成でき、「更新も確認」へ更新できた。削除後は一覧から消えた。

</details>

---

## 作業を終える前に

第17週もこのアプリを使います。Codespaceを削除せず、再開するときはGitHubのCodespaces一覧から今回のものを開いてください。冒頭のバッジから毎回新しく作る必要はありません。

`/home/vscode` のアプリはコンテナの再ビルドで消えるため、再ビルドしないでください。バックアップとして、VS Codeの **File → Open Folder...** で `/home/vscode` を開き、エクスプローラーの `rspec_practice` フォルダを右クリックして **Download...** から自分のPCにも保存してください。ダウンロードされたフォルダに `app`、`spec`、`Gemfile`、`practice16_report.md` が含まれることを確認します。

提出は先生から指定された提出先へ、`practice16_report.md` と作成したコードを提出してください。

Practiceが終わったらStretchへ進みましょう。

参考：[RSpec Railsの導入と実行](https://github.com/rspec/rspec-rails/tree/8-0-maintenance)

# 第16週：RSpec入門（1）テストを動かす・失敗を読む

## 今日のゴール

後期は、 **アプリの動作をコードで確認する「自動テスト」** から始めます。

- テストを実行し、成功したか失敗したかを確認できる
- 「何を準備して、どんな結果を確かめるか」をテストに書ける
- 失敗した行・期待した値・実際の値を読み取れる
- 仕様と照らし合わせて修正し、もう一度テストを実行できる

> [!NOTE]
> このページでは、テストの考え方とRSpecの基本的な書き方を学びます。
> このあとPracticeで、環境の準備から順に、全員が実際に作成・実行・修正します。

[PDF資料](https://drive.google.com/file/d/1Es_lMOpSM_TNMtERU4BHcoUbBO4vvsxL/view?usp=drive_link)

---

## 1. 今まで、どうやって動作を確かめていた？

前期は、記事アプリをブラウザで操作しました。

| 操作 | 確認していたこと |
|---|---|
| タイトルと本文を入力して登録する | 入力した記事が表示される |
| タイトルを変更して更新する | 新しいタイトルが表示される |
| 記事を削除する | 一覧からその記事が消える |

これは、人が操作して結果を確かめる**手動テスト**です。

たとえば、タイトルの表示を修正したあと、記事を登録・更新・削除できるか、もう一度確かめます。自分が変更したところ以外に影響が出ることもあるためです。

変更のたびに同じ確認を繰り返すなら、確認する内容をコードに書いて、コンピューターに実行してもらえないでしょうか。

それが**自動テスト**です。

---

## 2. RSpecは「実際の結果」と「期待する結果」を比べる道具

<ruby>RSpec<rt>アールスペック</rt></ruby>は、Rubyで自動テストを書くための道具です。Railsでは、RailsとRSpecをつなぐ `rspec-rails` も使います。

最初は、短い計算で考えます。

```ruby
price = 100
quantity = 3
total = price * quantity
```

100円の商品を3個買うので、期待する合計は300円です。

```ruby
expect(total).to eq(300)
```

この1行は、**「実際の `total` の値が、期待する `300` と等しいことを確かめる」**という意味です。

| 書き方 | この例での意味 |
|---|---|
| `expect(total)` | 調べる実際の値は `total` |
| `.to eq(300)` | 期待する値は `300`。等しければ成功 |

`puts total` は値を表示し、人が結果を判断します。RSpecでは、期待する値もコードに書くことで、成功・失敗の判定まで行えます。

---

## 3. テストファイルは、この形で書く

### RSpecを使えるようにする設定例

RailsアプリにRSpecを追加するには、`Gemfile` の `group :development, :test do` の中に次のgemを追記します。以下はRails 8.0で使う一例です。既存のgemは残し、同じグループがなければこのブロックを追加します。

```ruby
group :development, :test do
  gem "rspec-rails", "~> 8.0.0"
end
```

`development` は開発用、`test` はテスト用の環境です。`rspec-rails` を入れると、RSpec本体も一緒にインストールされます。

`Gemfile` を保存し、そのファイルがあるフォルダのターミナルで順に実行します。

```bash
bundle install
bin/rails generate rspec:install
```

`.rspec`、`spec/spec_helper.rb`、`spec/rails_helper.rb` が作成されれば、設定ファイルの準備は完了です。使用するRailsのバージョンに合わせて、[rspec-railsの対応バージョン](https://github.com/rspec/rspec-rails#supported-versions)を選びます。

### テストファイルの例

対象ファイル：Railsアプリ内の `spec/total_spec.rb`

以下がファイル全体です。

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

上から、**何を調べるか → どんな結果になるか → 準備と処理 → 結果の確認**の順に書いています。

| 部分 | 役割 |
|---|---|
| `RSpec.describe "買い物の合計" do` | テストする対象を示し、関連するテストをまとめる |
| `it "100円の商品を3個買うと300円になる" do` | 確認する内容を、1件のテストとして書く |
| `price = 100` から `total = price * quantity` | 値を準備し、処理を行う |
| `expect(total).to eq(300)` | 実際の結果と期待する結果を比べる |

`do` と `end` で処理のまとまりを囲みます。外側の `describe` と内側の `it` に、それぞれ対応する `end` が必要です。

テストの名前は日本語で書けます。「テスト1」よりも、**どんな条件で、どうなるか**が分かる名前にします。

---

## 4. 実行結果を見る

RSpecを導入済みのRailsアプリで、`Gemfile` があるフォルダから次のコマンドを実行します。

```bash
bundle exec rspec spec/total_spec.rb
```

`bundle exec rspec` は、このアプリで使うRSpecを実行するコマンドです。後ろに書いたファイルだけをテストします。

表示の抜粋：

```text
1 example, 0 failures
```

- `1 example`：1件のテストを実行した
- `0 failures`：失敗は0件だった

表示の色だけでなく、**実行件数と失敗件数**を読みます。`0 examples` なら、確認したかったテストが実行されていません。

### わざと期待値を変えると？

> [!IMPORTANT]
> 次の例では、失敗の表示を確認するために、意図的に期待値を変更しています。
> 計算のルールを変更する場面ではありません。

同じファイルの確認部分だけを変更します。

変更前：

```ruby
expect(total).to eq(300)
```

変更後：

```ruby
expect(total).to eq(500)
```

同じ実行コマンドで、もう一度テストします。

表示の抜粋：

```text
Failure/Error: expect(total).to eq(500)

  expected: 500
       got: 300

1 example, 1 failure
```

| 表示 | 読み取ること |
|---|---|
| `Failure/Error` | 失敗したコード |
| `expected: 500` | テストに書いた期待値は500 |
| `got: 300` | 実際の値は300 |
| `1 example, 1 failure` | 1件実行し、1件失敗した |

失敗の詳細には、`spec/total_spec.rb:7` のように**ファイル名と行番号**も表示されます。実際の行番号はファイルの書き方によって変わります。

この例では、正しい合計は300円です。期待値を `300` に戻して保存し、同じコマンドを再実行すると、`1 example, 0 failures` に戻ります。

---

## 5. Railsのモデルも、同じ形で確かめられる

記事のタイトルを確かめる例です。

対象ファイル：Railsアプリ内の `spec/models/article_spec.rb`

`title` と `body` を持つ `Article` モデルが用意されたアプリで使います。以下がテストファイル全体です。

```ruby
require "rails_helper"

RSpec.describe Article, type: :model do
  it "指定したタイトルを持つ" do
    article = Article.new(title: "はじめてのRSpec", body: "テストを練習します")

    expect(article.title).to eq("はじめてのRSpec")
  end
end
```

- `require "rails_helper"`：Railsのテスト用設定を読み込む
- `RSpec.describe Article, type: :model`：`Article` のモデルテストであることを示す
- `Article.new(...)`：確認に使う記事のオブジェクトを作る
- `article.title`：その記事のタイトルを取り出す

`Article.new` だけではDBに保存されません。このテストで確認するのは、**作った記事が指定したタイトルを持つこと**です。保存やブラウザへの表示までは確認していません。

実行コマンド：

```bash
bundle exec rspec spec/models/article_spec.rb
```

このファイルに上の1件だけがあれば、結果は `1 example, 0 failures` です。

テストでは、そのテストで使う記事を自分で準備します。ブラウザから登録した記事が、最初からあるとは考えません。Railsは通常、開発用とテスト用で別のDBを使います。

---

## 6. 失敗したら、どこを直す？

**仕様**とは、「どんな条件で、どう動くべきか」というアプリの約束です。

たとえば、「100円の商品を3個買うと300円になる」という仕様なら、次の2つは修正する場所が異なります。

| 状況 | 修正する場所 |
|---|---|
| 計算結果は300だが、テストに500と書いてしまった | テストの期待値を300に直す |
| テストは300を期待しているが、アプリが103を返した。調べると掛け算のはずが足し算になっていた | アプリの計算処理を直す |

実際の値に合わせて期待値を書き換えるだけでは、アプリの不具合を見逃してしまいます。

```mermaid
flowchart LR
  A["テストを実行"] --> B["失敗した行と値を読む"]
  B --> C["仕様とコードを照らし合わせる"]
  C --> D["間違っている箇所を修正"]
  D --> E["もう一度テストを実行"]
```

また、`SyntaxError` のように、コードの書き方が原因でテストを実行できない場合もあります。その場合は、表示されたファイル・行番号を見て、`end` や括弧などを確認します。

修正したら、まず対象のファイルを再実行します。そのあと、ほかのテストにも影響がないか、全件を実行します。

```bash
bundle exec rspec
```

最後に表示される実行件数を確認し、`0 failures` になっているかを読みます。

テストがすべて成功しても、まだテストに書いていない動作まで正しいと分かったわけではありません。ブラウザでの確認も続けます。

---

## Practiceで手を動かそう

Practiceでは、値の比較から始め、記事のテストを追加し、仕様と失敗結果を読んで不具合を修正します。

1. 課題の条件から、結果を予想する
2. 指定されたファイルにコードを書き、保存する
3. テストを実行し、件数と結果を読む
4. 失敗したら、仕様とコードを見比べて修正する
5. 再実行して確かめ、自分の結果を解答例と比較する

ブラウザ確認でRailsサーバーを使うときは、サーバー用とは別のターミナルでRSpecを実行します。RSpec自体の実行に、`rails server` の起動は必要ありません。

[Practice](practice.md)は全問に取り組み、終わったらStretchへ進みましょう。

---

参考：[RSpecの値の比較](https://rspec.info/features/3-13/rspec-expectations/built-in-matchers/equality/)・[RSpec Rails](https://github.com/rspec/rspec-rails)

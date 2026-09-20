# 第16週：Stretch ── 料金と表示のルールをRSpecで確かめる

[Practice](practice.md)で作ったアプリに、料金計算や表示用の小さなクラスを追加します。仕様を読み、通常の入力だけでなく、境界・空の値・仕様変更をテストで確かめます。

## 準備：Practiceのアプリを再開する

GitHubのCodespaces一覧から、Practiceで使ったCodespaceを開きます。新しいCodespaceを作ったり、コンテナを再ビルドしたりする必要はありません。

VS Codeで `/home/vscode/rspec_practice` を開き、ターミナルで実行してください。

```bash
cd /home/vscode/rspec_practice
pwd
bin/rails --version
bundle exec rspec
```

作業場所が `/home/vscode/rspec_practice`、アプリのRailsが `Rails 8.0.2.1`、テスト結果が `17 examples, 0 failures` であることを確認します。以前にStretchを進めている場合は、その分だけ件数が増えます。

フォルダがない場合は、Practiceのバックアップを戻すか、Practiceの準備から再開してください。フォルダがあるのに失敗する場合は、表示されたエラーとPracticeの手順を確認し、既存のファイルを消して作り直さないでください。

## 今回作るもの

この教材内のファイルパスは、すべて `/home/vscode/rspec_practice` からの相対パスです。

- 実装：`app/models/stretch_shipping.rb` など、題材ごとに1ファイル
- テスト：`spec/stretch/shipping_spec.rb` など、題材ごとに1ファイル

`spec` の下に `stretch` フォルダを新しく作ります。同名のファイルがすでにある場合は、自分の作業を確認して続きから進めてください。

今回はDBに保存しないRubyのクラスです。`ApplicationRecord` を継承せず、migrationやテーブルも作りません。Railsは `app/models` のファイル名とクラス名を対応させて読み込みます。たとえば `stretch_shipping.rb` には `StretchShipping` を書きます。

```ruby
class StretchShipping
  def calculate(amount)
    # amountを使って計算し、結果を返す
  end
end
```

`StretchShipping.new` で作ったオブジェクトの `calculate(1000)` を呼ぶと、引数 `amount` に1000が入ります。メソッドは最後に評価した値を返します。

## 進め方

- 50問を順に進めます。5問ごとに題材が変わります。
- テスト名は「何を確認するか」が分かる日本語にします。
- 追加する `it ... end` は、外側の `RSpec.describe ... do` の最後の `end` の直前に入れます。既存の `it` の中に入れません。
- 自分で書いて実行してから解答例を開き、入力・期待値・実装を比較します。修正したら必ず再実行します。
- 「ファイル全体」とある場合だけ全体を置き換えます。PracticeのArticleやテストは変更しません。
- 失敗を意図した課題は、その表示を確認してから直します。最終的に成功へ戻して次へ進みます。
- 対象ファイルの実行件数は本文のとおり確認します。既存のファイルを残した全件実行は最後に行います。

> [!NOTE]
> このStretchには、引数のあるメソッド、整数の割り算、`strip`、文字列の切り出し、`sum`、`min`、`max` など、Orientationで詳しく扱っていない内容が含まれます。
> 各題材の補足を読み、分からない書き方はRubyの公式ドキュメントを検索したり、生成AIに具体的な入力と期待結果を示して相談したりしてください。得られたコードは自分のテストで確かめます。

Railsサーバーは不要です。起動している場合はサーバー用ターミナルでCtrl+Cを押して止められます。この教材では画面やDBを変更しません。

---

## 題材1：送料の境界

**仕様：** 購入金額が3000円以上なら送料0円、3000円未満なら500円。金額は0以上の整数です。

補足：`>=` は「以上」、`>` は「より大きい」です。

### 課題1：最初のテストから実装する

`app/models/stretch_shipping.rb` を新規作成し、まずファイル全体を次にします。`nil` は「値がない」ことを表す仮の戻り値です。

```ruby
class StretchShipping
  def calculate(amount)
    nil
  end
end
```

`spec/stretch/shipping_spec.rb` を新規作成し、ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe StretchShipping do
  it "通常の注文" do
    calculator = StretchShipping.new

    expect(calculator.calculate(1000)).to eq(500)
  end
end
```

> [!IMPORTANT]
> 最初は実装が仮のnilなので、意図的に失敗します。失敗を確認したあと、この課題内で仕様どおりの実装に直します。

```bash
bundle exec rspec spec/stretch/shipping_spec.rb
```

`1 example, 1 failure` と `got: nil` を確認します。そのあと `app/models/stretch_shipping.rb` の `calculate` の中を仕様どおりに実装し、同じコマンドで再実行してください。

<details>
<summary>解答例・確認</summary>

実装ファイル全体：

```ruby
class StretchShipping
  def calculate(amount)
    if amount >= 3000
      0
    else
      500
    end
  end
end
```

`1 example, 0 failures` に変わります。テストの期待値をnilに変更してはいけません。

</details>

### 課題2：無料になる直前を確かめる

対象：`spec/stretch/shipping_spec.rb`。入力が `2999` のとき、結果が `500` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/shipping_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "無料になる直前" do
  calculator = StretchShipping.new

  expect(calculator.calculate(2999)).to eq(500)
end
```

`2 examples, 0 failures` です。

</details>

### 課題3：無料になるちょうどの金額を確かめる

対象：`spec/stretch/shipping_spec.rb`。入力が `3000` のとき、結果が `0` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/shipping_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "無料になるちょうどの金額" do
  calculator = StretchShipping.new

  expect(calculator.calculate(3000)).to eq(0)
end
```

`3 examples, 0 failures` です。

</details>

### 課題4：基準を超える注文を確かめる

対象：`spec/stretch/shipping_spec.rb`。入力が `5000` のとき、結果が `0` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/shipping_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "基準を超える注文" do
  calculator = StretchShipping.new

  expect(calculator.calculate(5000)).to eq(0)
end
```

`4 examples, 0 failures` です。

</details>

### 課題5：テストで不具合を検出する

対象：`app/models/stretch_shipping.rb`。次の部分だけを一時的に変更してください。

変更前：

```ruby
amount >= 3000
```

変更後：

```ruby
amount > 3000
```

> [!IMPORTANT]
> 意図的に不具合を入れる課題です。失敗を確認したあと、この課題内で変更前へ戻します。テストは変更しません。

```bash
bundle exec rspec spec/stretch/shipping_spec.rb
```

`4 examples, 1 failure` を確認し、失敗した入力と、成功した入力を見比べてください。変更前に戻し、同じコマンドで再実行します。

<details>
<summary>解答例・確認</summary>

変更前の式に戻すと `4 examples, 0 failures` です。すべての入力で失敗するとは限りません。通常の入力だけでは見つからない不具合を、境界や同じ値の組み合わせで見つけます。

</details>

---

## 題材2：税込金額と端数

**仕様：** 税率10%で、税込金額は「税抜価格×110÷100」。1円未満は切り捨てます。価格は0以上の整数です。

補足：整数同士の `/` は整数の結果になります。順序を変えて `price / 100 * 110` にすると、途中の切り捨てで結果が変わります。この課題の税率は演習用の仕様です。

### 課題6：最初のテストから実装する

`app/models/stretch_tax.rb` を新規作成し、まずファイル全体を次にします。`nil` は「値がない」ことを表す仮の戻り値です。

```ruby
class StretchTax
  def calculate(price)
    nil
  end
end
```

`spec/stretch/tax_spec.rb` を新規作成し、ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe StretchTax do
  it "端数のない価格" do
    calculator = StretchTax.new

    expect(calculator.calculate(100)).to eq(110)
  end
end
```

> [!IMPORTANT]
> 最初は実装が仮のnilなので、意図的に失敗します。失敗を確認したあと、この課題内で仕様どおりの実装に直します。

```bash
bundle exec rspec spec/stretch/tax_spec.rb
```

`1 example, 1 failure` と `got: nil` を確認します。そのあと `app/models/stretch_tax.rb` の `calculate` の中を仕様どおりに実装し、同じコマンドで再実行してください。

<details>
<summary>解答例・確認</summary>

実装ファイル全体：

```ruby
class StretchTax
  def calculate(price)
    price * 110 / 100
  end
end
```

`1 example, 0 failures` に変わります。テストの期待値をnilに変更してはいけません。

</details>

### 課題7：価格が0円を確かめる

対象：`spec/stretch/tax_spec.rb`。入力が `0` のとき、結果が `0` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/tax_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "価格が0円" do
  calculator = StretchTax.new

  expect(calculator.calculate(0)).to eq(0)
end
```

`2 examples, 0 failures` です。

</details>

### 課題8：端数を切り捨てる価格を確かめる

対象：`spec/stretch/tax_spec.rb`。入力が `99` のとき、結果が `108` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/tax_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "端数を切り捨てる価格" do
  calculator = StretchTax.new

  expect(calculator.calculate(99)).to eq(108)
end
```

`3 examples, 0 failures` です。

</details>

### 課題9：100円を少し超える価格を確かめる

対象：`spec/stretch/tax_spec.rb`。入力が `101` のとき、結果が `111` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/tax_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "100円を少し超える価格" do
  calculator = StretchTax.new

  expect(calculator.calculate(101)).to eq(111)
end
```

`4 examples, 0 failures` です。

</details>

### 課題10：仕様変更にテストと実装を対応させる

**新しい仕様：** 税率を8%に変更します。税込金額は「税抜価格×108÷100」、1円未満切り捨てです。

対象：`spec/stretch/tax_spec.rb`。既存4件の入力は残し、期待値を新しい仕様から計算し直してください。テスト名も新しい確認内容に合うように見直します。さらに入力 `150` → 結果 `162` を確認するテストを1件追加します。

> [!IMPORTANT]
> 先にテストを変更すると、実装は旧仕様のままなので失敗します。失敗を確認してから実装を変更します。

```bash
bundle exec rspec spec/stretch/tax_spec.rb
```

旧仕様の実装では `5 examples, 4 failures` になります。失敗した条件を確認したあと、`app/models/stretch_tax.rb` を新しい仕様へ変更し、同じコマンドを再実行してください。

<details>
<summary>解答例・確認</summary>

テストファイル全体：

```ruby
require "rails_helper"

RSpec.describe StretchTax do
  it "端数のない価格" do
    calculator = StretchTax.new

    expect(calculator.calculate(100)).to eq(108)
  end

  it "価格が0円" do
    calculator = StretchTax.new

    expect(calculator.calculate(0)).to eq(0)
  end

  it "端数を切り捨てる価格" do
    calculator = StretchTax.new

    expect(calculator.calculate(99)).to eq(106)
  end

  it "100円を少し超える価格" do
    calculator = StretchTax.new

    expect(calculator.calculate(101)).to eq(109)
  end

  it "150円の税込金額" do
    calculator = StretchTax.new

    expect(calculator.calculate(150)).to eq(162)
  end
end
```

実装ファイル全体：

```ruby
class StretchTax
  def calculate(price)
    price * 108 / 100
  end
end
```

修正後は `5 examples, 0 failures` です。期待値の変更は、実際の出力に合わせるためではなく、新しい仕様に合わせるために行います。

</details>

---

## 題材3：年齢による入場料金

**仕様：** 12歳未満は600円、12歳以上は1200円。年齢は0以上の整数です。

補足：`age` は年齢です。誕生日の計算は行わず、整数を直接渡します。

### 課題11：最初のテストから実装する

`app/models/stretch_ticket.rb` を新規作成し、まずファイル全体を次にします。`nil` は「値がない」ことを表す仮の戻り値です。

```ruby
class StretchTicket
  def calculate(age)
    nil
  end
end
```

`spec/stretch/ticket_spec.rb` を新規作成し、ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe StretchTicket do
  it "大人の料金" do
    calculator = StretchTicket.new

    expect(calculator.calculate(30)).to eq(1200)
  end
end
```

> [!IMPORTANT]
> 最初は実装が仮のnilなので、意図的に失敗します。失敗を確認したあと、この課題内で仕様どおりの実装に直します。

```bash
bundle exec rspec spec/stretch/ticket_spec.rb
```

`1 example, 1 failure` と `got: nil` を確認します。そのあと `app/models/stretch_ticket.rb` の `calculate` の中を仕様どおりに実装し、同じコマンドで再実行してください。

<details>
<summary>解答例・確認</summary>

実装ファイル全体：

```ruby
class StretchTicket
  def calculate(age)
    if age < 12
      600
    else
      1200
    end
  end
end
```

`1 example, 0 failures` に変わります。テストの期待値をnilに変更してはいけません。

</details>

### 課題12：子ども料金の最後の年齢を確かめる

対象：`spec/stretch/ticket_spec.rb`。入力が `11` のとき、結果が `600` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/ticket_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "子ども料金の最後の年齢" do
  calculator = StretchTicket.new

  expect(calculator.calculate(11)).to eq(600)
end
```

`2 examples, 0 failures` です。

</details>

### 課題13：大人料金になる年齢を確かめる

対象：`spec/stretch/ticket_spec.rb`。入力が `12` のとき、結果が `1200` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/ticket_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "大人料金になる年齢" do
  calculator = StretchTicket.new

  expect(calculator.calculate(12)).to eq(1200)
end
```

`3 examples, 0 failures` です。

</details>

### 課題14：0歳の料金を確かめる

対象：`spec/stretch/ticket_spec.rb`。入力が `0` のとき、結果が `600` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/ticket_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "0歳の料金" do
  calculator = StretchTicket.new

  expect(calculator.calculate(0)).to eq(600)
end
```

`4 examples, 0 failures` です。

</details>

### 課題15：仕様変更にテストと実装を対応させる

**新しい仕様：** 子ども料金を「13歳未満」に変更します。13歳以上は1200円です。

対象：`spec/stretch/ticket_spec.rb`。既存4件の入力は残し、期待値を新しい仕様から計算し直してください。テスト名も新しい確認内容に合うように見直します。さらに入力 `13` → 結果 `1200` を確認するテストを1件追加します。

> [!IMPORTANT]
> 先にテストを変更すると、実装は旧仕様のままなので失敗します。失敗を確認してから実装を変更します。

```bash
bundle exec rspec spec/stretch/ticket_spec.rb
```

旧仕様の実装では `5 examples, 1 failure` になります。失敗した条件を確認したあと、`app/models/stretch_ticket.rb` を新しい仕様へ変更し、同じコマンドを再実行してください。

<details>
<summary>解答例・確認</summary>

テストファイル全体：

```ruby
require "rails_helper"

RSpec.describe StretchTicket do
  it "大人の料金" do
    calculator = StretchTicket.new

    expect(calculator.calculate(30)).to eq(1200)
  end

  it "11歳は引き続き子ども料金" do
    calculator = StretchTicket.new

    expect(calculator.calculate(11)).to eq(600)
  end

  it "12歳も子ども料金になる" do
    calculator = StretchTicket.new

    expect(calculator.calculate(12)).to eq(600)
  end

  it "0歳の料金" do
    calculator = StretchTicket.new

    expect(calculator.calculate(0)).to eq(600)
  end

  it "新しい大人料金の境界" do
    calculator = StretchTicket.new

    expect(calculator.calculate(13)).to eq(1200)
  end
end
```

実装ファイル全体：

```ruby
class StretchTicket
  def calculate(age)
    if age < 13
      600
    else
      1200
    end
  end
end
```

修正後は `5 examples, 0 failures` です。期待値の変更は、実際の出力に合わせるためではなく、新しい仕様に合わせるために行います。

</details>

---

## 題材4：利用時間の切り上げ

**仕様：** 利用時間0分は0円。1〜30分は200円、31〜60分は400円というように、30分単位で切り上げます。時間は0以上の整数です。

補足：正の整数を30分単位で切り上げるには、29を足してから30で整数除算できます。0分でも式が0になることを確かめます。

### 課題16：最初のテストから実装する

`app/models/stretch_parking.rb` を新規作成し、まずファイル全体を次にします。`nil` は「値がない」ことを表す仮の戻り値です。

```ruby
class StretchParking
  def calculate(minutes)
    nil
  end
end
```

`spec/stretch/parking_spec.rb` を新規作成し、ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe StretchParking do
  it "30分ちょうど" do
    calculator = StretchParking.new

    expect(calculator.calculate(30)).to eq(200)
  end
end
```

> [!IMPORTANT]
> 最初は実装が仮のnilなので、意図的に失敗します。失敗を確認したあと、この課題内で仕様どおりの実装に直します。

```bash
bundle exec rspec spec/stretch/parking_spec.rb
```

`1 example, 1 failure` と `got: nil` を確認します。そのあと `app/models/stretch_parking.rb` の `calculate` の中を仕様どおりに実装し、同じコマンドで再実行してください。

<details>
<summary>解答例・確認</summary>

実装ファイル全体：

```ruby
class StretchParking
  def calculate(minutes)
    ((minutes + 29) / 30) * 200
  end
end
```

`1 example, 0 failures` に変わります。テストの期待値をnilに変更してはいけません。

</details>

### 課題17：利用時間0分を確かめる

対象：`spec/stretch/parking_spec.rb`。入力が `0` のとき、結果が `0` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/parking_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "利用時間0分" do
  calculator = StretchParking.new

  expect(calculator.calculate(0)).to eq(0)
end
```

`2 examples, 0 failures` です。

</details>

### 課題18：利用時間1分を確かめる

対象：`spec/stretch/parking_spec.rb`。入力が `1` のとき、結果が `200` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/parking_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "利用時間1分" do
  calculator = StretchParking.new

  expect(calculator.calculate(1)).to eq(200)
end
```

`3 examples, 0 failures` です。

</details>

### 課題19：次の料金になる時間を確かめる

対象：`spec/stretch/parking_spec.rb`。入力が `31` のとき、結果が `400` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/parking_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "次の料金になる時間" do
  calculator = StretchParking.new

  expect(calculator.calculate(31)).to eq(400)
end
```

`4 examples, 0 failures` です。

</details>

### 課題20：テストで不具合を検出する

対象：`app/models/stretch_parking.rb`。次の部分だけを一時的に変更してください。

変更前：

```ruby
((minutes + 29) / 30) * 200
```

変更後：

```ruby
(minutes / 30) * 200
```

> [!IMPORTANT]
> 意図的に不具合を入れる課題です。失敗を確認したあと、この課題内で変更前へ戻します。テストは変更しません。

```bash
bundle exec rspec spec/stretch/parking_spec.rb
```

`4 examples, 2 failures` を確認し、失敗した入力と、成功した入力を見比べてください。変更前に戻し、同じコマンドで再実行します。

<details>
<summary>解答例・確認</summary>

変更前の式に戻すと `4 examples, 0 failures` です。すべての入力で失敗するとは限りません。通常の入力だけでは見つからない不具合を、境界や同じ値の組み合わせで見つけます。

</details>

---

## 題材5：貸出の延滞料金

**仕様：** 貸出日数が7日以内なら0円。8日目から、超過した1日につき50円です。日数は0以上の整数です。

補足：`[金額, 上限].min` は、2つの値のうち小さい方を返します。

### 課題21：最初のテストから実装する

`app/models/stretch_rental.rb` を新規作成し、まずファイル全体を次にします。`nil` は「値がない」ことを表す仮の戻り値です。

```ruby
class StretchRental
  def calculate(days)
    nil
  end
end
```

`spec/stretch/rental_spec.rb` を新規作成し、ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe StretchRental do
  it "3日超過した場合" do
    calculator = StretchRental.new

    expect(calculator.calculate(10)).to eq(150)
  end
end
```

> [!IMPORTANT]
> 最初は実装が仮のnilなので、意図的に失敗します。失敗を確認したあと、この課題内で仕様どおりの実装に直します。

```bash
bundle exec rspec spec/stretch/rental_spec.rb
```

`1 example, 1 failure` と `got: nil` を確認します。そのあと `app/models/stretch_rental.rb` の `calculate` の中を仕様どおりに実装し、同じコマンドで再実行してください。

<details>
<summary>解答例・確認</summary>

実装ファイル全体：

```ruby
class StretchRental
  def calculate(days)
    if days <= 7
      0
    else
      (days - 7) * 50
    end
  end
end
```

`1 example, 0 failures` に変わります。テストの期待値をnilに変更してはいけません。

</details>

### 課題22：無料期間の最後を確かめる

対象：`spec/stretch/rental_spec.rb`。入力が `7` のとき、結果が `0` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/rental_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "無料期間の最後" do
  calculator = StretchRental.new

  expect(calculator.calculate(7)).to eq(0)
end
```

`2 examples, 0 failures` です。

</details>

### 課題23：最初に料金が発生する日を確かめる

対象：`spec/stretch/rental_spec.rb`。入力が `8` のとき、結果が `50` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/rental_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "最初に料金が発生する日" do
  calculator = StretchRental.new

  expect(calculator.calculate(8)).to eq(50)
end
```

`3 examples, 0 failures` です。

</details>

### 課題24：当日返却を確かめる

対象：`spec/stretch/rental_spec.rb`。入力が `0` のとき、結果が `0` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/rental_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "当日返却" do
  calculator = StretchRental.new

  expect(calculator.calculate(0)).to eq(0)
end
```

`4 examples, 0 failures` です。

</details>

### 課題25：仕様変更にテストと実装を対応させる

**新しい仕様：** 延滞料金に上限100円を設けます。7日以内は引き続き無料です。

対象：`spec/stretch/rental_spec.rb`。既存4件の入力は残し、期待値を新しい仕様から計算し直してください。テスト名も新しい確認内容に合うように見直します。さらに入力 `20` → 結果 `100` を確認するテストを1件追加します。

> [!IMPORTANT]
> 先にテストを変更すると、実装は旧仕様のままなので失敗します。失敗を確認してから実装を変更します。

```bash
bundle exec rspec spec/stretch/rental_spec.rb
```

旧仕様の実装では `5 examples, 2 failures` になります。失敗した条件を確認したあと、`app/models/stretch_rental.rb` を新しい仕様へ変更し、同じコマンドを再実行してください。

<details>
<summary>解答例・確認</summary>

テストファイル全体：

```ruby
require "rails_helper"

RSpec.describe StretchRental do
  it "3日超過した場合" do
    calculator = StretchRental.new

    expect(calculator.calculate(10)).to eq(100)
  end

  it "無料期間の最後" do
    calculator = StretchRental.new

    expect(calculator.calculate(7)).to eq(0)
  end

  it "最初に料金が発生する日" do
    calculator = StretchRental.new

    expect(calculator.calculate(8)).to eq(50)
  end

  it "当日返却" do
    calculator = StretchRental.new

    expect(calculator.calculate(0)).to eq(0)
  end

  it "長期間借りた場合" do
    calculator = StretchRental.new

    expect(calculator.calculate(20)).to eq(100)
  end
end
```

実装ファイル全体：

```ruby
class StretchRental
  def calculate(days)
    if days <= 7
      0
    else
      [(days - 7) * 50, 100].min
    end
  end
end
```

修正後は `5 examples, 0 failures` です。期待値の変更は、実際の出力に合わせるためではなく、新しい仕様に合わせるために行います。

</details>

---

## 題材6：表示名の空白処理

**仕様：** 名前の前後の空白を取り除いて返します。取り除いた結果が空文字なら「ゲスト」を返します。この段階の入力は文字列です。

補足：`strip` は文字列の前後の空白を取り除きます。`nil.to_s` は空文字を返します。ここでは半角空白を使い、全角空白の除去は扱いません。

### 課題26：最初のテストから実装する

`app/models/stretch_name.rb` を新規作成し、まずファイル全体を次にします。`nil` は「値がない」ことを表す仮の戻り値です。

```ruby
class StretchName
  def calculate(name)
    nil
  end
end
```

`spec/stretch/name_spec.rb` を新規作成し、ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe StretchName do
  it "通常の表示名" do
    calculator = StretchName.new

    expect(calculator.calculate("山田")).to eq("山田")
  end
end
```

> [!IMPORTANT]
> 最初は実装が仮のnilなので、意図的に失敗します。失敗を確認したあと、この課題内で仕様どおりの実装に直します。

```bash
bundle exec rspec spec/stretch/name_spec.rb
```

`1 example, 1 failure` と `got: nil` を確認します。そのあと `app/models/stretch_name.rb` の `calculate` の中を仕様どおりに実装し、同じコマンドで再実行してください。

<details>
<summary>解答例・確認</summary>

実装ファイル全体：

```ruby
class StretchName
  def calculate(name)
    cleaned = name.strip
    if cleaned == ""
      "ゲスト"
    else
      cleaned
    end
  end
end
```

`1 example, 0 failures` に変わります。テストの期待値をnilに変更してはいけません。

</details>

### 課題27：前後に半角空白がある名前を確かめる

対象：`spec/stretch/name_spec.rb`。入力が `"  山田  "` のとき、結果が `"山田"` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/name_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "前後に半角空白がある名前" do
  calculator = StretchName.new

  expect(calculator.calculate("  山田  ")).to eq("山田")
end
```

`2 examples, 0 failures` です。

</details>

### 課題28：空文字の名前を確かめる

対象：`spec/stretch/name_spec.rb`。入力が `""` のとき、結果が `"ゲスト"` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/name_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "空文字の名前" do
  calculator = StretchName.new

  expect(calculator.calculate("")).to eq("ゲスト")
end
```

`3 examples, 0 failures` です。

</details>

### 課題29：半角空白だけの名前を確かめる

対象：`spec/stretch/name_spec.rb`。入力が `"   "` のとき、結果が `"ゲスト"` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/name_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "半角空白だけの名前" do
  calculator = StretchName.new

  expect(calculator.calculate("   ")).to eq("ゲスト")
end
```

`4 examples, 0 failures` です。

</details>

### 課題30：仕様変更にテストと実装を対応させる

**新しい仕様：** 文字列に加えてnilも受け付け、nilなら「ゲスト」を返す仕様にします。

対象：`spec/stretch/name_spec.rb`。既存4件の入力は残し、期待値を新しい仕様から計算し直してください。テスト名も新しい確認内容に合うように見直します。さらに入力 `nil` → 結果 `"ゲスト"` を確認するテストを1件追加します。

> [!IMPORTANT]
> 先にテストを変更すると、実装は旧仕様のままなので失敗します。失敗を確認してから実装を変更します。

```bash
bundle exec rspec spec/stretch/name_spec.rb
```

旧仕様の実装では `5 examples, 1 failure` になります。失敗した条件を確認したあと、`app/models/stretch_name.rb` を新しい仕様へ変更し、同じコマンドを再実行してください。

<details>
<summary>解答例・確認</summary>

テストファイル全体：

```ruby
require "rails_helper"

RSpec.describe StretchName do
  it "通常の表示名" do
    calculator = StretchName.new

    expect(calculator.calculate("山田")).to eq("山田")
  end

  it "前後に半角空白がある名前" do
    calculator = StretchName.new

    expect(calculator.calculate("  山田  ")).to eq("山田")
  end

  it "空文字の名前" do
    calculator = StretchName.new

    expect(calculator.calculate("")).to eq("ゲスト")
  end

  it "半角空白だけの名前" do
    calculator = StretchName.new

    expect(calculator.calculate("   ")).to eq("ゲスト")
  end

  it "名前が未設定の場合" do
    calculator = StretchName.new

    expect(calculator.calculate(nil)).to eq("ゲスト")
  end
end
```

実装ファイル全体：

```ruby
class StretchName
  def calculate(name)
    cleaned = name.to_s.strip
    if cleaned == ""
      "ゲスト"
    else
      cleaned
    end
  end
end
```

修正後は `5 examples, 0 failures` です。期待値の変更は、実際の出力に合わせるためではなく、新しい仕様に合わせるために行います。

</details>

---

## 題材7：短い紹介文の表示

**仕様：** 8文字以内ならそのまま返します。9文字以上なら先頭8文字に「…」を1文字付けて返します。入力は文字列です。

補足：`text[0, 8]` は、先頭（位置0）から8文字を取り出します。「…」はピリオド3つではなく、三点リーダー1文字です。

### 課題31：最初のテストから実装する

`app/models/stretch_preview.rb` を新規作成し、まずファイル全体を次にします。`nil` は「値がない」ことを表す仮の戻り値です。

```ruby
class StretchPreview
  def calculate(text)
    nil
  end
end
```

`spec/stretch/preview_spec.rb` を新規作成し、ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe StretchPreview do
  it "短い紹介文" do
    calculator = StretchPreview.new

    expect(calculator.calculate("Ruby")).to eq("Ruby")
  end
end
```

> [!IMPORTANT]
> 最初は実装が仮のnilなので、意図的に失敗します。失敗を確認したあと、この課題内で仕様どおりの実装に直します。

```bash
bundle exec rspec spec/stretch/preview_spec.rb
```

`1 example, 1 failure` と `got: nil` を確認します。そのあと `app/models/stretch_preview.rb` の `calculate` の中を仕様どおりに実装し、同じコマンドで再実行してください。

<details>
<summary>解答例・確認</summary>

実装ファイル全体：

```ruby
class StretchPreview
  def calculate(text)
    if text.length <= 8
      text
    else
      "#{text[0, 8]}…"
    end
  end
end
```

`1 example, 0 failures` に変わります。テストの期待値をnilに変更してはいけません。

</details>

### 課題32：省略しない最大の長さを確かめる

対象：`spec/stretch/preview_spec.rb`。入力が `"abcdefgh"` のとき、結果が `"abcdefgh"` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/preview_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "省略しない最大の長さ" do
  calculator = StretchPreview.new

  expect(calculator.calculate("abcdefgh")).to eq("abcdefgh")
end
```

`2 examples, 0 failures` です。

</details>

### 課題33：省略が始まる長さを確かめる

対象：`spec/stretch/preview_spec.rb`。入力が `"abcdefghi"` のとき、結果が `"abcdefgh…"` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/preview_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "省略が始まる長さ" do
  calculator = StretchPreview.new

  expect(calculator.calculate("abcdefghi")).to eq("abcdefgh…")
end
```

`3 examples, 0 failures` です。

</details>

### 課題34：日本語の紹介文を確かめる

対象：`spec/stretch/preview_spec.rb`。入力が `"あいうえおかきくけ"` のとき、結果が `"あいうえおかきく…"` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/preview_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "日本語の紹介文" do
  calculator = StretchPreview.new

  expect(calculator.calculate("あいうえおかきくけ")).to eq("あいうえおかきく…")
end
```

`4 examples, 0 failures` です。

</details>

### 課題35：テストで不具合を検出する

対象：`app/models/stretch_preview.rb`。次の部分だけを一時的に変更してください。

変更前：

```ruby
text[0, 8]
```

変更後：

```ruby
text[0, 7]
```

> [!IMPORTANT]
> 意図的に不具合を入れる課題です。失敗を確認したあと、この課題内で変更前へ戻します。テストは変更しません。

```bash
bundle exec rspec spec/stretch/preview_spec.rb
```

`4 examples, 2 failures` を確認し、失敗した入力と、成功した入力を見比べてください。変更前に戻し、同じコマンドで再実行します。

<details>
<summary>解答例・確認</summary>

変更前の式に戻すと `4 examples, 0 failures` です。すべての入力で失敗するとは限りません。通常の入力だけでは見つからない不具合を、境界や同じ値の組み合わせで見つけます。

</details>

---

## 題材8：在庫に応じた表示

**仕様：** 在庫0個は「在庫なし」、1〜4個は「残りわずか」、5個以上は「在庫あり」です。個数は0以上の整数です。

補足：`elsif` を使うと、3種類以上の条件を順に調べられます。0個の判定を先に行います。

### 課題36：最初のテストから実装する

`app/models/stretch_stock.rb` を新規作成し、まずファイル全体を次にします。`nil` は「値がない」ことを表す仮の戻り値です。

```ruby
class StretchStock
  def calculate(quantity)
    nil
  end
end
```

`spec/stretch/stock_spec.rb` を新規作成し、ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe StretchStock do
  it "通常の在庫" do
    calculator = StretchStock.new

    expect(calculator.calculate(5)).to eq("在庫あり")
  end
end
```

> [!IMPORTANT]
> 最初は実装が仮のnilなので、意図的に失敗します。失敗を確認したあと、この課題内で仕様どおりの実装に直します。

```bash
bundle exec rspec spec/stretch/stock_spec.rb
```

`1 example, 1 failure` と `got: nil` を確認します。そのあと `app/models/stretch_stock.rb` の `calculate` の中を仕様どおりに実装し、同じコマンドで再実行してください。

<details>
<summary>解答例・確認</summary>

実装ファイル全体：

```ruby
class StretchStock
  def calculate(quantity)
    if quantity == 0
      "在庫なし"
    elsif quantity < 5
      "残りわずか"
    else
      "在庫あり"
    end
  end
end
```

`1 example, 0 failures` に変わります。テストの期待値をnilに変更してはいけません。

</details>

### 課題37：在庫がない場合を確かめる

対象：`spec/stretch/stock_spec.rb`。入力が `0` のとき、結果が `"在庫なし"` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/stock_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "在庫がない場合" do
  calculator = StretchStock.new

  expect(calculator.calculate(0)).to eq("在庫なし")
end
```

`2 examples, 0 failures` です。

</details>

### 課題38：最小の販売可能数を確かめる

対象：`spec/stretch/stock_spec.rb`。入力が `1` のとき、結果が `"残りわずか"` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/stock_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "最小の販売可能数" do
  calculator = StretchStock.new

  expect(calculator.calculate(1)).to eq("残りわずか")
end
```

`3 examples, 0 failures` です。

</details>

### 課題39：少量表示の上限を確かめる

対象：`spec/stretch/stock_spec.rb`。入力が `4` のとき、結果が `"残りわずか"` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/stock_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "少量表示の上限" do
  calculator = StretchStock.new

  expect(calculator.calculate(4)).to eq("残りわずか")
end
```

`4 examples, 0 failures` です。

</details>

### 課題40：仕様変更にテストと実装を対応させる

**新しい仕様：** 「残りわずか」を1〜9個へ広げます。0個は「在庫なし」、10個以上は「在庫あり」です。

対象：`spec/stretch/stock_spec.rb`。既存4件の入力は残し、期待値を新しい仕様から計算し直してください。テスト名も新しい確認内容に合うように見直します。さらに入力 `10` → 結果 `"在庫あり"` を確認するテストを1件追加します。

> [!IMPORTANT]
> 先にテストを変更すると、実装は旧仕様のままなので失敗します。失敗を確認してから実装を変更します。

```bash
bundle exec rspec spec/stretch/stock_spec.rb
```

旧仕様の実装では `5 examples, 1 failure` になります。失敗した条件を確認したあと、`app/models/stretch_stock.rb` を新しい仕様へ変更し、同じコマンドを再実行してください。

<details>
<summary>解答例・確認</summary>

テストファイル全体：

```ruby
require "rails_helper"

RSpec.describe StretchStock do
  it "5個は少量表示になる" do
    calculator = StretchStock.new

    expect(calculator.calculate(5)).to eq("残りわずか")
  end

  it "在庫がない場合" do
    calculator = StretchStock.new

    expect(calculator.calculate(0)).to eq("在庫なし")
  end

  it "最小の販売可能数" do
    calculator = StretchStock.new

    expect(calculator.calculate(1)).to eq("残りわずか")
  end

  it "4個も引き続き少量表示になる" do
    calculator = StretchStock.new

    expect(calculator.calculate(4)).to eq("残りわずか")
  end

  it "新しい通常表示の境界" do
    calculator = StretchStock.new

    expect(calculator.calculate(10)).to eq("在庫あり")
  end
end
```

実装ファイル全体：

```ruby
class StretchStock
  def calculate(quantity)
    if quantity == 0
      "在庫なし"
    elsif quantity < 10
      "残りわずか"
    else
      "在庫あり"
    end
  end
end
```

修正後は `5 examples, 0 failures` です。期待値の変更は、実際の出力に合わせるためではなく、新しい仕様に合わせるために行います。

</details>

---

## 題材9：複数商品の合計

**仕様：** 価格の配列の合計を返します。同じ価格の商品も個数分数えます。空の配列なら0円。各価格は0以上の整数です。

補足：`sum` は配列の合計を返します。`uniq` は重複した値を取り除くため、買い物かごの合計には使いません。

### 課題41：最初のテストから実装する

`app/models/stretch_basket.rb` を新規作成し、まずファイル全体を次にします。`nil` は「値がない」ことを表す仮の戻り値です。

```ruby
class StretchBasket
  def calculate(prices)
    nil
  end
end
```

`spec/stretch/basket_spec.rb` を新規作成し、ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe StretchBasket do
  it "異なる価格の商品" do
    calculator = StretchBasket.new

    expect(calculator.calculate([100, 200])).to eq(300)
  end
end
```

> [!IMPORTANT]
> 最初は実装が仮のnilなので、意図的に失敗します。失敗を確認したあと、この課題内で仕様どおりの実装に直します。

```bash
bundle exec rspec spec/stretch/basket_spec.rb
```

`1 example, 1 failure` と `got: nil` を確認します。そのあと `app/models/stretch_basket.rb` の `calculate` の中を仕様どおりに実装し、同じコマンドで再実行してください。

<details>
<summary>解答例・確認</summary>

実装ファイル全体：

```ruby
class StretchBasket
  def calculate(prices)
    prices.sum
  end
end
```

`1 example, 0 failures` に変わります。テストの期待値をnilに変更してはいけません。

</details>

### 課題42：空の買い物かごを確かめる

対象：`spec/stretch/basket_spec.rb`。入力が `[]` のとき、結果が `0` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/basket_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "空の買い物かご" do
  calculator = StretchBasket.new

  expect(calculator.calculate([])).to eq(0)
end
```

`2 examples, 0 failures` です。

</details>

### 課題43：同じ価格の商品が2つを確かめる

対象：`spec/stretch/basket_spec.rb`。入力が `[100, 100]` のとき、結果が `200` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/basket_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "同じ価格の商品が2つ" do
  calculator = StretchBasket.new

  expect(calculator.calculate([100, 100])).to eq(200)
end
```

`3 examples, 0 failures` です。

</details>

### 課題44：無料の商品を含む場合を確かめる

対象：`spec/stretch/basket_spec.rb`。入力が `[0, 200]` のとき、結果が `200` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/basket_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "無料の商品を含む場合" do
  calculator = StretchBasket.new

  expect(calculator.calculate([0, 200])).to eq(200)
end
```

`4 examples, 0 failures` です。

</details>

### 課題45：テストで不具合を検出する

対象：`app/models/stretch_basket.rb`。次の部分だけを一時的に変更してください。

変更前：

```ruby
prices.sum
```

変更後：

```ruby
prices.uniq.sum
```

> [!IMPORTANT]
> 意図的に不具合を入れる課題です。失敗を確認したあと、この課題内で変更前へ戻します。テストは変更しません。

```bash
bundle exec rspec spec/stretch/basket_spec.rb
```

`4 examples, 1 failure` を確認し、失敗した入力と、成功した入力を見比べてください。変更前に戻し、同じコマンドで再実行します。

<details>
<summary>解答例・確認</summary>

変更前の式に戻すと `4 examples, 0 failures` です。すべての入力で失敗するとは限りません。通常の入力だけでは見つからない不具合を、境界や同じ値の組み合わせで見つけます。

</details>

---

## 題材10：クーポン利用後の支払額

**仕様：** 合計から値引き額を引いて返します。値引きが合計以上なら0円とし、負の支払額にはしません。どちらも0以上の整数です。

補足：`[値, 0].max` は0と比べて大きい方を返します。引数が2つあるメソッドは `calculate(1000, 200)` のように呼びます。

### 課題46：最初のテストから実装する

`app/models/stretch_coupon.rb` を新規作成し、まずファイル全体を次にします。`nil` は「値がない」ことを表す仮の戻り値です。

```ruby
class StretchCoupon
  def calculate(total, discount)
    nil
  end
end
```

`spec/stretch/coupon_spec.rb` を新規作成し、ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe StretchCoupon do
  it "通常の値引き" do
    calculator = StretchCoupon.new

    expect(calculator.calculate(1000, 200)).to eq(800)
  end
end
```

> [!IMPORTANT]
> 最初は実装が仮のnilなので、意図的に失敗します。失敗を確認したあと、この課題内で仕様どおりの実装に直します。

```bash
bundle exec rspec spec/stretch/coupon_spec.rb
```

`1 example, 1 failure` と `got: nil` を確認します。そのあと `app/models/stretch_coupon.rb` の `calculate` の中を仕様どおりに実装し、同じコマンドで再実行してください。

<details>
<summary>解答例・確認</summary>

実装ファイル全体：

```ruby
class StretchCoupon
  def calculate(total, discount)
    [total - discount, 0].max
  end
end
```

`1 example, 0 failures` に変わります。テストの期待値をnilに変更してはいけません。

</details>

### 課題47：値引きがない場合を確かめる

対象：`spec/stretch/coupon_spec.rb`。入力が `1000, 0` のとき、結果が `1000` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/coupon_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "値引きがない場合" do
  calculator = StretchCoupon.new

  expect(calculator.calculate(1000, 0)).to eq(1000)
end
```

`2 examples, 0 failures` です。

</details>

### 課題48：合計と同額の値引きを確かめる

対象：`spec/stretch/coupon_spec.rb`。入力が `1000, 1000` のとき、結果が `0` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/coupon_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "合計と同額の値引き" do
  calculator = StretchCoupon.new

  expect(calculator.calculate(1000, 1000)).to eq(0)
end
```

`3 examples, 0 failures` です。

</details>

### 課題49：合計を超える値引きを確かめる

対象：`spec/stretch/coupon_spec.rb`。入力が `1000, 1200` のとき、結果が `0` になるテストを1件追加してください。題材の仕様のどの条件に当たるかを確認してから書きます。

```bash
bundle exec rspec spec/stretch/coupon_spec.rb
```

<details>
<summary>解答例・確認</summary>

追加するテスト：

```ruby
it "合計を超える値引き" do
  calculator = StretchCoupon.new

  expect(calculator.calculate(1000, 1200)).to eq(0)
end
```

`4 examples, 0 failures` です。

</details>

### 課題50：仕様変更にテストと実装を対応させる

**新しい仕様：** 使える値引き額を最大500円に変更します。変更後も支払額の下限は0円です。

対象：`spec/stretch/coupon_spec.rb`。既存4件の入力は残し、期待値を新しい仕様から計算し直してください。テスト名も新しい確認内容に合うように見直します。さらに入力 `300, 800` → 結果 `0` を確認するテストを1件追加します。

> [!IMPORTANT]
> 先にテストを変更すると、実装は旧仕様のままなので失敗します。失敗を確認してから実装を変更します。

```bash
bundle exec rspec spec/stretch/coupon_spec.rb
```

旧仕様の実装では `5 examples, 2 failures` になります。失敗した条件を確認したあと、`app/models/stretch_coupon.rb` を新しい仕様へ変更し、同じコマンドを再実行してください。

<details>
<summary>解答例・確認</summary>

テストファイル全体：

```ruby
require "rails_helper"

RSpec.describe StretchCoupon do
  it "通常の値引き" do
    calculator = StretchCoupon.new

    expect(calculator.calculate(1000, 200)).to eq(800)
  end

  it "値引きがない場合" do
    calculator = StretchCoupon.new

    expect(calculator.calculate(1000, 0)).to eq(1000)
  end

  it "合計と同額の値引き" do
    calculator = StretchCoupon.new

    expect(calculator.calculate(1000, 1000)).to eq(500)
  end

  it "合計を超える値引き" do
    calculator = StretchCoupon.new

    expect(calculator.calculate(1000, 1200)).to eq(500)
  end

  it "値引き上限より少額の買い物" do
    calculator = StretchCoupon.new

    expect(calculator.calculate(300, 800)).to eq(0)
  end
end
```

実装ファイル全体：

```ruby
class StretchCoupon
  def calculate(total, discount)
    usable_discount = [discount, 500].min
    [total - usable_discount, 0].max
  end
end
```

修正後は `5 examples, 0 failures` です。期待値の変更は、実際の出力に合わせるためではなく、新しい仕様に合わせるために行います。

</details>

---

## 最後にまとめて確認する

まずStretchだけを実行します。

```bash
bundle exec rspec spec/stretch --format documentation
```

全50問を終えた場合は、`46 examples, 0 failures` です。4件の題材が4つ、5件の題材が6つあります。

続けてPracticeも含めて実行します。

```bash
bundle exec rspec
```

Practiceの17件と合わせて `63 examples, 0 failures` を確認します。自分で追加したテストがある場合は、その分だけ件数が増えます。件数が少ない場合は、保存し忘れ・追加し忘れ・ファイル名を確認してください。

## 学習の記録（考察問題・実行しない）

> [!IMPORTANT]
> ここではアプリやテストのコードを変更したり、コマンドを実行したりしません。
> アプリ直下に `stretch16_report.md` を作り、次の答えを書いて保存してください。

- 最後の全件実行の結果を貼る。
- 課題5の不具合を見つけた入力と、見つけられなかった入力を1つずつ書く。
- 課題30でnilのテストを追加した理由を書く。
- 「不具合を直す課題」と「仕様変更の課題」で、期待値を変更するかどうかの違いを書く。
- 検索や生成AIで調べた書き方と、実際に確かめた入力・結果を書く。

提出・バックアップ・Codespaceの再開は[Practiceの「作業を終える前に」](practice.md#作業を終える前に)と同じ手順です。第17週に向けてアプリを残してください。

参考：[RubyのString](https://docs.ruby-lang.org/en/3.2/String.html)・[RubyのArray](https://docs.ruby-lang.org/en/3.2/Array.html)

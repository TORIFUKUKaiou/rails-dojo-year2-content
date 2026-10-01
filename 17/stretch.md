# 第17週：Stretch ── 更新・削除と別の入力ルールをテストする

[Practice](practice.md)で作ったアプリに、記事の更新・削除のrequest specを追加します。後半では、商品の価格・在庫数の入力ルールを別のクラスで確かめます。全30課題を順に進めてください。

## 準備：第17週のPracticeの続きから始める

第17週のPracticeで使ったCodespaceを開き、**File → Open Folder...** で `/home/vscode/rspec_starter` を開きます。新しいアプリやCodespaceを作らず、Practiceで追加したファイルを残します。

```bash
cd /home/vscode/rspec_starter
pwd
bundle exec rspec
```

作業場所が `/home/vscode/rspec_starter`、結果が `24 examples, 0 failures` であることを確認します。Stretchを途中まで進めている場合は、その分だけ件数が増えます。Practiceのアプリがない場合はバックアップを戻すか、Practiceから取り組んでください。既存のファイルを削除して作り直さないでください。

`app/models/article.rb` はPractice終了時の次の状態です。確認用の表示であり、変更は不要です。

```ruby
class Article < ApplicationRecord
  validates :title, presence: true, length: { maximum: 20 }
  validates :body, presence: true
end
```

## 進め方と今回の新しい記法

- ファイルパスはすべて `/home/vscode/rspec_starter` からの相対パスです。
- 自分で書いて実行してから解答例を開き、入力・期待値・実行結果を比べます。
- 「追加」とある `it ... end` は、対象ファイルの外側の `RSpec.describe ... do` と最後の `end` の間へ入れます。既存の `it` の中には入れません。
- 同じテストへ確認を追加する課題では、既存の `it` を増やしません。ファイルを保存してから実行します。
- 各 `it` の中で使う記事を準備します。別の `it` やブラウザで作った記事に依存させません。
- Practiceのテストは残します。意図的に実装を壊す課題では、指定箇所だけを変え、必ず元へ戻します。

> [!NOTE]
> このStretchには、Orientationで扱っていない `create!`・`reload`・`patch`・`delete`・`exists?`・`follow_redirect!`・Active Model・数値のバリデーションが含まれます。
> 補足を読み、分からない書き方は末尾の公式ドキュメントを検索したり、生成AIへ具体的な入力と期待結果を示して相談したりしてください。得られたコードは自分のテストで確認します。

| 記法 | 役割 |
|---|---|
| `Article.create!(...)` | テストの準備として記事をDBへ保存する。無効なら例外が出るため、準備の誤りに気付ける |
| `article_path(article)` | その記事の詳細パス。例：`/articles/3`。IDを固定で書かない |
| `edit_article_path(article)` | その記事の編集フォームのパス |
| `patch article_path(article), params: ...` | 指定した記事の更新リクエストを送る |
| `article.reload` | DBの値を同じオブジェクトへ読み直す。リクエスト前に作ったオブジェクトは自動で更新されない |
| `delete article_path(article)` | 指定した記事の削除リクエストを送る |
| `Article.exists?(article.id)` | 指定したIDの記事がDBに残っていれば `true`、なければ `false` |
| `follow_redirect!` | リダイレクト先へ次のリクエストを送り、`response` を移動先の応答に更新する |

このスターターのHTML応答は、登録成功が302、更新・削除成功が303です。303も移動先を知らせる応答で、次はGETで取得するよう伝えます。無効な更新は422で編集フォームを返します。

RSpecだけならサーバーは不要です。Practiceでサーバーを止めた状態のまま課題21まで進めます。起動中ならサーバー用ターミナルで **Ctrl+C** を押して止めてください。テストで作る記事はテスト用DBに入り、各テスト終了時に戻されます。

---

## 課題1：保存済み記事の詳細を取得する

`spec/requests/articles_update_spec.rb` を新規作成します。次のファイル全体を参考に、各 `it` 内で記事を準備して詳細の応答と保存内容を確認してください。

```ruby
require "rails_helper"

RSpec.describe "記事の更新", type: :request do
  it "保存した記事の詳細を取得できる" do
    article = Article.create!(title: "詳細の確認", body: "詳細に表示する本文")

    get article_path(article)

    expect(response).to have_http_status(200)
    expect(response.body).to include(article.title)
    expect(response.body).to include(article.body)
  end
end
```

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`1 example, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

GETの前に保存した記事を用意しているので、表示対象のIDが存在します。単に `Article.new` だけではDBに記事がないため、詳細を取得できません。

</details>

---

## 課題2：編集フォームの初期値を確認する

対象：`spec/requests/articles_update_spec.rb`。タイトル `編集前のタイトル`、本文 `編集前の本文` の記事を保存します。編集フォームを取得し、200・見出し・タイトルの入力欄の値・本文を確認する `it` を追加してください。

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`2 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "編集フォームに保存済みの値が入っている" do
  article = Article.create!(title: "編集前のタイトル", body: "編集前の本文")

  get edit_article_path(article)

  expect(response).to have_http_status(200)
  expect(response.body).to include("Editing article")
  expect(response.body).to include('value="編集前のタイトル"')
  expect(response.body).to include("編集前の本文")
end
```

この入力には引用符やHTMLの特殊文字を含めていないため、タイトルの `value` 属性を文字列で確認しています。画面上の操作や見た目は別に確認します。

</details>

---

## 課題3：更新では記事数が増えないことを確認する

対象：`spec/requests/articles_update_spec.rb`。次の `it` を追加します。

```ruby
it "タイトルと本文を更新する" do
  article = Article.create!(title: "更新前", body: "更新前の本文")
  count_before = Article.count

  patch article_path(article), params: {
    article: { title: "更新後", body: "更新後の本文" }
  }

  expect(Article.count).to eq(count_before)
end
```

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`3 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

登録とは違い、既存の記事を書き換えるので記事数は変わりません。この段階では内容が変わったことまでは確認できていません。

</details>

---

## 課題4：更新内容をDBから読み直す

対象：`spec/requests/articles_update_spec.rb`。課題3の同じ `it` で、記事数の確認の後に次を追加します。

```ruby
article.reload
expect(article.title).to eq("更新後")
expect(article.body).to eq("更新後の本文")
```

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`3 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

`article` はリクエスト前に作ったオブジェクトです。`reload` を使って、controllerがDBへ保存した値を読み直してから比べます。

</details>

---

## 課題5：更新成功の応答と移動先を確認する

対象：`spec/requests/articles_update_spec.rb`。同じ更新の `it` に次を追記します。

```ruby
expect(response).to have_http_status(303)
expect(response).to redirect_to(article_path(article))
```

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`3 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

このアプリのupdateアクションのHTML側は `status: :see_other` を指定しており、303を返します。Practiceの登録成功の302をそのまま写さないようにします。

</details>

---

## 課題6：移動した詳細画面も取得する

対象：`spec/requests/articles_update_spec.rb`。更新の応答・移動先を確認した後、同じ `it` に次を追加します。

```ruby
follow_redirect!
expect(response).to have_http_status(200)
expect(response.body).to include("更新後")
expect(response.body).to include("更新後の本文")
```

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`3 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

更新の `it` 全体：

```ruby
it "タイトルと本文を更新する" do
  article = Article.create!(title: "更新前", body: "更新前の本文")
  count_before = Article.count

  patch article_path(article), params: {
    article: { title: "更新後", body: "更新後の本文" }
  }

  expect(Article.count).to eq(count_before)
  article.reload
  expect(article.title).to eq("更新後")
  expect(article.body).to eq("更新後の本文")
  expect(response).to have_http_status(303)
  expect(response).to redirect_to(article_path(article))

  follow_redirect!
  expect(response).to have_http_status(200)
  expect(response.body).to include("更新後")
  expect(response.body).to include("更新後の本文")
end
```

`follow_redirect!` の後の `response` は詳細画面の応答です。更新直後の303は、その前に確認します。

</details>

---

## 課題7：別の記事が変わらないことを確認する

対象：`spec/requests/articles_update_spec.rb`。同じ `it` の中で「対象の記事／対象の本文」と「別の記事／別の本文」を保存し、最初の記事だけを「変更した記事／変更した本文」へ更新します。記事数が変わらず、対象だけが変わり、もう一方の両項目は残るテストを追加してください。

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`4 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "更新対象ではない記事は変わらない" do
  article = Article.create!(title: "対象の記事", body: "対象の本文")
  other_article = Article.create!(title: "別の記事", body: "別の本文")
  count_before = Article.count

  patch article_path(article), params: {
    article: { title: "変更した記事", body: "変更した本文" }
  }

  expect(Article.count).to eq(count_before)
  article.reload
  other_article.reload
  expect(article.title).to eq("変更した記事")
  expect(article.body).to eq("変更した本文")
  expect(other_article.title).to eq("別の記事")
  expect(other_article.body).to eq("別の本文")
end
```

</details>

---

## 課題8：無効な更新で保存済みの値を守る

対象：`spec/requests/articles_update_spec.rb`。「保存済みのタイトル／保存済みの本文」を保存し、タイトル `""`・本文 `"変更した本文"` を送ります。記事数が変わらないこと、422とエラー付き編集フォーム、DBのタイトル・本文が両方とも元のままであることを確認するテストを追加してください。

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`5 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "タイトル空欄の更新は保存済みの値を変えない" do
  article = Article.create!(title: "保存済みのタイトル", body: "保存済みの本文")
  count_before = Article.count

  patch article_path(article), params: {
    article: { title: "", body: "変更した本文" }
  }

  expect(Article.count).to eq(count_before)
  expect(response).to have_http_status(422)
  expect(response.body).to include("Editing article")
  expect(response.body).to include("prohibited this article from being saved")
  article.reload
  expect(article.title).to eq("保存済みのタイトル")
  expect(article.body).to eq("保存済みの本文")
end
```

エラーのフォームには入力途中の値が出ることがあります。保存済みの値は `reload` でDBから確認します。

</details>

---

## 課題9：本文が空欄でも両方の保存値を残す

対象：`spec/requests/articles_update_spec.rb`。課題8と同じ値（「保存済みのタイトル／保存済みの本文」）の記事を、この `it` でも保存してから、タイトル `"変更したタイトル"`・本文 `""` を送ります。422・編集フォーム・エラー、記事数と保存済みの両項目が変わらないことを確認する `it` を追加します。

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`6 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "本文空欄の更新は保存済みの値を変えない" do
  article = Article.create!(title: "保存済みのタイトル", body: "保存済みの本文")
  count_before = Article.count

  patch article_path(article), params: {
    article: { title: "変更したタイトル", body: "" }
  }

  expect(Article.count).to eq(count_before)
  expect(response).to have_http_status(422)
  expect(response.body).to include("Editing article")
  expect(response.body).to include("prohibited this article from being saved")
  article.reload
  expect(article.title).to eq("保存済みのタイトル")
  expect(article.body).to eq("保存済みの本文")
end
```

</details>

---

## 課題10：更新でも上限ちょうどを受け付ける

対象：`spec/requests/articles_update_spec.rb`。「更新前／更新前の本文」を保存し、タイトル `"あ" * 20`・本文 `"境界を確認する本文"` へ更新する `it` を追加します。記事数不変、303と詳細への移動先、保存された両項目を確認してください。

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`7 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "20文字のタイトルへ更新できる" do
  article = Article.create!(title: "更新前", body: "更新前の本文")
  count_before = Article.count

  patch article_path(article), params: {
    article: { title: "あ" * 20, body: "境界を確認する本文" }
  }

  expect(Article.count).to eq(count_before)
  expect(response).to have_http_status(303)
  expect(response).to redirect_to(article_path(article))
  article.reload
  expect(article.title).to eq("あ" * 20)
  expect(article.body).to eq("境界を確認する本文")
end
```

</details>

---

## 課題11：更新で上限を超えたら元の内容を残す

対象：`spec/requests/articles_update_spec.rb`。「保存済みのタイトル／保存済みの本文」を保存し、タイトル `"あ" * 21`・本文 `"変更した本文"` を送ります。422・エラー付き編集フォーム、記事数と保存済みの両項目が変わらないテストを追加してください。

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`8 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "21文字のタイトルへの更新は保存しない" do
  article = Article.create!(title: "保存済みのタイトル", body: "保存済みの本文")
  count_before = Article.count

  patch article_path(article), params: {
    article: { title: "あ" * 21, body: "変更した本文" }
  }

  expect(Article.count).to eq(count_before)
  expect(response).to have_http_status(422)
  expect(response.body).to include("Editing article")
  expect(response.body).to include("prohibited this article from being saved")
  article.reload
  expect(article.title).to eq("保存済みのタイトル")
  expect(article.body).to eq("保存済みの本文")
end
```

</details>

---

## 課題12：送らなかった項目が保持されることを確認する

対象：`spec/requests/articles_update_spec.rb`。「残すタイトル／変更前の本文」を保存し、`article: { body: "本文だけ変更しました" }` だけを送ります。記事数不変、303と移動先、タイトルは元のまま・本文だけ変更されることを確認する `it` を追加します。

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`9 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "本文だけを送った更新ではタイトルを残す" do
  article = Article.create!(title: "残すタイトル", body: "変更前の本文")
  count_before = Article.count

  patch article_path(article), params: {
    article: { body: "本文だけ変更しました" }
  }

  expect(Article.count).to eq(count_before)
  expect(response).to have_http_status(303)
  expect(response).to redirect_to(article_path(article))
  article.reload
  expect(article.title).to eq("残すタイトル")
  expect(article.body).to eq("本文だけ変更しました")
end
```

タイトルを送らないことと、タイトルに空文字を送ることは異なります。今回は既存の記事へ指定された項目だけを反映する動作を確認しています。ブラウザの通常の編集フォームは両項目を送ります。

</details>

---

## 課題13：本文を更新しない不具合を見つける

対象：`app/controllers/articles_controller.rb` のupdateアクション内の条件行だけを変更します。

変更前：

```ruby
if @article.update(article_params)
```

変更後：

```ruby
if @article.update(article_params.except(:body))
```

`except(:body)` は本文の項目を取り除きます。

> [!IMPORTANT]
> テストの期待値は変更しません。本文を更新しない不具合を入れます。
> 意図的な失敗を確認する課題です。指定箇所を戻し、成功を確認してから次へ進みます。

```bash
bundle exec rspec spec/requests/articles_update_spec.rb --example "タイトルと本文を更新する"
```

`1 example, 1 failure` を確認します。

`--example` はテスト名で絞り込む指定です。本文の実際の値が `更新前の本文` のままであることを確認し、条件行を戻します。

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`9 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

記事数だけなら変化がなく、タイトルだけなら更新されているので不具合を見逃します。DBから読み直した本文の確認で検出できます。

</details>

---

## 課題14：更新失敗の応答も仕様で確認する

対象：`app/controllers/articles_controller.rb` の **updateアクションのelse側のHTML行**だけを変更します。create側とJSON側は触りません。

変更前：

```ruby
format.html { render :edit, status: :unprocessable_content }
```

変更後：

```ruby
format.html { render :edit, status: :ok }
```

> [!IMPORTANT]
> 無効な更新で200を返す不具合です。期待する422は変えません。
> 意図的な失敗を確認する課題です。指定箇所を戻し、成功を確認してから次へ進みます。

```bash
bundle exec rspec spec/requests/articles_update_spec.rb --example "タイトル空欄の更新は保存済みの値を変えない"
```

`1 example, 1 failure` を確認します。

422と200の違いを読み、HTMLの行を変更前へ戻します。

```bash
bundle exec rspec spec/requests/articles_update_spec.rb
```

`9 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

保存済みの値が守られることに加えて、リクエストを受け付けられなかったことを正しい応答で知らせる必要があります。

</details>

---

## 課題15：削除で記事数が減ることを確認する

`spec/requests/articles_destroy_spec.rb` を新規作成し、ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe "記事の削除", type: :request do
  it "指定した記事を削除する" do
    article = Article.create!(title: "削除対象", body: "削除する本文")
    count_before = Article.count

    delete article_path(article)

    expect(Article.count).to eq(count_before - 1)
  end
end
```

```bash
bundle exec rspec spec/requests/articles_destroy_spec.rb
```

`1 example, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

`delete` の引数へ記事自身のパスを渡します。どの記事が消えたかは次の課題で確認します。

</details>

---

## 課題16：指定したIDの記事が消えたことを確認する

対象：`spec/requests/articles_destroy_spec.rb`。同じ `it` の記事数の確認の後に追記します。

```ruby
expect(Article.exists?(article.id)).to eq(false)
```

```bash
bundle exec rspec spec/requests/articles_destroy_spec.rb
```

`1 example, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

記事数が1件減るだけでは、違う記事を削除した不具合を見逃します。削除対象のIDがDBにないことも確認します。削除後の `article.reload` は記事がないため使いません。

</details>

---

## 課題17：削除後の移動先と一覧を確認する

対象：`spec/requests/articles_destroy_spec.rb`。同じ `it` に、303・一覧への移動先を確認する処理を追加します。その後 `follow_redirect!` で一覧を取得し、200・`Articles` の見出し・削除した本文が含まれないことを確認します。

```bash
bundle exec rspec spec/requests/articles_destroy_spec.rb
```

`1 example, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

完成した削除の `it`：

```ruby
it "指定した記事を削除する" do
  article = Article.create!(title: "削除対象", body: "削除する本文")
  count_before = Article.count

  delete article_path(article)

  expect(Article.count).to eq(count_before - 1)
  expect(Article.exists?(article.id)).to eq(false)
  expect(response).to have_http_status(303)
  expect(response).to redirect_to(articles_path)

  follow_redirect!
  expect(response).to have_http_status(200)
  expect(response.body).to include("Articles")
  expect(response.body).not_to include("削除する本文")
end
```

</details>

---

## 課題18：別の記事が残ることを確認する

対象：`spec/requests/articles_destroy_spec.rb`。同じ `it` で「削除する記事／削除する本文」と「残す記事／残す本文」を保存し、最初の記事だけを削除します。記事数が1件減り、対象が消え、残す記事の存在・両項目が変わらないことを確認してください。

```bash
bundle exec rspec spec/requests/articles_destroy_spec.rb
```

`2 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "指定していない記事は削除しない" do
  article = Article.create!(title: "削除する記事", body: "削除する本文")
  other_article = Article.create!(title: "残す記事", body: "残す本文")
  count_before = Article.count

  delete article_path(article)

  expect(Article.count).to eq(count_before - 1)
  expect(Article.exists?(article.id)).to eq(false)
  expect(Article.exists?(other_article.id)).to eq(true)
  other_article.reload
  expect(other_article.title).to eq("残す記事")
  expect(other_article.body).to eq("残す本文")
end
```

</details>

---

## 課題19：最新の記事を誤って削除していないか確認する

対象：`spec/requests/articles_destroy_spec.rb`。「古い記事／先に保存した本文」、次に「新しい記事／後に保存した本文」を同じ `it` で保存します。古い記事のパスへDELETEを送り、1件減少・古い記事の消失・新しい記事と本文の保持を確認するテストを追加します。IDの値や連番であることは決め付けません。

```bash
bundle exec rspec spec/requests/articles_destroy_spec.rb
```

`3 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "古い記事を指定したら新しい記事を残す" do
  old_article = Article.create!(title: "古い記事", body: "先に保存した本文")
  new_article = Article.create!(title: "新しい記事", body: "後に保存した本文")
  count_before = Article.count

  delete article_path(old_article)

  expect(Article.count).to eq(count_before - 1)
  expect(Article.exists?(old_article.id)).to eq(false)
  expect(Article.exists?(new_article.id)).to eq(true)
  expect(new_article.reload.body).to eq("後に保存した本文")
end
```

</details>

---

## 課題20：別の記事を削除する不具合を見つける

対象：`app/controllers/articles_controller.rb` のdestroyアクション内の1行だけを変更します。

変更前：

```ruby
@article.destroy!
```

変更後：

```ruby
Article.last.destroy!
```

> [!IMPORTANT]
> パスで指定された記事の代わりに、最後の記事を削除する不具合です。
> 意図的な失敗を確認する課題です。指定箇所を戻し、成功を確認してから次へ進みます。

```bash
bundle exec rspec spec/requests/articles_destroy_spec.rb --example "古い記事を指定したら新しい記事を残す"
```

`1 example, 1 failure` を確認します。

記事数の確認だけでは成功することと、古い記事が残っていることを読み取ります。変更前へ戻します。

```bash
bundle exec rspec spec/requests/articles_destroy_spec.rb
```

`3 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

削除対象のIDが消えたかを確認したため、別の記事を削除した不具合を検出できます。残す側の確認も、意図したデータを守るための確認です。

</details>

---

## 課題21：登録・更新・削除を一つの流れで確かめる

`spec/requests/articles_flow_spec.rb` を新規作成します。1件の `it` で次を順に確認してください。

1. 「登録した記事／最初の本文」をPOSTで登録し、1件増加・保存内容・302と移動先を確認する。移動先の詳細が200で本文を含むことも確認する。
2. 同じIDを「更新した記事／更新した本文」へPATCHで更新する。記事数は登録後のまま、両項目と303・移動先を確認し、移動先の本文も確認する。
3. 同じIDをDELETEで削除する。記事数が登録前へ戻り、そのIDが消えること、303・一覧への移動先、一覧が200で更新した本文を含まないことを確認する。

```bash
bundle exec rspec spec/requests/articles_flow_spec.rb
```

`1 example, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

ファイル全体：

```ruby
require "rails_helper"

RSpec.describe "記事の一連の操作", type: :request do
  it "登録した記事を更新してから削除できる" do
    count_before = Article.count

    post articles_path, params: {
      article: { title: "登録した記事", body: "最初の本文" }
    }

    expect(Article.count).to eq(count_before + 1)
    article = Article.last
    expect(article.title).to eq("登録した記事")
    expect(article.body).to eq("最初の本文")
    expect(response).to have_http_status(302)
    expect(response).to redirect_to(article_path(article))
    follow_redirect!
    expect(response).to have_http_status(200)
    expect(response.body).to include("最初の本文")

    patch article_path(article), params: {
      article: { title: "更新した記事", body: "更新した本文" }
    }

    expect(Article.count).to eq(count_before + 1)
    expect(response).to have_http_status(303)
    expect(response).to redirect_to(article_path(article))
    article.reload
    expect(article.title).to eq("更新した記事")
    expect(article.body).to eq("更新した本文")
    follow_redirect!
    expect(response).to have_http_status(200)
    expect(response.body).to include("更新した本文")

    delete article_path(article)

    expect(Article.count).to eq(count_before)
    expect(Article.exists?(article.id)).to eq(false)
    expect(response).to have_http_status(303)
    expect(response).to redirect_to(articles_path)
    follow_redirect!
    expect(response).to have_http_status(200)
    expect(response.body).not_to include("更新した本文")
  end
end
```

この `it` 内の流れでは、前のリクエストの結果を次で使います。別の `it` へ実行順の依存を持ち込むこととは違います。

</details>

---

## 課題22：既存の登録テストと画面でも確認する

```bash
bundle exec rspec --format documentation
```

`37 examples, 0 failures` を確認します。

内訳はPractice24件・更新9件・削除3件・一連の操作1件です。実装を壊した課題の変更が残っていないことを確認してから、サーバー用ターミナルを新しく開きます。

```bash
cd /home/vscode/rspec_starter
bin/rails server -b 0.0.0.0
```

`Listening on http://0.0.0.0:3000` を確認し、サーバーを起動したまま、Portsのポート3000から **Open in Browser** で開きます。URLの末尾を `/articles` にしてください。

| 操作 | 確認 |
|---|---|
| 2件登録 | 「対象の記事／対象の本文」と「残す記事／残す本文」を作る |
| 対象の記事を編集 | Titleを `更新後の記事`、Bodyを `更新後の本文` にする。保存後に両方が表示され、もう一方は変わらない |
| 対象の記事を再び編集 | Titleを空欄、Bodyを `保存しない本文` にする。更新時にエラーが出る |
| Back to articles → 対象の詳細 | 保存済みの値は「更新後の記事／更新後の本文」のままである |
| 対象だけDestroy this article | 対象が一覧から消え、「残す記事／残す本文」が残る |
| 残す記事も削除 | この課題で作った2件が一覧から消える |

サーバー用ターミナルで **Ctrl+C** を押して停止します。課題23以降は元のコマンド用ターミナルへ戻ります。

<details>
<summary>解答例・確認</summary>

RSpecの成功と、ブラウザでの入力・エラー表示・対象だけの更新と削除を比べます。request specはJavaScriptや画面の見た目を確認していません。

</details>

---

## ここから別題材：商品の価格と在庫数

DBへ保存する前の入力判定を、`StretchProduct` というRubyのクラスで練習します。商品画面・controller・テーブルは作りません。Articleの入力ルールは変更しません。

**最初の仕様：価格は0以上の整数、在庫数は0以上の整数。どちらも未入力は認めません。** 価格は円単位です。文字列の `"100"`・`"3"` のような整数の入力も認めますが、`"abc"` は認めません。

- `include ActiveModel::Model`：DBのテーブルを持たないクラスでも、属性の初期化や入力ルールの判定を使えるようにする。
- `attr_accessor :price, :stock`：価格・在庫数の値を読み書きできるようにする。このクラスでは値の型を自動変換しない。
- `numericality`：数値のルール。`only_integer: true` は整数、`greater_than_or_equal_to: 0` は0以上。

Railsは `app/models/stretch_product.rb` から `StretchProduct` を読み込みます。`ApplicationRecord` は継承しません。migrationやDBの準備コマンドは不要です。

---

## 課題23：別の入力ルールをクラスとテストにする

`app/models/stretch_product.rb` を新規作成し、ファイル全体を次にします。

```ruby
class StretchProduct
  include ActiveModel::Model

  attr_accessor :price, :stock

  validates :price, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :stock, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
```

`spec/models/stretch_product_spec.rb` を新規作成し、ファイル全体を次にします。

```ruby
require "rails_helper"

RSpec.describe StretchProduct do
  it "通常の価格と在庫数は有効である" do
    product = StretchProduct.new(price: 100, stock: 3)

    expect(product).to be_valid
  end
end
```

```bash
bundle exec rspec spec/models/stretch_product_spec.rb
```

`1 example, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

Articleとは異なり、商品の値はDBへ保存しません。`new` で価格・在庫数を設定し、`be_valid` で入力の判定を確かめています。

</details>

---

## 課題24：無料の価格も認める

対象：`spec/models/stretch_product_spec.rb`。価格0・在庫3が有効である `it` を追加します。

```bash
bundle exec rspec spec/models/stretch_product_spec.rb
```

`2 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "価格0円は有効である" do
  product = StretchProduct.new(price: 0, stock: 3)

  expect(product).to be_valid
end
```

価格を1以上にしてしまう不具合を、下限ちょうどの0で検出できます。

</details>

---

## 課題25：価格と在庫の下限未満を別々に調べる

対象：`spec/models/stretch_product_spec.rb`。価格-1・在庫3と、価格100・在庫-1の2件を追加し、両方とも無効であることを確認します。他方の項目は正常値にします。

```bash
bundle exec rspec spec/models/stretch_product_spec.rb
```

`4 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "負の価格は無効である" do
  product = StretchProduct.new(price: -1, stock: 3)

  expect(product).not_to be_valid
end

it "負の在庫数は無効である" do
  product = StretchProduct.new(price: 100, stock: -1)

  expect(product).not_to be_valid
end
```

</details>

---

## 課題26：在庫切れは入力エラーにしない

対象：`spec/models/stretch_product_spec.rb`。価格100・在庫0が有効であるテストを追加してください。販売できるかではなく、在庫数として認めるかを調べます。

```bash
bundle exec rspec spec/models/stretch_product_spec.rb
```

`5 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "在庫0個は有効である" do
  product = StretchProduct.new(price: 100, stock: 0)

  expect(product).to be_valid
end
```

</details>

---

## 課題27：数値でも整数でない入力を拒否する

対象：`spec/models/stretch_product_spec.rb`。価格1.5・在庫3と、価格100・在庫1.5の2件を追加し、無効であることを確認してください。

```bash
bundle exec rspec spec/models/stretch_product_spec.rb
```

`7 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "小数の価格は無効である" do
  product = StretchProduct.new(price: 1.5, stock: 3)

  expect(product).not_to be_valid
end

it "小数の在庫数は無効である" do
  product = StretchProduct.new(price: 100, stock: 1.5)

  expect(product).not_to be_valid
end
```

数値かどうかだけでなく、円や個数として整数を求める仕様を確認しています。

</details>

---

## 課題28：入力形式と未設定を確認する

対象：`spec/models/stretch_product_spec.rb`。次の5件を追加します。

| 価格 | 在庫 | 判定 |
|---|---|---|
| `"100"` | `"3"` | 有効 |
| `"abc"` | `3` | 無効 |
| `100` | `"abc"` | 無効 |
| `nil` | `3` | 無効 |
| `100` | `nil` | 無効 |

```bash
bundle exec rspec spec/models/stretch_product_spec.rb
```

`12 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

```ruby
it "整数を表す文字列は有効である" do
  product = StretchProduct.new(price: "100", stock: "3")

  expect(product).to be_valid
end

it "数値でない価格は無効である" do
  product = StretchProduct.new(price: "abc", stock: 3)

  expect(product).not_to be_valid
end

it "数値でない在庫数は無効である" do
  product = StretchProduct.new(price: 100, stock: "abc")

  expect(product).not_to be_valid
end

it "価格が未設定なら無効である" do
  product = StretchProduct.new(price: nil, stock: 3)

  expect(product).not_to be_valid
end

it "在庫数が未設定なら無効である" do
  product = StretchProduct.new(price: 100, stock: nil)

  expect(product).not_to be_valid
end
```

`numericality` が未設定や数値にできない文字列を拒否します。整数の文字列が有効でも、このクラスの属性がIntegerへ変換されたわけではありません。

</details>

---

## 課題29：在庫上限の仕様変更をテストから進める

**新しい仕様：在庫数は0以上100以下の整数。価格のルールは変えません。**

まず `spec/models/stretch_product_spec.rb` へ、価格100・在庫100が有効、価格100・在庫101が無効の2件を追加します。既存の12件は残します。実装はまだ変えません。

> [!IMPORTANT]
> 新しい上限ルールはまだ実装されていないため、在庫101のテストが意図的に失敗します。期待値は新仕様のままにして、次の手順で実装を変更します。

```bash
bundle exec rspec spec/models/stretch_product_spec.rb
```

`14 examples, 1 failure` を確認します。

`app/models/stretch_product.rb` の在庫のルールに `less_than_or_equal_to: 100` を追加します。「100以下」を表す指定です。価格の行・0以上・整数の指定は残してください。

```bash
bundle exec rspec spec/models/stretch_product_spec.rb
```

`14 examples, 0 failures` を確認します。

<details>
<summary>解答例・確認</summary>

追加する2件：

```ruby
it "在庫100個は有効である" do
  product = StretchProduct.new(price: 100, stock: 100)

  expect(product).to be_valid
end

it "在庫101個は無効である" do
  product = StretchProduct.new(price: 100, stock: 101)

  expect(product).not_to be_valid
end
```

変更後のクラス全体：

```ruby
class StretchProduct
  include ActiveModel::Model

  attr_accessor :price, :stock

  validates :price, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :stock, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
end
```

在庫0・負数・小数・未設定など既存の条件も、まとめて再実行できました。

</details>

---

## 課題30：全件を確認して修正理由を記録する

最初に全件を実行します。

```bash
bundle exec rspec --format documentation
```

`51 examples, 0 failures` を確認します。

内訳はPractice24件、更新9件、削除3件、一連の操作1件、商品14件です。ファイル別の結果も記録してください。

### 結果を記録する（考察問題・実行しない）

> [!IMPORTANT]
> ここからは考察問題です。アプリ・テストのコードの変更やコマンドの実行はしません。
> アプリ直下に `stretch17_report.md` を作り、次の答えを書いて保存します。

1. 全件実行の最後の結果と、各テストファイルの件数。
2. `reload` が必要な理由と、無効な更新で確認したDBの値。
3. 課題13・20で、記事数だけでは見逃す不具合と、それを検出した確認。
4. `follow_redirect!` の前と後で、`response` が何を表しているか。
5. 課題22のブラウザ確認結果。
6. 商品の入力で、0・負数・小数・整数の文字列・nilをどう判定したか。
7. 課題29で期待値を変えてよい根拠と、残した以前のルール。

<details>
<summary>解答例・確認</summary>

実行結果は自分が確認したものを書きます。

- 更新では件数に加え、DBへ保存された両項目を `reload` 後に確認する。無効な更新では以前の両項目が残る。
- 削除では対象の消失と、対象外の記事の保持を調べる。
- `follow_redirect!` 前は更新・削除などの応答、後は移動先の応答。
- 商品は0を有効、負数・小数・数値でない文字列・nilを無効とする。整数の文字列は有効。
- 在庫上限100という新仕様を根拠にテストを追加し、整数・0以上・価格のルールは残す。

</details>

---

## 作業を終える前に

`stretch17_report.md` をTeamsへ提出します。Practiceと同じ方法で、`rspec_starter` フォルダをPCへバックアップしてください。今回作った `app/models/stretch_product.rb`、更新・削除・一連の操作・商品の4つのテストファイル、`stretch17_report.md` が保存されていることを確認します。

参考：

- [Rails 8.0：リクエストとリダイレクトのテスト](https://guides.rubyonrails.org/v8.0/testing.html#integration-testing)
- [Rails 8.0：Active Model](https://guides.rubyonrails.org/v8.0/active_model_basics.html)
- [Rails 8.0：数値のバリデーション](https://guides.rubyonrails.org/v8.0/active_record_validations.html#numericality)

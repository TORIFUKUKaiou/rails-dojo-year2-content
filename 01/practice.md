# 第1週：練習 ── scaffoldで思い出す

## 今日のゴール

scaffoldを使ってRailsアプリをもう一度動かし、Model / View / Controller / ルーティング / マイグレーションがどこにあるかを思い出す。

---

## 準備

実力確認テストが終わったら、ここから手を動かします。

---

## 今日の目標（達成ライン）

この練習には、3つの達成ラインがあります。まずは `必須` の完了を目標にしましょう。

- `必須（全員）`：Railsアプリを作り、scaffoldを実行し、記事の一覧・作成・編集・削除ができることを確認する
- `推奨（余裕がある人）`：scaffoldが生成した主要ファイルを開き、役割を確認する
- `発展（早く終わった人）`：[Stretch](stretch.md) に進み、scaffoldが作ったアプリを自分の手で変更する

最初から全部理解する必要はありません。まずは動かし、その後で中身を見ていきましょう。

---

## 1. Codespacesを起動する

1年生のときと同じです。GitHubにログインして、このリポジトリのCodespacesを起動してください。

---

## 2. Railsをインストールする

ターミナルで以下を実行します：

```bash
gem install rails --no-document
rails -v
```

`--no-document` は、説明書のような追加ファイルを入れずに Rails 本体だけをインストールする指定です。授業では、インストールを少し軽くするために付けています。

`rails 8.x.x` や `rails 7.x.x` のように表示されたら、Rails が使える状態です。

---

## 3. Railsアプリを作る

ターミナルで以下を実行します：

```bash
rails new review_app
cd review_app
```

---

## 4. scaffoldを実行する

```bash
rails generate scaffold Article title:string body:text
rails db:migrate
```

---

## 5. サーバーを起動する

```bash
rails server
```

ブラウザで `/articles` にアクセスして、記事の一覧・作成・編集・削除ができることを確認してください。

### 確認ポイント

- 記事の一覧が見える
- 新しい記事を作成できる
- 作成した記事を編集できる
- 記事を削除できる

---

## 6. scaffoldが作ったものを観察する

scaffoldは便利ですが、何をしているかわからないまま使うのは危険です。

以下のファイルを開いて、中身を眺めてください：

| ファイル | 役割 |
|---|---|
| `app/models/article.rb` | Model |
| `app/views/articles/index.html.erb` | View（一覧） |
| `app/controllers/articles_controller.rb` | Controller |
| `config/routes.rb` | ルーティング |
| `db/migrate/xxxx_create_articles.rb` | マイグレーション |

全部理解する必要はありません。「こういうファイルがあったな」と思い出せれば十分です。

---

## まとめ

今日やったこと：

1. scaffoldでRailsアプリを動かした
2. 記事の一覧・作成・編集・削除を確認した
3. scaffoldが生成したファイルを観察した

余裕がある人は、次に [Stretch](stretch.md) に進んでください。

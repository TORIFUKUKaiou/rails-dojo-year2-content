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

1. GitHubにログインする
2. [このリポジトリ](https://github.com/TORIFUKUKaiou/rails-dojo-year2-content/)のページを開く (リンクを右クリックして、「リンクを新しいタブで開く」)
3. 「Code」ボタン → 「Codespaces」タブ → 「Create codespace on main」をクリック

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
cd ~/
rails new review_app
cd review_app
```

💡 `cd ~/` はHOMEディレクトリへの移動です。

---

## 4. scaffoldを実行する

```bash
rails generate scaffold Article title:string body:text
```

`db/migrate/` に新しいファイルができているはずです。`xxxx_create_articles.rb` を開いて、中身を確認してください。

そのあとで、以下を実行します。

```bash
rails db:migrate
```

---

## 5. Codespacesで開くための設定を追加する

Codespaces で `rails server` を使うと、そのままでは `Blocked hosts` や `InvalidAuthenticityToken` で止まることがあります。開発用の設定ファイルを追加します。

1. `config/initializers/codespaces.rb` を作る

2. 以下を書きます

```ruby
# GitHub Codespaces で開発するための緩和設定（開発用）
Rails.application.configure do
  config.hosts << /.*\.github\.dev/
  config.action_controller.forgery_protection_origin_check = false

  if defined?(WebConsole)
    config.web_console.permissions = '0.0.0.0/0'
  end
end
```

`config.hosts` は `Blocked hosts` 対策です。`config.action_controller.forgery_protection_origin_check = false` は、Codespaces で開いた画面から作成・更新するときの Origin 不一致対策です。

---

## 6. サーバーを起動する

```bash
rails server
```

`Blocked hosts:` や `InvalidAuthenticityToken` が表示されたときは、`config/initializers/codespaces.rb` のファイル名と中身を確認して、サーバーを起動し直してください。

ブラウザで `/articles` にアクセスして、記事の一覧・作成・編集・削除ができることを確認してください。

### 確認ポイント

- 記事の一覧が見える
- 新しい記事を作成できる
- 作成した記事を編集できる
- 記事を削除できる

---

## 7. scaffoldが作ったものを観察する

scaffoldは便利ですが、何をしているかわからないまま使うのは危険です。

以下のファイルを開いて、指示された内容を確認してください：

| ファイル | 確認すること |
|---|---|
| `config/routes.rb` | `resources :articles` という1行を見つける。ターミナルで `rails routes` を実行し、この1行からいくつのURLが生まれているか数える |
| `app/controllers/articles_controller.rb` | メソッド（`def index` など）がいくつあるか数える。`rails routes` の出力と見比べて、どのURLがどのメソッドに対応しているか1つだけ確認する |
| `app/views/articles/` | このフォルダにファイルがいくつあるか数える。コントローラのメソッド数と比べて、多いか少ないか確認する |
| `app/models/article.rb` | ファイルを開く。中身がほぼ空であることを確認する。それでもCRUDが動いている理由を考える |
| `db/migrate/xxxx_create_articles.rb` | 実力確認テストの問題3と同じ内容であることを確認する |

---

## まとめ

今日やったこと：

1. scaffoldでRailsアプリを動かした
2. Codespaces で開けるように設定した
3. 記事の一覧・作成・編集・削除を確認した
4. scaffoldが生成したファイルを観察した

余裕がある人は、次に [Stretch](stretch.md) に進んでください。

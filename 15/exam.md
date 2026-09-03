# 第15回：前期期末試験

> [!IMPORTANT]
> この試験は、前期に学んだ Rails の仕組み、データベース、Git、AWS、本番環境へのデプロイを確認するための試験です。
> 第1部と第2部を、上から順に取り組んでください。

## 試験の進め方

- 試験時間は 180 分です。
- 第1部は選択式20問です。教員から指定された Google フォームに回答してください。
- 第2部は、CodeShelf を AWS の本番環境へ deploy する実技試験です。
- 講義資料、過去の演習ファイル、インターネット検索、生成AIは使って構いません。
- ただし、提出する GitHub リポジトリと AWS 環境は、自分自身が作成・操作したものにしてください。

> [!WARNING]
> <code>DATABASE_URL</code> と <code>SECRET_KEY_BASE</code> には、接続情報や秘密値が含まれます。
> GitHub、README、Google フォーム、チャット、スクリーンショットには貼り付けません。

---

# 第1部：選択式問題（全20問）

各問について、最も適切な選択肢を1つ選んでください。

## A. データベース設計とアソシエーション（問1〜問5）

### 問1

1つのプロジェクト（<code>Project</code>）に複数のタスク（<code>Task</code>）が属する、1対多の関係を Rails で作ります。

<code>Project</code> モデルに <code>has_many :tasks</code>、<code>Task</code> モデルに <code>belongs_to :project</code> を書くとき、外部キー <code>project_id</code> を置くテーブルはどれですか。

1. <code>projects</code> テーブル
2. <code>tasks</code> テーブル
3. 両方のテーブル
4. 外部キーは不要である

<details>
<summary>解答・解説</summary>

**解答：2**

1対多の関係では、「多」の側が親を表す外部キーを持ちます。複数のタスクのそれぞれが、どのプロジェクトに属するかを記録するため、<code>tasks</code> テーブルに <code>project_id</code> を置きます。

</details>

### 問2

すでにある <code>products</code> テーブルへ、在庫数を表す <code>stock</code> カラム（整数）を追加します。migration の <code>change</code> メソッドに書くコードとして正しいものはどれですか。

1. <code>add_column :stock, :products, :integer</code>
2. <code>add_column :products, :stock, :integer</code>
3. <code>create_column :products, :stock, :integer</code>
4. <code>add_field :products, :stock, :integer</code>

<details>
<summary>解答・解説</summary>

**解答：2**

<code>add_column</code> は、<code>add_column :テーブル名, :カラム名, :型</code> の順で書きます。この問題では、<code>products</code> テーブルに <code>stock</code> という整数のカラムを追加します。

</details>

### 問3

次のモデルを定義しました。

~~~ruby
class Task < ApplicationRecord
  belongs_to :project
end
~~~

<code>@task</code> が1件のタスクであるとき、<code>belongs_to :project</code> によって提供されるメソッドとして誤っているものはどれですか。

1. <code>@task.project</code> で、そのタスクが属するプロジェクトを取り出せる。
2. <code>@task.project = @project</code> で、タスクにプロジェクトを紐付けられる。
3. <code>@task.build_project</code> で、紐付ける新しいプロジェクトをメモリ上に作れる。
4. <code>@task.projects</code> で、タスクに紐付く複数のプロジェクトを取り出せる。

<details>
<summary>解答・解説</summary>

**解答：4**

<code>belongs_to</code> は、1件の親に属する関係です。<code>Task</code> から取り出せるプロジェクトは1件なので、メソッド名も単数形の <code>project</code> です。複数形の <code>projects</code> を使うのは、<code>has_many</code> 側です。

</details>

### 問4

データベースの主キー（Primary Key）の役割として、最も適切なものはどれですか。

1. テーブル内の各レコードを一意に識別する。
2. テーブル同士のアソシエーションを自動的に作る。
3. レコードの作成日時を保存する。
4. データベースへの接続パスワードを保存する。

<details>
<summary>解答・解説</summary>

**解答：1**

主キーは、1つのテーブルにある各レコードを重複なく識別するための値です。Rails では通常、<code>id</code> カラムが主キーとして使われます。

</details>

### 問5

次のコマンドを実行したときの説明として、正しいものはどれですか。

~~~bash
bin/rails db:rollback
~~~

1. データベース内のすべてのテーブルを削除する。
2. Rails アプリケーションのソースコードを直前の Git commit に戻す。
3. 最後に実行した migration を1つ取り消し、データベースの構造を1つ前の状態に戻す。
4. すべての未保存データを本番データベースへ保存する。

<details>
<summary>解答・解説</summary>

**解答：3**

<code>db:rollback</code> は、直前に実行した migration の変更を取り消します。Git の履歴を戻すコマンドではなく、データベース構造を扱う Rails のコマンドです。

</details>

---

## B. MVC と HTTP リクエスト（問6〜問10）

### 問6

ブラウザから新しい記事を登録するため、<code>POST /articles</code> が送信されました。保存に成功した後、<code>redirect_to @article</code> で記事の詳細画面を表示するまでの流れとして、最も適切なものはどれですか。

1. Routing → Controller の <code>create</code> → Model の保存 → Redirect → ブラウザが <code>GET /articles/:id</code> を送信 → Routing → Controller の <code>show</code> → View
2. View → Routing → Model の保存 → Controller の <code>create</code> → Redirect
3. Controller の <code>show</code> → Routing → View → Model の保存
4. Routing → View → Model の保存 → Controller の <code>create</code>

<details>
<summary>解答・解説</summary>

**解答：1**

最初の POST リクエストは、Routing により <code>create</code> アクションへ届きます。Controller が Model を使って保存し、<code>redirect_to</code> はブラウザへ別URLへ移動するよう指示します。その後、ブラウザが詳細画面への GET リクエストを送り直し、<code>show</code> と View が実行されます。

</details>

### 問7

<code>config/routes.rb</code> に次の定義があります。

~~~ruby
resources :books
~~~

ID が <code>12</code> の本の編集フォームを表示するとき、HTTP メソッドとパスの組み合わせとして正しいものはどれですか。

1. <code>POST /books/12/edit</code>
2. <code>GET /books/12/edit</code>
3. <code>PATCH /books/12</code>
4. <code>GET /books/edit/12</code>

<details>
<summary>解答・解説</summary>

**解答：2**

編集フォームを表示する <code>edit</code> アクションは、<code>GET /books/:id/edit</code> です。<code>PATCH /books/:id</code> は、フォームで入力した編集内容を送信して更新するときに使います。

</details>

### 問8

Rails 8 で、<code>ArticlesController</code> に次のメソッドがあります。

~~~ruby
def article_params
  params.expect(article: [ :title, :body ])
end
~~~

このコードの説明として正しいものはどれですか。

1. <code>article</code> というまとまりの中から、<code>title</code> と <code>body</code> を受け取るためのパラメータを取り出す。
2. <code>articles</code> テーブルを作成し、<code>title</code> と <code>body</code> のカラムを追加する。
3. <code>title</code> と <code>body</code> が空文字列の場合に、必ず保存エラーにする。
4. すべてのパラメータを無条件にデータベースへ保存する。

<details>
<summary>解答・解説</summary>

**解答：1**

<code>params.expect</code> は、フォームから送られた値のうち、指定した構造と項目を安全に取り出すための仕組みです。この場合は <code>article</code> の中にある <code>title</code> と <code>body</code> を扱います。migration やバリデーションを行うコードではありません。

</details>

### 問9

ERB の次の2つの書き方について、正しい説明はどれですか。

~~~erb
<%= @article.title %>
<% @article.title %>
~~~

1. 上はデータベースへ保存し、下はデータベースから削除する。
2. 上は式の結果を HTML に出力し、下は処理を実行しても結果を HTML へ出力しない。
3. 上は Controller でだけ使え、下は Model でだけ使える。
4. 上下に違いはなく、どちらも同じ結果を表示する。

<details>
<summary>解答・解説</summary>

**解答：2**

<code>&lt;%= %&gt;</code> は、評価した結果を HTML に出力します。<code>&lt;% %&gt;</code> は、<code>if</code> や <code>each</code> などの処理を実行するときに使えますが、式の結果そのものは画面に出力しません。

</details>

### 問10

Controller で使う <code>redirect_to articles_path</code> と <code>render :index</code> の違いとして、正しいものはどれですか。

1. <code>redirect_to</code> はブラウザに別URLへアクセスし直すよう指示し、<code>render</code> は現在のリクエストのまま指定した View を表示する。
2. <code>redirect_to</code> はデータベースを初期化し、<code>render</code> は migration を実行する。
3. <code>redirect_to</code> は必ず View を表示せず、<code>render</code> は必ず別の Controller を最初から実行する。
4. 両者はまったく同じ動きをする。

<details>
<summary>解答・解説</summary>

**解答：1**

<code>redirect_to</code> はブラウザへリダイレクトのレスポンスを返し、ブラウザが別のURLへ新しいリクエストを送ります。<code>render</code> は現在の Controller 処理の中で、指定したテンプレートを使ってレスポンスを作ります。

</details>

---

## C. Git と GitHub Flow（問11〜問14）

### 問11

<code>app/views/articles/index.html.erb</code> の変更だけを、次の commit に含めたいです。ステージングエリアへ追加するコマンドとして正しいものはどれですか。

1. <code>git commit -m "トップ画面を変更"</code>
2. <code>git push origin main</code>
3. <code>git add app/views/articles/index.html.erb</code>
4. <code>git save app/views/articles/index.html.erb</code>

<details>
<summary>解答・解説</summary>

**解答：3**

<code>git add</code> は、次の commit に含める変更をステージングエリアへ追加するコマンドです。<code>git commit</code> はステージング済みの変更を記録し、<code>git push</code> は commit を GitHub へ送ります。

</details>

### 問12

GitHub Flow で新しい機能を作り始めるとき、最も適切な手順はどれですか。

1. <code>main</code> で直接変更し、完成したらすぐに push する。
2. 最新の <code>main</code> を取得してから、機能用の新しいブランチを作成して作業する。
3. 本番環境の EC2 で直接ファイルを編集してから、GitHub へコピーする。
4. 他の人が作業中のブランチを削除してから作業する。

<details>
<summary>解答・解説</summary>

**解答：2**

GitHub Flow では、最新の <code>main</code> を土台にして、機能ごとのブランチを作ります。これにより、<code>main</code> を安定した状態に保ちながら変更を進め、Pull Request で確認できます。

</details>

### 問13

Codespaces で <code>git push</code> を実行して GitHub のリポジトリが更新されました。この直後の EC2 上の Rails アプリについて、正しい説明はどれですか。

1. GitHub が更新されたため、2台の EC2 も自動的に最新コードへ切り替わる。
2. ALB が GitHub から新しいコードを取得して、EC2へ配布する。
3. EC2 のファイルは自動では変わらないため、各 EC2 で <code>git pull</code> などを行ってコードを反映する必要がある。
4. RDS が GitHub の commit を読み取り、Rails アプリを更新する。

<details>
<summary>解答・解説</summary>

**解答：3**

<code>git push</code> が更新するのは GitHub のリモートリポジトリです。手動 deploy では、EC2 ①と EC2 ②の両方で <code>git pull</code> を行い、Rails server を再起動して初めて本番環境へ反映されます。

</details>

### 問14

別のブランチを取り込むとき、同じファイルの同じ箇所に異なる変更があり、Conflict が発生しました。解決方法として正しいものはどれですか。

1. <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>、<code>=======</code>、<code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> を残したまま commit する。
2. マージマーカーで囲まれた内容を確認して必要なコードへ直し、マージマーカーをすべて削除してから <code>git add</code> と <code>git commit</code> を行う。
3. Conflict が起きたファイルを必ず削除する。
4. <code>git push</code> だけを実行して GitHub に解決させる。

<details>
<summary>解答・解説</summary>

**解答：2**

Conflict は、Git がどちらの変更を残すべきか自動で判断できない状態です。人が内容を確認して必要な形へ直し、マージマーカーを残さずに保存してから、変更を commit します。

</details>

---

## D. AWS インフラとネットワーク（問15〜問18）

### 問15

ALB から EC2 上の Rails アプリへ、3000番ポートで通信を送る構成を作ります。EC2 用セキュリティグループのインバウンドルールの送信元として、最も安全なものはどれですか。

1. <code>0.0.0.0/0</code>
2. ALB 用セキュリティグループの ID
3. ALB の DNS 名
4. 自分の GitHub ユーザー名

<details>
<summary>解答・解説</summary>

**解答：2**

EC2 用セキュリティグループの送信元に ALB 用セキュリティグループを指定すると、ALB からの通信だけを許可できます。<code>0.0.0.0/0</code> を指定すると、インターネット上の誰からでも3000番ポートへアクセスできてしまいます。

</details>

### 問16

画像、CSS、JavaScript、HTML などのファイルをオブジェクトとして保存する用途に適した AWS サービスはどれですか。

1. EC2
2. RDS
3. S3
4. ALB

<details>
<summary>解答・解説</summary>

**解答：3**

S3 はオブジェクトストレージです。ファイルをバケットに保存し、必要に応じて公開やアクセス制御を設定できます。RDS はリレーショナルデータベース、EC2 は仮想サーバー、ALB は通信を振り分けるサービスです。

</details>

### 問17

RDS PostgreSQL を private subnet に置く主な理由として、最も適切なものはどれですか。

1. インターネットから RDS へ直接接続されるのを防ぎ、EC2 など許可した内部の接続元からだけ使えるようにするため。
2. RDS の PostgreSQL を SQLite に変換するため。
3. EC2 の台数を必ず1台にするため。
4. ALB のヘルスチェックを止めるため。

<details>
<summary>解答・解説</summary>

**解答：1**

データベースには重要なデータを保存するため、インターネットから直接アクセスできない private subnet に置きます。さらに、RDS 用セキュリティグループで EC2 用セキュリティグループからの PostgreSQL 通信だけを許可します。

</details>

### 問18

ALB のヘルスチェックの説明として、正しいものはどれですか。

1. Rails のソースコードを自動で書き換える機能である。
2. GitHub の commit メッセージを採点する機能である。
3. RDS のデータを毎回バックアップする機能である。
4. EC2 上のアプリが指定したパスへ正常に応答するかを確認し、異常なターゲットには通信を振り分けないようにする機能である。

<details>
<summary>解答・解説</summary>

**解答：4**

ALB は、たとえば <code>/up</code> へ HTTP リクエストを送り、正常な応答を返すか確認します。応答に失敗する EC2 は <code>Unhealthy</code> となり、正常なターゲットと異なり通信の振り分け対象から外れます。

</details>

---

## E. 本番起動とエラーデバッグ（問19〜問20）

### 問19

EC2 で新しい CSS を含むコードを取得して Rails server を再起動したところ、production 環境の画面に CSS が適用されません。原因と対策として最も適切なものはどれですか。

1. RDS を削除してから Rails を起動し直す。
2. production 用のアセットを <code>assets:precompile</code> で準備し、Rails server を再起動して確認する。
3. <code>config/routes.rb</code> から <code>resources</code> をすべて削除する。
4. ALB の DNS 名を GitHub の URL に変更する。

<details>
<summary>解答・解説</summary>

**解答：2**

production 環境では、CSS や JavaScript などのアセットを事前に準備します。コードを取得した後は、<code>SECRET_KEY_BASE_DUMMY=1 RAILS_ENV=production bin/rails assets:precompile</code> を実行し、Rails server を再起動して確認します。

</details>

### 問20

production モードで Rails を起動しようとしたとき、<code>ActiveRecord::ConnectionNotEstablished</code> が表示されました。確認すべき内容として最も適切なものはどれですか。

1. HTML の <code>h1</code> タグが正しく閉じているか。
2. S3 バケットの名前がページタイトルと一致しているか。
3. <code>DATABASE_URL</code> の RDS endpoint、ユーザー名、パスワード、データベース名と、RDS 用セキュリティグループの5432番ポートの許可設定。
4. Git commit メッセージに日本語が含まれていないか。

<details>
<summary>解答・解説</summary>

**解答：3**

このエラーは Rails がデータベースへ接続できないときに起こります。<code>DATABASE_URL</code> の接続先や認証情報、RDS が <code>Available</code> か、RDS 用セキュリティグループで EC2 からの5432番ポートを許可しているかを確認します。

</details>

---

# 第2部：実技試験「CodeShelf にブックマーク機能を追加して本番へ deploy する」

## ミッション

自分の GitHub リポジトリで CodeShelf をカスタマイズし、AWS 上の ALB、EC2 2台、RDS PostgreSQL で動く本番環境へ deploy します。

完成後、次のことを確認できる状態にしてください。

| 項目 | 確認すること |
|---|---|
| トップ画面 | 自分の名前を入れた CodeShelf の見出しが表示される |
| ブックマーク機能 | <code>/bookmarks</code> で作成・表示・編集・削除ができる |
| GitHub | 自分のリポジトリに変更が commit・push されている |
| AWS | ALB のターゲットグループで EC2 2台が <code>Healthy</code> である |
| 共通DB | ALBを何度か再読み込みしても、同じブックマークを表示できる |

> [!IMPORTANT]
> この実技試験では、第13週の環境構築手順を使います。
> まずは第13週の Practice の Step 1〜Step 13 を完了し、変更前の CodeShelf が ALB 経由で表示される状態を作ってから、下の本番試験の手順へ進んでください。

参照する教材：

- [第13週 Practice：手動deployを3周体験する](../13/practice.md)
- [CloudFormation テンプレート](../13/infrastructure/week13-baseline.yaml)

> [!WARNING]
> 第13週の Practice で作る環境変数ファイルには、<code>DATABASE_URL</code> と <code>SECRET_KEY_BASE</code> が入ります。
> それらの値を提出物、GitHub、README、チャット、スクリーンショットへ貼り付けません。

## Step 1：自分用の GitHub リポジトリを作る

ブラウザで次のリポジトリを開きます。

- [TORIFUKUKaiou/rails-dojo-git-practice](https://github.com/TORIFUKUKaiou/rails-dojo-git-practice)

<code>Use this template</code> から <code>Create a new repository</code> を選び、自分用リポジトリを作ります。

リポジトリ名は次の形にします。

~~~text
rails-dojo-exam-自分の名前
~~~

例：

~~~text
rails-dojo-exam-yamada
~~~

作成後、自分用リポジトリの URL を控えます。

~~~text
https://github.com/自分のユーザー名/rails-dojo-exam-自分の名前
~~~

> [!IMPORTANT]
> ここから先は、必ず自分用リポジトリを使います。
> 教材の元リポジトリを直接編集しません。

## Step 2：変更前の本番環境を作る

第13週 Practice の Step 1〜Step 13 を、自分用リポジトリ名を読み替えて実行します。

次の状態を確認できれば、変更前の本番環境は準備できています。

1. AWS Academy Sandbox が <code>ready</code> で、リージョンが <code>us-east-1</code> である
2. <code>week13-baseline.yaml</code> を使った CloudFormation スタックが <code>CREATE_COMPLETE</code> である
3. CloudFormation の出力から、<code>Ec2Instance1Id</code>、<code>Ec2Instance2Id</code>、<code>AlbDnsName</code>、<code>RdsEndpoint</code> を控えている
4. EC2 ①と EC2 ②の両方で CodeShelf が起動している
5. ALB の URLで CodeShelf を開ける
6. ターゲットグループ <code>rails-dojo-week13-tg</code> で2台とも <code>Healthy</code> である

> [!NOTE]
> CloudFormation テンプレートが作るリソース名には <code>week13</code> が含まれます。この試験ではテンプレート自体を変更しません。
> AWS Academy Sandbox が新しい状態なら、CloudFormation のスタック名は <code>rails-dojo-exam</code> として構いません。

## Step 3：Codespaces で CodeShelf をカスタマイズする

自分用リポジトリで Codespace を開きます。

ターミナルで、Rails アプリの場所にいることを確認します。

~~~bash
pwd
~~~

変更前のアプリを動かすため、次のコマンドを実行します。

~~~bash
bin/rails db:prepare
bin/rails server
~~~

ブラウザで <code>/</code> を開き、CodeShelf が表示されることを確認します。

> [!IMPORTANT]
> Rails server を起動したターミナルは、サーバーを動かすために使います。
> 以降の Git コマンドや scaffold コマンドは、新しいターミナルで実行します。

### Step 3-1：トップ画面の見出しを変更する

次のファイルを開きます。

~~~text
app/views/articles/index.html.erb
~~~

次の2か所を探します。

~~~erb
<% content_for :title, "CodeShelf | 技術記事を探索する" %>
~~~

~~~erb
<h1>CodeShelf</h1>
~~~

<code>自分の名前</code> を自分の名前に置き換え、次のように変更して保存します。

~~~erb
<% content_for :title, "自分の名前のCodeShelf | 技術記事を探索する" %>
~~~

~~~erb
<h1>自分の名前のCodeShelf</h1>
~~~

たとえば名前が山田花子の場合、次のようになります。

~~~erb
<h1>山田花子のCodeShelf</h1>
~~~

ブラウザを再読み込みし、変更した見出しが表示されることを確認します。

### Step 3-2：Bookmark の scaffold を作る

新しいターミナルで、次のコマンドを実行します。

~~~bash
bin/rails generate scaffold Bookmark title:string url:string memo:text
bin/rails db:migrate
~~~

出力の中に、次のような行が含まれていれば成功です。

~~~text
create    app/models/bookmark.rb
create    app/controllers/bookmarks_controller.rb
create    app/views/bookmarks
~~~

ルーティングを確認します。

~~~bash
bin/rails routes | grep bookmarks
~~~

<code>bookmarks</code> に関係するルートが表示されれば成功です。

### Step 3-3：ナビゲーションにブックマークへのリンクを追加する

次のファイルを開きます。

~~~text
app/views/layouts/application.html.erb
~~~

ナビゲーションの次の部分を探します。

~~~erb
<%= link_to "記事を探す", articles_path, class: "nav-link" %>
<%= link_to "記事を書く", new_article_path, class: "button button-primary" %>
~~~

2行の間に、次の1行を追加して保存します。

~~~erb
<%= link_to "記事を探す", articles_path, class: "nav-link" %>
<%= link_to "ブックマークを見る", bookmarks_path, class: "nav-link" %>
<%= link_to "記事を書く", new_article_path, class: "button button-primary" %>
~~~

### Step 3-4：Codespaces で Bookmark CRUD を確認する

ブラウザで次を開きます。

~~~text
/bookmarks
~~~

<code>New bookmark</code> をクリックし、次のデータを入力します。

| 項目 | 入力する値 |
|---|---|
| Title | Rails Guides |
| Url | https://guides.rubyonrails.org/ |
| Memo | Railsの公式ガイドを読む |

<code>Create Bookmark</code> をクリックします。

次のことを確認します。

- 詳細画面に登録内容が表示される
- 一覧画面に戻ると、<code>Rails Guides</code> が表示される
- <code>Edit this bookmark</code> から <code>Memo</code> を変更できる
- <code>Destroy this bookmark</code> で削除できる

削除を確認した後、提出用としてブックマークをもう1件登録します。タイトル、URL、メモは自分で決めて構いません。

## Step 4：変更を commit して GitHub へ push する

変更状態を確認します。

~~~bash
git status
~~~

差分を確認します。

~~~bash
git diff
~~~

scaffold により追加されたファイルも含め、変更をステージングします。

~~~bash
git add app db config test
~~~

もう一度状態を確認します。

~~~bash
git status
~~~

<code>Changes to be committed</code> に、変更した View、<code>Bookmark</code> のファイル、migration、<code>db/schema.rb</code>、<code>config/routes.rb</code> などが表示されることを確認します。

commit します。

~~~bash
git commit -m "ブックマーク機能を追加"
~~~

commit 後に、変更が残っていないことを確認します。

~~~bash
git status
~~~

次のように表示されれば成功です。

~~~text
nothing to commit, working tree clean
~~~

GitHub へ push します。

~~~bash
git push origin main
~~~

GitHub の自分用リポジトリを開き、今回の commit が表示されることを確認します。

## Step 5：EC2 ①へ変更を deploy する

EC2 ①の Session Manager タブを開きます。

Rails アプリのディレクトリへ移動します。<code>自分の名前</code> は、Step 1で作ったリポジトリ名に置き換えます。

~~~bash
cd ~/rails-dojo-exam-自分の名前
~~~

GitHub の最新コードを取得します。

~~~bash
git pull
git log --oneline -1
~~~

Step 4で作った commit が表示されることを確認します。

第13週の Step 10 で作った環境変数ファイルを読み込みます。

~~~bash
source ~/rails-dojo-week13.env
~~~

production の RDS へ migration を実行します。

~~~bash
bin/rails db:migrate
~~~

> [!IMPORTANT]
> RDS は EC2 ①とEC2 ②で共通です。
> migration はこの EC2 ①で1回だけ実行します。

production 用のアセットを準備します。

~~~bash
SECRET_KEY_BASE_DUMMY=1 RAILS_ENV=production bin/rails assets:precompile
~~~

起動中の Puma を停止します。まず、Puma の PID を確認します。

~~~bash
ps aux | grep puma
~~~

<code>puma</code> と表示される行の左から2番目の数値を確認し、その数値を使って停止します。

~~~bash
kill PID
~~~

たとえば PID が <code>5954</code> なら、次のように実行します。

~~~bash
kill 5954
~~~

Puma が停止しない場合だけ、同じ PID に対して <code>kill -9</code> を使います。

~~~bash
kill -9 5954
~~~

> [!IMPORTANT]
> <code>5954</code> は例です。自分の画面で確認した PID を使います。

Rails server を起動します。

~~~bash
bin/rails server -b 0.0.0.0 -p 3000 -d
~~~

起動を確認します。

~~~bash
curl http://localhost:3000/up
~~~

HTML が返れば、EC2 ①の Rails server は起動しています。

## Step 6：EC2 ②へ変更を deploy する

EC2 ②の Session Manager タブを開きます。

EC2 ①と同じように、最新コードを取得して環境変数を読み込みます。

~~~bash
cd ~/rails-dojo-exam-自分の名前
git pull
git log --oneline -1
source ~/rails-dojo-week13.env
~~~

EC2 ①と同じ commit hash が表示されることを確認します。

EC2 ②では、<code>bin/rails db:migrate</code> を実行しません。

> [!IMPORTANT]
> EC2 ①とEC2 ②は同じ RDS を使っています。
> EC2 ①で migration を実行済みなので、EC2 ②で同じ migration をもう一度実行する必要はありません。

production 用のアセットを準備します。

~~~bash
SECRET_KEY_BASE_DUMMY=1 RAILS_ENV=production bin/rails assets:precompile
~~~

EC2 ①と同じように、<code>ps aux | grep puma</code> で PID を確認して Puma を停止し、Rails server を起動します。

~~~bash
bin/rails server -b 0.0.0.0 -p 3000 -d
curl http://localhost:3000/up
~~~

HTML が返れば、EC2 ②の Rails server は起動しています。

## Step 7：ALB 経由で本番環境を確認する

CloudFormation の出力 <code>AlbDnsName</code> を使い、ブラウザで次を開きます。

~~~text
http://ALBのDNS名
~~~

トップ画面に、自分の名前を入れた CodeShelf の見出しが表示されることを確認します。

ナビゲーションの <code>ブックマークを見る</code> をクリックするか、次のURLを開きます。

~~~text
http://ALBのDNS名/bookmarks
~~~

提出用のブックマークが表示されることを確認します。

次の順番で、本番環境の CRUD を確認します。

1. 新しいブックマークを1件作成する
2. 一覧と詳細画面で内容を表示する
3. 編集画面でメモを変更する
4. 削除する
5. 提出用のブックマークをもう1件登録する

ALB の URLを何度か再読み込みします。毎回、変更した見出しと提出用ブックマークが表示されることを確認します。

AWS コンソールで、ターゲットグループ <code>rails-dojo-week13-tg</code> を開きます。

<code>ターゲット</code> タブで、2台とも次の状態になっていることを確認します。

~~~text
Healthy
~~~

## 提出するもの

教員から指定された提出先へ、次の情報を提出してください。

1. <code>/bookmarks</code> を開いた ALB の URL
2. 自分用 GitHub リポジトリの URL
3. EC2 ①とEC2 ②で確認した最新 commit hash

> [!WARNING]
> <code>DATABASE_URL</code>、<code>SECRET_KEY_BASE</code>、RDS のパスワード、環境変数ファイルの内容は提出しません。

---

## 第2部の解答・解説

実技試験では、Step 1〜Step 7 の指定内容をすべて満たした状態が解答です。

### 変更するコードの確認

CodeShelf のトップ画面では、次の2か所を自分の名前に変更します。

~~~erb
<% content_for :title, "自分の名前のCodeShelf | 技術記事を探索する" %>
<h1>自分の名前のCodeShelf</h1>
~~~

Bookmark 機能を作るコマンドは次のとおりです。

~~~bash
bin/rails generate scaffold Bookmark title:string url:string memo:text
bin/rails db:migrate
~~~

<code>generate scaffold</code> は、Model、Controller、View、route、migration などをまとめて生成します。<code>db:migrate</code> は、migration をデータベースへ反映します。

### 本番 deploy の確認

本番環境へ変更を反映する基本の流れは次のとおりです。

~~~mermaid
flowchart LR
  C["Codespacesで変更"] --> G["commit・push"]
  G --> E1["EC2 ①<br>git pull・migration・再起動"]
  G --> E2["EC2 ②<br>git pull・再起動"]
  E1 --> A["ALBで確認"]
  E2 --> A
~~~

RDS は2台の EC2 で共有するため、migration は EC2 ①で1回だけ実行します。コードの取得、アセットの準備、Rails server の再起動は、EC2 ①とEC2 ②の両方で行います。

### 完成状態の確認

次のすべてを確認できれば、実技試験の指定内容を満たしています。

- 自分用 GitHub リポジトリに、トップ画面変更と Bookmark 機能の commit がある
- ALB のトップ画面に、自分の名前を入れた CodeShelf の見出しが表示される
- <code>/bookmarks</code> で Bookmark の CRUD を使える
- ALB を再読み込みしても、同じデータが表示される
- EC2 ①とEC2 ②で同じ commit hash が表示される
- ターゲットグループで EC2 2台が <code>Healthy</code> である

秘密値を提出しないことも、完成条件の1つです。

# 第15回：前期期末試験

> [!IMPORTANT]
> この試験は、前期に学んだ Rails の仕組み、データベース、Git、AWS、本番環境へのデプロイを確認するための試験です。
> 第1部と第2部を、上から順に取り組んでください。

## 試験の進め方

- 試験時間は 180 分です。
- この試験は全30点です。第1部は選択式20問（各1点）、第2部は実技試験（10点）です。
- 第1部は、教員から指定された Google フォームに回答してください。
- 第2部は、CodeShelf を AWS の本番環境へ deploy する実技試験です。
- 講義資料、過去の演習ファイル、インターネット検索、生成AIは使って構いません。
- ただし、使用する GitHub リポジトリと AWS 環境は、自分自身が作成・操作したものにしてください。

> [!WARNING]
> <code>DATABASE_URL</code> と <code>SECRET_KEY_BASE</code> には、接続情報や秘密値が含まれます。
> GitHub、README、Google フォーム、チャット、スクリーンショットには貼り付けません。

---

# 第1部：選択式問題（全20問・各1点）

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

# 第2部：実技試験（10点）

## 第13回 Practice を Step 13 まで完了できたか

[第13回の Practice](../13/practice.md) の「Step 13：ALBでas-isを確認する」までを、上から順に実施します。

Step 13 まで完了できた場合は「できた」を選びます。完了できていない場合は「できなかった」を選びます。

選択肢：

1. できた
2. できなかった

<details>
<summary>解答・解説</summary>

**解答：実際の結果を選ぶ**

「Step 13：ALBでas-isを確認する」までを完了できた場合は「できた」を選びます。1つでも完了できていない場合は「できなかった」を選びます。

</details>

# Stretch：AWSデプロイ体験（2）

Practiceでは、EC2上にRuby / Railsの環境を作り、GitHubからcloneしたRailsアプリを起動しました。

Stretchでは、次の3つに取り組みます。

1. Practiceで使ったEC2上のRailsアプリにページを追加する
2. 新しいEC2を立ち上げ、`rails new` と scaffold でもう一度Railsアプリを動かす
3. Kiro CLIを使って自己紹介サイトをS3へデプロイする

順番に進めてください。

---

## Stretch 1：PracticeのRailsアプリにページを追加する

Practiceで作成したEC2インスタンスをそのまま使います。

この課題では、clone済みのRailsアプリに自分用のページを追加します。

> [!WARNING]
> この課題では、練習のためにEC2上のファイルを直接編集します。
> 実際の開発では、手元の開発環境で変更し、GitHubへpushし、サーバではpullして反映する流れを基本にします。
> サーバ上で直接ソースコードを編集すると、変更内容がGitで管理されず、あとから再現しにくくなります。

---

## Step 1：同じEC2へSession Managerで再接続する

1. EC2のインスタンス一覧を開きます。
2. `rails-dojo-week10`へチェックを入れます。
3. `接続`をクリックします。
4. `SSM Session Manager`タブを開きます。
5. `接続`をクリックします。

ターミナルが開いたら、現在のユーザーを確認します。

```bash
whoami
```

`ubuntu` ではない場合は、次のコマンドを実行します。

```bash
sudo su - ubuntu
```

切り替えを確認します。

```bash
whoami
```

次のように表示されれば成功です。

```text
ubuntu
```

---

## Step 2：Railsアプリのディレクトリへ移動する

PracticeでcloneしたRailsアプリへ移動します。

```bash
cd ~/rails-dojo-git-practice
```

現在地を確認します。

```bash
pwd
```

次のように表示されれば成功です。

```text
/home/ubuntu/rails-dojo-git-practice
```

---

## Step 3：controllerを作成する

自分用ページを表示するcontrollerを作成します。

```bash
bin/rails generate controller Profile show
```

次のようなファイルが作成されます。

```text
app/controllers/profile_controller.rb
app/views/profile/show.html.erb
```

---

## Step 4：viewを編集する

作成されたviewファイルを開きます。

```bash
nano app/views/profile/show.html.erb
```

ファイルの中身を、次のように変更します。

```erb
<h1>私のプロフィール</h1>

<p>名前：ここに自分の名前を書きます</p>
<p>好きな技術：ここに好きな技術を書きます</p>
<p>今日できるようになったこと：EC2でRailsアプリを動かしました</p>

<p>
  <%= link_to "記事一覧へ戻る", articles_path %>
</p>
```

`nano` では、次の操作で保存して終了します。

```text
Ctrl + O
Enter
Ctrl + X
```

---

## Step 5：routeを確認する

controllerを作成したことで、`/profile/show` というURLが使えるようになっています。

routesを確認します。

```bash
rails routes | grep profile
```

次のような表示があれば成功です。

```text
profile_show GET /profile/show(.:format) profile#show
```

---

## Step 6：Rails serverを起動する

Rails serverを起動します。

```bash
rails server -b 0.0.0.0
```

次のような表示が出れば、Rails serverが起動しています。

```text
* Listening on http://0.0.0.0:3000
```

---

## Step 7：ブラウザで追加したページを確認する

ブラウザで次の形式のURLを開きます。

```text
http://EC2のパブリックIPアドレス:3000/profile/show
```

プロフィールページが表示されれば成功です。

表示されたら、次も確認してください。

- 自分で編集した名前が表示されている
- 自分で編集した好きな技術が表示されている
- `記事一覧へ戻る` のリンクをクリックすると記事一覧へ戻れる

---

## Step 8：Rails serverを停止する

Session Managerのターミナルへ戻ります。

Rails serverが動いている画面で、次のキーを押します。

```text
Ctrl + C
```

プロンプトが戻ってくれば、Rails serverは停止しています。

---

## Step 9：Practiceで作成したEC2を終了する

PracticeとStretch 1で使ったEC2インスタンスを終了します。

> [!IMPORTANT]
> ここで終了するのは、Practiceで作成した `rails-dojo-week10` インスタンスです。
> 次のStretch 2では、新しいEC2インスタンスを作成します。

1. EC2のインスタンス一覧を開きます。
2. `rails-dojo-week10`へチェックを入れます。
3. `インスタンスの状態`をクリックします。
4. `インスタンスを終了`をクリックします。
5. 確認画面で`終了`をクリックします。
6. インスタンスの状態が`終了済み`になることを確認します。

---

## Stretch 2：新しいEC2でrails newとscaffoldを試す

次は、新しいEC2インスタンスをもう一度作るところから始めます。

繰り返すことで、EC2作成、Session Manager接続、`ubuntu` ユーザーへの切り替え、Rails起動の流れを定着させます。

この課題では、インストール手順をPracticeより少しまとめて進めます。

---

## Step 1：新しいEC2インスタンスを作成する

Practiceと同じ手順で、新しいEC2インスタンスを作成します。

名前は次のようにします。

```text
rails-dojo-week10-stretch
```

AMIは次を選択します。

```text
Ubuntu Server 26.04 LTS
```

インスタンスタイプは次を選択します。

```text
t3.medium
```

セキュリティグループは、新しく作成します。

名前は、デフォルトで次のような名前になります。

```text
launch-wizard-2
```

この時点では、3000番ポートを開けなくて構いません。
SSHは使用しないため、「からの SSH トラフィックを許可」(※翻訳の誤り。正しくは、「SSH からのトラフィックを許可」)のチェックを外しておいてください。

`高度な詳細`を開き、`IAM インスタンスプロファイル`に次を設定します。

```text
LabInstanceProfile
```

この設定は、Session Managerで接続するために必要です。

インスタンスが`実行中`になり、ステータスチェックが通るまで待ちます。

---

## Step 2：Session Managerで接続する

1. `rails-dojo-week10-stretch`へチェックを入れます。
2. `接続`をクリックします。
3. `SSM Session Manager`タブを開きます。
4. `接続`をクリックします。

接続できたら、現在のユーザーを確認します。

```bash
whoami
```

`ubuntu` ユーザーへ切り替えます。

```bash
sudo su - ubuntu
```

切り替えを確認します。

```bash
whoami
```

次のように表示されれば成功です。

```text
ubuntu
```

---

## Step 3：環境を準備する

まず、パッケージ一覧を更新します。

```bash
sudo apt update
```

必要なパッケージをまとめてインストールします。

```bash
sudo apt install -y git curl build-essential autoconf libssl-dev libyaml-dev zlib1g-dev libffi-dev libgmp-dev rustc libsqlite3-dev sqlite3 pkg-config
```

miseをインストールします。

```bash
curl https://mise.run | sh
```

bashでmiseを使えるようにします。

```bash
echo 'eval "$($HOME/.local/bin/mise activate bash)"' >> ~/.bashrc
```

設定を読み込みます。

```bash
source ~/.bashrc
```

Rubyのインストール方法を設定します。

```bash
mise settings ruby.compile=false
```

Rubyをインストールします。

```bash
mise use -g ruby@4.0.5
```

Rubyを確認します。

```bash
ruby -v
```

Bundlerをインストールします。

```bash
gem install bundler -v 4.0.6
```

Railsをインストールします。

```bash
gem install rails
```

Railsを確認します。

```bash
rails -v
```

---

## Step 4：rails newで新しいアプリを作る

新しいRailsアプリを作ります。

```bash
rails new scaffold_app
```

作成されたディレクトリへ移動します。

```bash
cd scaffold_app
```

---

## Step 5：scaffoldでCRUDを作る

メモを管理するCRUDをscaffoldで作ります。

```bash
bin/rails generate scaffold Memo title:string body:text
```

migrationを実行します。

```bash
bin/rails db:migrate
```

エラーが出ず、プロンプトが戻ってくれば成功です。

---

## Step 6：Rails serverを起動する

Rails serverを起動します。

```bash
bin/rails server -b 0.0.0.0
```

次のような表示が出れば、Rails serverが起動しています。

```text
* Listening on http://0.0.0.0:3000
```

---

## Step 7：まだ接続できないことを確認する

ブラウザで次の形式のURLを開きます。

```text
http://新しいEC2のパブリックIPアドレス:3000/memos
```

この時点では、まだ接続できないはずです。

Practiceと同じく、セキュリティグループで3000番を開けていないためです。

---

## Step 8：セキュリティグループで3000番を開ける

`rails-dojo-week10-stretch` インスタンスに割り当てたセキュリティグループのインバウンドルールに、次のルールを追加します。
セキュリティグループの特定方法は、 Practice の手順を思い出してください。

| 項目 | 設定 |
|---|---|
| タイプ | カスタムTCP |
| ポート範囲 | `3000` |
| ソース | `Anywhere-IPv4` |

保存できたら、もう一度ブラウザでアクセスします。

```text
http://新しいEC2のパブリックIPアドレス:3000/memos
```

Memosの一覧画面が表示されれば成功です。

次の操作を確認してください。

- Memoを作成できる
- Memoの詳細画面を開ける
- Memoを編集できる
- Memoを削除できる

---

## Step 9：Rails serverを停止する

Session Managerのターミナルへ戻ります。

Rails serverが動いている画面で、次のキーを押します。

```text
Ctrl + C
```

プロンプトが戻ってくれば、Rails serverは停止しています。

---

## Step 10：Stretch 2で作成したEC2を終了する

Stretch 2で作成したEC2インスタンスを終了します。

1. EC2のインスタンス一覧を開きます。
2. `rails-dojo-week10-stretch`へチェックを入れます。
3. `インスタンスの状態`をクリックします。
4. `インスタンスを終了`をクリックします。
5. 確認画面で`終了`をクリックします。
6. インスタンスの状態が`終了済み`になることを確認します。

> [!IMPORTANT]
> AWSでは、作成して終わりではありません。
> 不要になったリソースを停止または終了するところまでが演習です。

---

## Stretch 3：Kiro CLIで自己紹介サイトをS3にデプロイする

生成AIを使った開発体験として、Kiro CLIを使って静的Webサイトを作成し、S3にデプロイする演習にも挑戦してみましょう。

この演習では、EC2上でKiro CLIを起動し、プロンプトを使って自己紹介サイトを作成します。

作成したファイルはS3に配置し、静的Webサイトとして公開します。

次のリンクから演習を進めてください。

[Kiro CLIで体験するVibe Coding - 自己紹介サイトをS3にデプロイ](https://qiita.com/torifukukaiou/items/29e217d5f7483d4218aa)

> [!IMPORTANT]
> 記事に書かれているプロンプトを、そのままコピーして使わないでください。
> 自分が作りたい自己紹介サイトに合わせて、プロンプトを変えてください。
> 例の通りに作ることより、自分で指示を考えることを重視します。

プロンプトの例を考えるときは、次のような観点を入れてみましょう。

- 自分の好きなもの
- 得意になりたい技術
- 将来作ってみたいアプリ
- 好きな色や雰囲気
- 見る人に伝えたい印象

面白いものができたら、公開URLを先生に見せてください。

Orientationで扱っていない内容も含まれます。

分からないところは、検索したり、生成AIに相談したりしながら進めて構いません。

---

## Stretchの確認

次の項目を確認してください。

- [ ] Practiceで作成したEC2へ再接続できた
- [ ] `ubuntu` ユーザーへ切り替えられた
- [ ] clone済みRailsアプリにプロフィールページを追加できた
- [ ] `/profile/show` をブラウザで表示できた
- [ ] Practiceで作成したEC2を終了できた
- [ ] 新しいEC2を作成できた
- [ ] 新しいEC2で `rails new` を実行できた
- [ ] scaffoldでCRUDを作成できた
- [ ] `/memos` をブラウザで表示できた
- [ ] Memoの作成・詳細・編集・削除を確認できた
- [ ] Stretch 2で作成したEC2を終了できた
- [ ] Kiro CLIの演習では、自分で考えたプロンプトを使った

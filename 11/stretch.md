# Stretch：AWSデプロイ体験（3）

Practiceでは、CloudFormationでEC2までの環境を作り、ALBを手動で追加しました。

Stretchでは、次の3つに取り組みます。

1. CloudFormationを使わず、EC2作成からALB公開までをもう一度行う
2. ALBのヘルスチェックを観察する
3. Kiro CLIを使って自己紹介サイトをS3へデプロイする

順番に進めてください。

---

## Stretch 1：EC2作成からALB公開までをもう一度行う

Practiceでは、VPC、public subnet、EC2などをCloudFormationで作成しました。

この課題では、EC2を作るところからもう一度行い、ALB経由でRailsアプリを表示するところまで進めます。

第10週と第11週の復習です。

---

## Step 1：新しいEC2インスタンスを作成する

EC2の画面から、新しいインスタンスを作成します。

名前は次のようにします。

```text
rails-dojo-week11-stretch
```

AMIは次を選択します。

```text
Ubuntu Server 26.04 LTS
```

インスタンスタイプは次を選択します。

```text
t3.medium
```

キーペアは作成しません。

画面では、次のような項目を選択します。

```text
キーペアなしで続行
```

ネットワーク設定では、デフォルトで選ばれているVPCとサブネットのまま進めて構いません。

SSHは使用しないため、「SSH トラフィックを許可」のチェックは外します。

高度な詳細を開き、`IAM インスタンスプロフィール`に次を設定します。

```text
LabInstanceProfile
```

インスタンスが`実行中`になり、ステータスチェックが通るまで待ちます。

---

## Step 2：Session Managerで接続する

1. `rails-dojo-week11-stretch` へチェックを入れます。
2. `接続` をクリックします。
3. `SSM Session Manager` タブを開きます。
4. `接続` をクリックします。

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
mise use -g ruby@4.0.2
```

Rubyを確認します。

```bash
ruby -v
```

Bundlerをインストールします。

```bash
gem install bundler -v 4.0.6
```

Bundlerを確認します。

```bash
bundle -v
```

---

## Step 4：Railsアプリをcloneして起動する

Railsアプリをcloneします。

```bash
git clone https://github.com/TORIFUKUKaiou/rails-dojo-git-practice.git
```

ディレクトリへ移動します。

```bash
cd rails-dojo-git-practice
```

Gemをインストールします。

```bash
bundle install
```

データベースを準備します。

```bash
bin/rails db:prepare
```

Rails serverを起動します。

```bash
bin/rails server -b 0.0.0.0 -p 3000
```

次のような表示が出れば、Rails serverが起動しています。

```text
* Listening on http://0.0.0.0:3000
```

---

## Step 5：EC2の3000番を開けて表示する

Practiceと同じように、EC2用セキュリティグループのインバウンドルールへ次を追加します。

| 項目 | 設定 |
|---|---|
| タイプ | カスタムTCP |
| ポート範囲 | `3000` |
| ソース | `Anywhere-IPv4` |

ブラウザで次の形式のURLを開きます。

```text
http://EC2のパブリックIPアドレス:3000
```

`CodeShelf` が表示されれば成功です。

---

## Step 6：ALBを追加する

Practiceの手順を見ながら、次を作成します。

- ALB用セキュリティグループ
- ターゲットグループ
- ALB
- HTTP 80のリスナー

ターゲットグループのヘルスチェックパスは、次にします。

```text
/up
```

ターゲットが `Healthy` になったら、ALBのDNS名で開きます。

```text
http://ALBのDNS名
```

`CodeShelf` が表示されれば成功です。

---

## Step 7：EC2への直接アクセスを閉じる

EC2用セキュリティグループを変更します。

1. `3000 / Anywhere-IPv4` のルールを削除します。
2. `3000 / ALB用セキュリティグループ` のルールを追加します。

そのあと、次の2つを確認します。

| URL | 結果 |
|---|---|
| `http://ALBのDNS名` | 表示される |
| `http://EC2のパブリックIPアドレス:3000` | 表示されない |

表示されるものと表示されないものを先生に説明してください。

---

## Step 8：リソースを残してStretch 2へ進む

Stretch 1で作成したALB構成は、Stretch 2でそのまま使います。

---

## Stretch 2：ALBのヘルスチェックを観察する

この課題では、ALBがRailsアプリの状態をどう見ているか確認します。

PracticeまたはStretch 1で作ったALB構成を使います。

---

## Step 1：ターゲットがHealthyであることを確認する

1. EC2の左メニューから `ターゲットグループ` を開きます。
2. 使用しているターゲットグループをクリックします。
3. `ターゲット` タブを開きます。
4. EC2の状態が `Healthy` であることを確認します。

---

## Step 2：Rails serverを停止する

Session Managerのターミナルへ戻ります。

Rails serverが動いている画面で、次のキーを押します。

```text
Ctrl + C
```

プロンプトが戻ってくれば、Rails serverは停止しています。

---

## Step 3：Unhealthyになることを確認する

ターゲットグループの画面へ戻ります。

数分待ってから、ターゲットの状態を確認します。

次のようになれば、ALBがRails server停止を検知しています。

```text
Unhealthy
```

> [!NOTE]
> すぐには変わらない場合があります。
> ヘルスチェックは一定間隔で行われるため、数分待ってから更新してください。

---

## Step 4：Rails serverを再起動する

Session Managerで、Railsアプリのディレクトリへ移動します。

```bash
cd ~/rails-dojo-git-practice
```

Rails serverを起動します。

```bash
bin/rails server -b 0.0.0.0 -p 3000
```

---

## Step 5：Healthyに戻ることを確認する

ターゲットグループの画面へ戻ります。

数分待ってから、ターゲットの状態を確認します。

次のようになれば成功です。

```text
Healthy
```

ALBのDNS名でも、Railsアプリが表示されることを確認してください。

---

## Step 6：Stretch 1とStretch 2で作成したリソースを削除する

Stretch 2の確認が終わったら、作成したリソースを削除します。

削除する順番は次です。

1. ALB
2. ターゲットグループ
3. ALB用セキュリティグループ
4. EC2インスタンス

> [!IMPORTANT]
> 不要なAWSリソースは、演習が終わったら削除します。
> ALBやEC2を残したままにしないでください。

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
- 授業で作ったRailsアプリやAWS構成の紹介

面白いものができたら、公開URLを先生に見せてください。

Orientationで扱っていない内容も含まれます。

分からないところは、検索したり、生成AIに相談したりしながら進めて構いません。

---

## Stretchの確認

次の項目を確認してください。

- [ ] CloudFormationを使わずにEC2を作成できた
- [ ] Session ManagerでEC2へ接続できた
- [ ] EC2上でRailsアプリを起動できた
- [ ] EC2のIPアドレス`:3000`でRailsアプリを表示できた
- [ ] ALB用セキュリティグループを作成できた
- [ ] ターゲットグループを作成できた
- [ ] ALBを作成できた
- [ ] ALBのDNS名からRailsアプリを表示できた
- [ ] EC2の3000番をALBからだけ許可する設定へ変更できた
- [ ] Rails server停止でターゲットがUnhealthyになることを確認できた
- [ ] Rails server再起動でターゲットがHealthyに戻ることを確認できた
- [ ] Kiro CLIの演習では、自分で考えたプロンプトを使った

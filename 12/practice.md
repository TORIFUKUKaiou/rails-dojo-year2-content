# 第12週：練習 ── RDS PostgreSQLへデータを保存する

この練習では、EC2上のRailsをRDS PostgreSQLへ接続し、productionモードで公開します。

先に、[第12週の説明](orientation.md)を読んでください。

## この練習で行うこと

このPracticeは2周します。

### 1周目

- CloudFormationでVPC、EC2、ALBまで作成する
- DB Subnet Group、RDS、RDS用セキュリティグループを手動で作成する
- Railsをproductionモードで起動し、RDSへデータを保存する
- ALB経由だけでRailsへ接続できる状態にする

### 2周目

- デフォルトVPCを使い、EC2、ALB、RDSを手動で作成する
- 1周目と同じ完成状態をもう一度作る

> [!IMPORTANT]
> RDS、ALB、EC2は、起動している間AWSの利用料金が発生するリソースです。
> 各周の確認が終わったら、教材の手順どおりに削除してください。

---

# 1周目：CloudFormationからRDS接続まで

## Step 1：AWS Academy Sandboxを起動する

1. AWS Academyへログインします。
2. 対象コースの`サンドボックス ラボ`を開きます。
3. `Start Lab`をクリックします。
4. `Lab status`が`ready`になるまで待ちます。
5. `AWS`をクリックし、AWSマネジメントコンソールを開きます。
6. 画面右上のリージョンを確認します。

使用するリージョンは次です。

```text
米国（バージニア北部）
us-east-1
```

---

## Step 2：CloudFormationテンプレートを開く

次のテンプレートをダウンロードします。

[week12-baseline.yaml](infrastructure/week12-baseline.yaml)

このテンプレートが作るものは次のとおりです。

- VPC
- public subnet 2つ
- private subnet 2つ
- Internet Gatewayとroute table
- EC2用セキュリティグループ
- ALB用セキュリティグループ
- Ubuntu 26.04 LTSのEC2と16GBのEBS
- ターゲットグループ
- ALBとHTTP 80リスナー

次のものは作成しません。このあと自分で作成します。

- DB Subnet Group
- RDS PostgreSQL
- RDS用セキュリティグループ

---

## Step 3：CloudFormationスタックを作成する

1. AWSコンソール上部の検索欄で`CloudFormation`を検索します。
2. CloudFormationを開きます。
3. `スタックの作成`から`新しいリソースを使用`を選びます。
4. `テンプレートファイルのアップロード`を選びます。
5. ダウンロードした`week12-baseline.yaml`を指定します。
6. `次へ`をクリックします。

スタック名は次にします。

```text
rails-dojo-week12
```

ほかの項目は変更せずに進み、最後に`送信`または`スタックの作成`をクリックします。

---

## Step 4：スタックの作成完了と出力を確認する

スタックの状態が次になるまで待ちます。

```text
CREATE_COMPLETE
```

`出力`タブを開き、次の値が表示されていることを確認します。

| 出力キー | あとで使う場所 |
|---|---|
| `VpcId` | RDS用SG、DB Subnet Group |
| `PrivateSubnet1Id` | DB Subnet Group |
| `PrivateSubnet2Id` | DB Subnet Group |
| `Ec2InstanceId` | Session Manager |
| `Ec2PublicIp` | EC2への直接アクセス |
| `Ec2SecurityGroupId` | RDS用SGの接続元 |
| `AlbDnsName` | ALB経由のアクセス |

ブラウザの別タブで出力を残しておいてください。

---

## Step 5：Session ManagerでEC2へ接続する

1. EC2の`インスタンス`を開きます。
2. `rails-dojo-week12`を選びます。
3. `接続`をクリックします。
4. `Session Manager`タブを開きます。
5. `接続`をクリックします。

現在のユーザーを確認します。

```bash
whoami
```

`ubuntu`ユーザーへ切り替えます。

```bash
sudo su - ubuntu
```

次の2つを実行します。

```bash
whoami
```

```bash
pwd
```

次のように表示されれば成功です。

```text
ubuntu
/home/ubuntu
```

---

## Step 6：User Dataの完了を確認する

cloud-initの状態を確認します。

```bash
sudo cloud-init status
```

次の表示になれば初期処理は完了しています。

```text
status: done
```

完了確認ファイルも確認します。

```bash
ls /opt/rails-dojo/setup-complete
```

次のように表示されれば成功です。

```text
/opt/rails-dojo/setup-complete
```

> [!IMPORTANT]
> `status: running`の場合は1〜2分待って、もう一度確認します。
> `status: error`の場合は`sudo tail -n 80 /var/log/cloud-init-output.log`を実行し、教員へ画面を見せてください。

---

## Step 7：インストール済みの道具を確認する

User Dataでは、OSのパッケージ、mise、Ruby、Bundler、PostgreSQLクライアントまでをインストールしました。

設定を読み込みます。

```bash
source ~/.bashrc
```

次を順に確認します。

```bash
ruby -v
```

```bash
bundle -v
```

```bash
git --version
```

```bash
psql --version
```

すべてでバージョン番号が表示されれば成功です。

User Dataは、次の操作を行っていません。

- Railsアプリのclone
- Gemのインストール
- RDSの作成や接続設定
- migration
- Rails serverの起動

ここからはSession Managerで自分で操作します。

---

## Step 8：Railsアプリをcloneする

```bash
git clone https://github.com/TORIFUKUKaiou/rails-dojo-git-practice.git
```

```bash
cd rails-dojo-git-practice
```

```bash
pwd
```

次のように表示されれば成功です。

```text
/home/ubuntu/rails-dojo-git-practice
```

---

## Step 9：Gemをインストールする

```bash
bundle install
```

数分かかる場合があります。最後にエラーが出ず、プロンプトへ戻れば成功です。

---

## Step 10：productionモードの疎通だけを確認する

RDSはまだ作成していないため、データを使う画面は正常に表示できません。

ここでは、Railsがproductionモードで起動し、ヘルスチェック用の`/up`へ応答できることだけを確認します。

```bash
SECRET_KEY_BASE_DUMMY=1 RAILS_ENV=production bin/rails server -b 0.0.0.0 -p 3000
```

次のような表示が出れば、Rails serverが起動しています。

```text
* Listening on http://0.0.0.0:3000
```

ブラウザで次を開きます。

```text
http://EC2のパブリックIPアドレス:3000/up
```

`EC2のパブリックIPアドレス`には、CloudFormationの出力`Ec2PublicIp`を入れます。

正常な応答が表示されれば、EC2の3000番まで通信が届いています。

確認後、Rails serverを起動したターミナルで`Ctrl + C`を押します。

> [!IMPORTANT]
> このStepではアプリの一覧画面や登録画面を確認しません。
> RDS接続前なので、データベースを使う画面でエラーが出る可能性があります。

---

## Step 11：RDS用セキュリティグループを作成する

1. EC2の左メニューから`セキュリティグループ`を開きます。
2. `セキュリティグループを作成`をクリックします。
3. 次の内容を入力します。

| 項目 | 設定 |
|---|---|
| セキュリティグループ名 | `rails-dojo-week12-rds-sg` |
| 説明 | `Allow PostgreSQL from Week 12 EC2` |
| VPC | CloudFormationで作成した`rails-dojo-week12-vpc` |

インバウンドルールを追加します。

| 項目 | 設定 |
|---|---|
| タイプ | PostgreSQL |
| ポート | `5432` |
| ソース | CloudFormationで作成した`rails-dojo-week12-ec2-sg` |

`Anywhere-IPv4`は選びません。

作成後、セキュリティグループIDを控えます。

---

## Step 12：DB Subnet Groupを作成する

1. AWSコンソールで`RDS`を検索して開きます。
2. 左メニューから`サブネットグループ`を開きます。
3. `DBサブネットグループを作成`をクリックします。
4. 次の内容を入力します。

| 項目 | 設定 |
|---|---|
| 名前 | `rails-dojo-week12-db-subnet-group` |
| 説明 | `Private subnets for Rails Dojo Week 12` |
| VPC | `rails-dojo-week12-vpc` |

Availability Zoneとsubnetでは、CloudFormationで作成した次の2つを追加します。

- `rails-dojo-week12-private-subnet-1`
- `rails-dojo-week12-private-subnet-2`

2つが異なるAvailability Zoneにあることを確認し、DB Subnet Groupを作成します。

---

## Step 13：RDS PostgreSQLを作成する

1. RDSの左メニューから`データベース`を開きます。
2. `データベースの作成`をクリックします。
3. `標準作成`を選びます。
4. エンジンに`PostgreSQL`を選びます。
5. 画面で選択可能な標準のPostgreSQLバージョンを使います。

次の値を入力します。

| 項目 | 設定 |
|---|---|
| DBインスタンス識別子 | `rails-dojo-week12-db` |
| マスターユーザー名 | `rails_dojo` |
| マスターパスワード | `RailsDojo2026Db` |
| DBインスタンスクラス | 選択できる小さいクラス |
| 初期データベース名 | `rails_dojo_production` |

接続設定は次のようにします。

| 項目 | 設定 |
|---|---|
| VPC | `rails-dojo-week12-vpc` |
| DB Subnet Group | `rails-dojo-week12-db-subnet-group` |
| Public access | `No` |
| VPC security group | `rails-dojo-week12-rds-sg`のみ |
| ポート | `5432` |

不要な追加機能は有効にせず、データベースを作成します。

> [!IMPORTANT]
> `Public access`は必ず`No`にします。
> パスワードはこの授業用の固定値です。実際のサービスでは、教材に固定パスワードを書いて共有する運用はしません。

---

## Step 14：RDSの作成完了とendpointを確認する

RDSの状態が次になるまで待ちます。

```text
Available
```

作成した`rails-dojo-week12-db`を開き、`接続とセキュリティ`からendpointをコピーします。

endpointは次のような文字列です。

```text
rails-dojo-week12-db.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com
```

ポートが`5432`、Public accessが`No`になっていることも確認します。

---

## Step 15：EC2からpsqlで接続する

Session Managerへ戻ります。

次のコマンドの`RDSのendpoint`を、コピーした値へ置き換えて実行します。

```bash
psql -h RDSのendpoint -U rails_dojo -d rails_dojo_production
```

パスワードを求められたら、次を入力します。入力中の文字は画面に表示されません。

```text
RailsDojo2026Db
```

次のようなプロンプトになれば、EC2からRDSへ接続できています。

```text
rails_dojo_production=>
```

接続先を確認します。

```sql
\conninfo
```

psqlを終了します。

```sql
\q
```

---

## Step 16：RDS接続用の環境変数を設定する

次の`RDSのendpoint`だけを自分の値へ置き換えます。

```bash
export DATABASE_URL='postgresql://rails_dojo:RailsDojo2026Db@RDSのendpoint:5432/rails_dojo_production'
```

productionモードも設定します。

```bash
export RAILS_ENV=production
```

productionモードで署名に使う秘密値を生成し、このターミナルの環境変数へ設定します。

```bash
export SECRET_KEY_BASE="$(bin/rails secret)"
```

設定された変数名を確認します。パスワードを画面へ表示する必要はありません。

```bash
env | grep -E '^(DATABASE_URL|RAILS_ENV|SECRET_KEY_BASE)=' | cut -d= -f1
```

次の3行が表示されれば成功です。

```text
DATABASE_URL
RAILS_ENV
SECRET_KEY_BASE
```

> [!WARNING]
> `echo $DATABASE_URL`を実行すると、パスワードも画面へ表示されます。
> 今回は値全体を表示せず、変数名だけを確認します。

---

## Step 17：production用データベースを準備する

Railsアプリのディレクトリにいることを確認します。

```bash
pwd
```

次を実行します。

```bash
bin/rails db:prepare
```

エラーが出ず、プロンプトへ戻ればmigrationまで完了しています。

テーブルができたことをRailsから確認します。

```bash
bin/rails runner 'puts ActiveRecord::Base.connection.adapter_name'
```

次のように表示されれば、PostgreSQLへ接続しています。

```text
PostgreSQL
```

---

## Step 18：Railsをproductionモードで起動する

```bash
bin/rails server -b 0.0.0.0 -p 3000
```

次のような表示が出れば起動しています。

```text
* Environment: production
* Listening on http://0.0.0.0:3000
```

このターミナルはRails serverが使います。起動したまま、ブラウザへ移ります。

---

## Step 19：EC2へ直接アクセスしてデータを登録する

ブラウザで次を開きます。

```text
http://EC2のパブリックIPアドレス:3000
```

`CodeShelf`が表示されることを確認します。

画面から記事を1件登録します。あとでRDS上でも確認できるよう、タイトルを次にします。

```text
RDSで保存する記事
```

本文も入力して記事を公開し、一覧に`RDSで保存する記事`が表示されることを確認します。

---

## Step 20：RDSにデータが保存されたことを確認する

Rails serverを止めずに、新しいSession Manager接続をもう一つ開きます。

新しいターミナルで`ubuntu`ユーザーへ切り替えます。

```bash
sudo su - ubuntu
```

次の`RDSのendpoint`を置き換えて接続します。

```bash
psql -h RDSのendpoint -U rails_dojo -d rails_dojo_production
```

パスワード`RailsDojo2026Db`を入力します。

テーブルを確認します。

```sql
\dt
```

アプリの記事を保存するテーブルから、登録したタイトルを確認します。

```sql
SELECT title FROM articles ORDER BY id DESC LIMIT 5;
```

`RDSで保存する記事`が表示されれば、ブラウザから登録したデータがRDSへ保存されています。

確認後、psqlを終了します。

```sql
\q
```

---

## Step 21：ALBのターゲットを確認する

1. EC2の左メニューから`ターゲットグループ`を開きます。
2. `rails-dojo-week12-tg`を開きます。
3. `ターゲット`タブを開きます。

Rails server起動後、数分待つと状態が次になります。

```text
Healthy
```

`Unhealthy`の場合は、Rails serverが起動しているか、`/up`へ応答しているかを確認します。

---

## Step 22：ALBのDNS名から表示する

CloudFormationの出力`AlbDnsName`を使い、ブラウザで次を開きます。

```text
http://ALBのDNS名
```

確認する内容は次です。

- `CodeShelf`が表示される
- 登録した`RDSで保存する記事`が表示される

---

## Step 23：EC2への直接アクセスを閉じる

1. EC2の`セキュリティグループ`を開きます。
2. `rails-dojo-week12-ec2-sg`を開きます。
3. `インバウンドルールを編集`をクリックします。
4. 次のルールを削除します。

| ポート | ソース |
|---|---|
| `3000` | `0.0.0.0/0` |

次のルールは残します。

| ポート | ソース |
|---|---|
| `3000` | `rails-dojo-week12-alb-sg` |

変更を保存します。

---

## Step 24：2つのURLの結果を比べる

まず、ALB経由で再読み込みします。

```text
http://ALBのDNS名
```

引き続き表示されれば成功です。

次に、EC2へ直接アクセスします。

```text
http://EC2のパブリックIPアドレス:3000
```

接続できなければ成功です。

| 接続 | 結果 |
|---|---|
| ブラウザ → ALB → EC2 | 表示される |
| ブラウザ → EC2:3000 | 表示されない |
| EC2 → RDS:5432 | 接続できる |

---

## Step 25：1周目のリソースを削除する

Rails serverのターミナルで`Ctrl + C`を押します。

次の順番で削除します。

1. RDSの`rails-dojo-week12-db`を削除する
2. 最終スナップショットを作成しない設定を選ぶ
3. RDSが削除されるまで待つ
4. DB Subnet Groupの`rails-dojo-week12-db-subnet-group`を削除する
5. RDS用SGの`rails-dojo-week12-rds-sg`を削除する
6. CloudFormationスタック`rails-dojo-week12`を削除する

> [!IMPORTANT]
> RDSが残っている間は、DB Subnet GroupやRDS用SGを削除できない場合があります。
> RDSの状態が一覧から消えてから、次を削除してください。

CloudFormationスタックが一覧から消えたら、1周目は完了です。

---

# 2周目：デフォルトVPCで手動構築する

2周目は、CloudFormationを使いません。

デフォルトVPCを使い、EC2、ALB、RDSを手動で作ります。第10週、第11週、1周目の手順も参照して進めてください。

各Stepのチェックをすべて確認してから次へ進みます。

## Step 26：デフォルトVPCを確認する

VPCの画面を開き、`default`と表示されるVPCを確認します。

- [ ] デフォルトVPCのVPC IDを控えた
- [ ] 異なるAvailability Zoneのsubnetを2つ以上確認した
- [ ] 以降のEC2、ALB、RDSで同じデフォルトVPCを選ぶ

---

## Step 27：EC2を手動で作成する

次の設定でEC2を作成します。

| 項目 | 設定 |
|---|---|
| 名前 | `rails-dojo-week12-round2` |
| AMI | Ubuntu Server 26.04 LTS |
| インスタンスタイプ | `t3.medium` |
| キーペア | なし |
| VPC | デフォルトVPC |
| subnet | パブリックIPv4を割り当てられるsubnet |
| パブリックIPの自動割り当て | 有効 |
| ストレージ | 16GB gp3 |
| IAMインスタンスプロフィール | `LabInstanceProfile` |

EC2用SGは新しく作成し、名前を次にします。

```text
rails-dojo-week12-round2-ec2-sg
```

最初は3000番を`Anywhere-IPv4`から許可します。SSH 22番は追加しません。

- [ ] EC2が`実行中`になった
- [ ] ステータスチェックに合格した
- [ ] パブリックIPv4アドレスを控えた
- [ ] Session Managerで接続できた

---

## Step 28：EC2の環境を手動で準備する

Session Managerで接続し、`ubuntu`ユーザーへ切り替えます。

```bash
sudo su - ubuntu
```

第11週Stretchの環境構築手順を参照し、次を自分でインストールします。

- Git、curl、ビルドに必要なパッケージ
- `libpq-dev`
- `postgresql-client`
- mise
- Ruby 4.0.2
- Bundler 4.0.6

必要なOSパッケージには、少なくとも次を含めます。

```bash
sudo apt update
```

```bash
sudo apt install -y git curl build-essential autoconf libssl-dev libyaml-dev zlib1g-dev libffi-dev libgmp-dev libreadline-dev libpq-dev postgresql-client rustc pkg-config
```

miseをインストールします。

```bash
curl https://mise.run | sh
```

```bash
echo 'eval "$($HOME/.local/bin/mise activate bash)"' >> ~/.bashrc
```

```bash
source ~/.bashrc
```

RubyとBundlerをインストールします。

```bash
mise settings ruby.compile=false
```

```bash
mise use -g ruby@4.0.2
```

```bash
gem install bundler -v 4.0.6
```

インストール後に確認します。

```bash
ruby -v
```

```bash
bundle -v
```

```bash
psql --version
```

- [ ] Ruby 4.0.2が表示された
- [ ] Bundler 4.0.6が表示された
- [ ] PostgreSQLクライアントのバージョンが表示された

---

## Step 29：Railsアプリを準備する

1周目と同じリポジトリをcloneします。

```bash
git clone https://github.com/TORIFUKUKaiou/rails-dojo-git-practice.git
```

```bash
cd rails-dojo-git-practice
```

```bash
bundle install
```

RDS接続前は、次のコマンドでproductionの`/up`だけを起動して確認します。

```bash
SECRET_KEY_BASE_DUMMY=1 RAILS_ENV=production bin/rails server -b 0.0.0.0 -p 3000
```

確認URL：

```text
http://2周目のEC2パブリックIP:3000/up
```

確認後、`Ctrl + C`で停止します。

- [ ] `/up`が応答した
- [ ] EC2の3000番まで通信が届くことを確認した

---

## Step 30：ALBを手動で作成する

第11週Practiceを参照し、次を作成します。

### ALB用SG

| 項目 | 設定 |
|---|---|
| 名前 | `rails-dojo-week12-round2-alb-sg` |
| VPC | デフォルトVPC |
| インバウンド | HTTP 80 / Anywhere-IPv4 |

### ターゲットグループ

| 項目 | 設定 |
|---|---|
| 名前 | `rails-dojo-week12-round2-tg` |
| ターゲットタイプ | Instances |
| プロトコルとポート | HTTP / 3000 |
| VPC | デフォルトVPC |
| ヘルスチェックパス | `/up` |
| 登録するターゲット | 2周目のEC2 |

### ALB

| 項目 | 設定 |
|---|---|
| 名前 | `rails-dojo-week12-round2-alb` |
| スキーム | Internet-facing |
| VPC | デフォルトVPC |
| subnet | 異なるAZから2つ |
| セキュリティグループ | 2周目のALB用SG |
| リスナー | HTTP 80 |
| 転送先 | 2周目のターゲットグループ |

EC2用SGには、ALB用SGをソースにした3000番のルールも追加します。この時点では直接接続確認用の`Anywhere-IPv4`ルールも残します。

- [ ] ALBのDNS名を控えた
- [ ] ALBからEC2へ3000番で通信できるSG設定にした

---

## Step 31：DB Subnet GroupとRDS用SGを作成する

### RDS用SG

| 項目 | 設定 |
|---|---|
| 名前 | `rails-dojo-week12-round2-rds-sg` |
| VPC | デフォルトVPC |
| インバウンド | PostgreSQL 5432 / 2周目のEC2用SG |

### DB Subnet Group

| 項目 | 設定 |
|---|---|
| 名前 | `rails-dojo-week12-round2-db-subnet-group` |
| VPC | デフォルトVPC |
| subnet | 異なるAZから2つ以上 |

デフォルトVPCのsubnetを使いますが、RDS作成時の`Public access`は`No`にします。

- [ ] RDS用SGのソースがEC2用SGになっている
- [ ] `0.0.0.0/0`から5432番を許可していない
- [ ] DB Subnet Groupに異なるAZのsubnetが入っている

---

## Step 32：2周目のRDSを作成する

| 項目 | 設定 |
|---|---|
| エンジン | PostgreSQL |
| DBインスタンス識別子 | `rails-dojo-week12-round2-db` |
| マスターユーザー名 | `rails_dojo` |
| マスターパスワード | `RailsDojo2026Db` |
| 初期データベース名 | `rails_dojo_production` |
| VPC | デフォルトVPC |
| DB Subnet Group | 2周目に作成したもの |
| Public access | `No` |
| VPC security group | 2周目のRDS用SGのみ |
| ポート | `5432` |

作成後、状態が`Available`になるまで待ち、endpointを控えます。

- [ ] Public accessが`No`になっている
- [ ] endpointとポート5432を確認した

---

## Step 33：RailsをRDSへ接続する

まず`psql`で接続します。

```bash
psql -h 2周目のRDSのendpoint -U rails_dojo -d rails_dojo_production
```

パスワードを入力し、接続できたら`\q`で終了します。

1周目と同じ3つの環境変数を設定します。

```bash
export DATABASE_URL='postgresql://rails_dojo:RailsDojo2026Db@2周目のRDSのendpoint:5432/rails_dojo_production'
```

```bash
export RAILS_ENV=production
```

```bash
export SECRET_KEY_BASE="$(bin/rails secret)"
```

データベースを準備し、Rails serverを起動します。

```bash
bin/rails db:prepare
```

```bash
bin/rails runner 'puts ActiveRecord::Base.connection.adapter_name'
```

```bash
bin/rails server -b 0.0.0.0 -p 3000
```

- [ ] `PostgreSQL`と表示された
- [ ] productionモードでRailsが起動した

---

## Step 34：2周目の完成状態を確認する

次を順番に確認します。

1. EC2のIPアドレス`:3000`で`CodeShelf`を表示する
2. `2周目にRDSへ保存`というタイトルと任意の本文で記事を登録する
3. ターゲットグループが`Healthy`になるまで待つ
4. ALBのDNS名で同じ記事が表示されることを確認する
5. EC2用SGから`3000 / Anywhere-IPv4`を削除する
6. ALBのDNS名では引き続き表示されることを確認する
7. EC2のIPアドレス`:3000`では接続できないことを確認する

新しいSession Manager接続からpsqlを使い、RDS上のデータも確認します。

```sql
SELECT title FROM articles ORDER BY id DESC LIMIT 5;
```

- [ ] `2周目にRDSへ保存`が表示された
- [ ] ALB経由では表示された
- [ ] EC2直アクセスでは表示されなかった
- [ ] EC2からRDSへ接続できた

---

## Step 35：2周目のリソースを削除する

Rails serverを`Ctrl + C`で停止します。

次の順番で削除します。

1. `rails-dojo-week12-round2-alb`
2. `rails-dojo-week12-round2-tg`
3. `rails-dojo-week12-round2-db`
4. RDSが削除されるまで待つ
5. `rails-dojo-week12-round2-db-subnet-group`
6. `rails-dojo-week12-round2-rds-sg`
7. `rails-dojo-week12-round2` EC2インスタンス
8. `rails-dojo-week12-round2-alb-sg`
9. `rails-dojo-week12-round2-ec2-sg`

デフォルトVPCと最初から存在していたsubnetは削除しません。

> [!IMPORTANT]
> 自分で作成したリソースだけを削除します。
> デフォルトVPC、デフォルトsubnet、デフォルトセキュリティグループは削除しません。

---

## トラブルシューティング

### Session Managerで接続できない

- EC2へ`LabInstanceProfile`を設定したか
- EC2が`実行中`か
- ステータスチェックに合格しているか
- public subnetにあり、インターネットへ通信できるか

### `psql`でRDSへ接続できない

- EC2とRDSが同じVPCにあるか
- endpointを正しくコピーしたか
- RDSの状態が`Available`か
- RDS用SGで5432番を許可しているか
- RDS用SGのソースがEC2用SGになっているか
- DB名、ユーザー名、パスワードが教材の値と一致しているか

### `bin/rails db:prepare`が失敗する

- `DATABASE_URL`のendpointを置き換えたか
- URLの前後をシングルクォートで囲んでいるか
- `libpq-dev`を入れてから`bundle install`したか
- `psql`では同じendpointへ接続できるか

### ALBのターゲットがUnhealthyになる

- Rails serverが起動したままか
- Railsが`0.0.0.0:3000`で待ち受けているか
- ヘルスチェックパスが`/up`か
- EC2用SGでALB用SGから3000番を許可しているか

### ALBでは表示できるがデータ登録でエラーになる

- Rails serverを起動したターミナルに`DATABASE_URL`が設定されているか
- `RAILS_ENV=production`で`db:prepare`を実行したか
- RDSが`Available`か
- Rails serverのターミナルに表示されたエラーを確認したか

---

## 今日の確認

- [ ] 1周目でCloudFormationスタックを作成した
- [ ] User DataがRuby、Bundler、PostgreSQLクライアントまで準備したことを確認した
- [ ] 異なるAZのprivate subnetでDB Subnet Groupを作成した
- [ ] Public accessが`No`のRDS PostgreSQLを作成した
- [ ] RDS用SGでEC2用SGからの5432番だけを許可した
- [ ] `psql`でEC2からRDSへ接続した
- [ ] Railsをproductionモードで起動した
- [ ] ブラウザから登録したデータをRDS上で確認した
- [ ] ALB経由では表示でき、EC2直アクセスでは表示できない状態にした
- [ ] 1周目のRDSとCloudFormationスタックを削除した
- [ ] 2周目でEC2、ALB、RDSを手動作成した
- [ ] 2周目でもデータ保存と通信制限を確認した
- [ ] 2周目に作成した課金対象リソースを削除した

Practiceが終わったら、[Stretch](stretch.md)へ進みましょう。

# 第12週：練習 ── 2台のRailsからRDS PostgreSQLを使う

この練習では、異なるAvailability Zoneにある2台のEC2から、同じRDS PostgreSQLへ接続します。

先に、[第12週の説明](orientation.md)を読んでください。

## この練習で行うこと

- CloudFormationでVPC、EC2 2台、ALBを作成する
- RDS用セキュリティグループとDB Subnet Groupを作成する
- Single-AZのRDS PostgreSQLを作成する
- 2台のEC2へ同じRailsアプリを準備する
- 2台へ同じ環境変数を設定する
- production用アセットを準備し、Railsを起動する
- 2台から同じ記事を表示できることを確認する
- EC2を1台停止しても利用を続けられることを確認する

完成すると、次の構成になります。

```mermaid
flowchart LR
  U["利用者"] --> ALB["ALB"]
  ALB --> EC21["Availability Zone 1<br>EC2 1 / Rails"]
  ALB --> EC22["Availability Zone 2<br>EC2 2 / Rails"]
  EC21 --> RDS["RDS PostgreSQL<br>共通のデータベース"]
  EC22 --> RDS
```

> [!IMPORTANT]
> AWS Academyの制限があるため、この練習ではSingle-AZのRDSを作成します。
> RDSのMulti-AZ構成は作成しません。

---

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

このテンプレートは、次のリソースを作成します。

- VPC
- public subnet 2つ
- private subnet 2つ
- Internet Gatewayとroute table
- Ubuntu 26.04 LTSのEC2 2台
- EC2用セキュリティグループ
- ALB用セキュリティグループ
- ターゲットグループ
- ALBとHTTP 80リスナー

2台のEC2は異なるAvailability Zoneに作成されます。

次のリソースは、このあとAWSマネジメントコンソールから作成します。

- RDS用セキュリティグループ
- DB Subnet Group
- RDS PostgreSQL

---

## Step 3：CloudFormationスタックを作成する

1. AWSマネジメントコンソールで`CloudFormation`を開きます。
2. `スタックの作成`から`新しいリソースを使用`を選びます。
3. `テンプレートファイルのアップロード`を選びます。
4. `week12-baseline.yaml`を指定します。
5. `次へ`をクリックします。

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

`出力`タブを開き、次の値を確認します。

| 出力キー | あとで使う場所 |
|---|---|
| `VpcId` | RDS用SG、DB Subnet Group |
| `PrivateSubnet1Id` | DB Subnet Group |
| `PrivateSubnet2Id` | DB Subnet Group |
| `Ec2Instance1Id` | 1台目の確認 |
| `Ec2Instance1PublicIp` | 1台目への直接アクセス |
| `Ec2Instance2Id` | 2台目の確認 |
| `Ec2Instance2PublicIp` | 2台目への直接アクセス |
| `Ec2SecurityGroupId` | RDS用SGの接続元 |
| `AlbDnsName` | ALB経由のアクセス |

この画面は、あとで値を確認できるように開いたままにします。

> [!NOTE]
> この時点ではRails serverが起動していないため、ターゲットグループの2台は`Unhealthy`になります。
> これは想定どおりの状態です。

---

## Step 5：RDS用セキュリティグループを作成する

1. EC2の左メニューから`セキュリティグループ`を開きます。
2. `セキュリティグループを作成`をクリックします。
3. 次の内容を入力します。

| 項目 | 設定 |
|---|---|
| セキュリティグループ名 | `rails-dojo-week12-rds-sg` |
| 説明 | `Allow PostgreSQL from Week 12 EC2` |
| VPC | `rails-dojo-week12-vpc` |

インバウンドルールを追加します。

| 項目 | 設定 |
|---|---|
| タイプ | PostgreSQL |
| ポート | `5432` |
| ソース | `rails-dojo-week12-ec2-sg` |

`Anywhere-IPv4`は選びません。

2台のEC2は同じEC2用セキュリティグループを使っています。そのため、このルールで2台からRDSへ接続できます。

---

## Step 6：DB Subnet Groupを作成する

1. AWSマネジメントコンソールで`RDS`を開きます。
2. 左メニューから`サブネットグループ`を開きます。
3. `DBサブネットグループを作成`をクリックします。
4. 次の内容を入力します。

| 項目 | 設定 |
|---|---|
| 名前 | `rails-dojo-week12-db-subnet-group` |
| 説明 | `Private subnets for Rails Dojo Week 12` |
| VPC | `rails-dojo-week12-vpc` |

CloudFormationで作成した次の2つのsubnetを追加します。

- `rails-dojo-week12-private-subnet-1`
- `rails-dojo-week12-private-subnet-2`

2つが異なるAvailability Zoneにあることを確認し、DB Subnet Groupを作成します。

---

## Step 7：Single-AZのRDS PostgreSQLを作成する

1. RDSの左メニューから`データベース`を開きます。
2. `データベースの作成`をクリックします。
3. `標準作成`を選びます。
4. エンジンに`PostgreSQL`を選びます。
5. エンジンバージョンは、PostgreSQL 18を選びます。

次の値を入力します。

| 項目 | 設定 |
|---|---|
| 可用性と耐久性 | Single DB instance / スタンバイを作成しない |
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

設定を確認し、データベースを作成します。

> [!IMPORTANT]
> `Public access`は必ず`No`にします。
> Multi-AZやスタンバイを作成する選択肢は選びません。

> [!NOTE]
> パスワードは、この授業だけで使う固定値です。
> 実際のサービスでは、パスワードを教材やGit管理されるファイルへ書きません。

---

## Step 8：RDSの作成完了とendpointを確認する

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

## Step 9：EC2が異なるAvailability Zoneにあることを確認する

1. EC2の`インスタンス`を開きます。
2. `rails-dojo-week12-1`と`rails-dojo-week12-2`を探します。
3. 2台とも`実行中`になるまで待ちます。
4. 2台の`Availability Zone`を比べます。

次のようにAvailability Zoneが異なっていれば成功です。

```text
rails-dojo-week12-1   us-east-1a
rails-dojo-week12-2   us-east-1b
```

実際に表示されるAvailability Zoneは、この例と異なる場合があります。

---

## Step 10：1台目へSession Managerで接続する

1. `rails-dojo-week12-1`を選びます。
2. `接続`をクリックします。
3. `Session Manager`タブを開きます。
4. `接続`をクリックします。

`ubuntu`ユーザーへ切り替えます。

```bash
sudo su - ubuntu
```

現在のユーザーと場所を確認します。

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

このタブは、1台目の操作に使います。

---

## Step 11：1台目のUser Data完了を確認する

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

## Step 12：2台目へSession Managerで接続する

EC2のインスタンス一覧を別タブで開きます。

1. `rails-dojo-week12-2`を選びます。
2. `接続`をクリックします。
3. `Session Manager`タブを開きます。
4. `接続`をクリックします。

`ubuntu`ユーザーへ切り替えます。

```bash
sudo su - ubuntu
```

2台目でもUser Dataの完了を確認します。

```bash
sudo cloud-init status
```

```bash
ls /opt/rails-dojo/setup-complete
```

`status: done`と完了確認ファイルが表示されれば成功です。

> [!IMPORTANT]
> ここからはSession Managerのタブを2つ使います。
> コマンドを実行する前に、EC2 1とEC2 2のどちらを操作しているか確認してください。

---

## Step 13：2台へRailsアプリを準備する

このStepのコマンドは、EC2 1とEC2 2の両方で実行します。

まず、両方のターミナルで設定を読み込みます。

```bash
source ~/.bashrc
```

Ruby、Bundler、PostgreSQLクライアントを確認します。

```bash
ruby -v
```

```bash
bundle -v
```

```bash
psql --version
```

続けて、両方でRailsアプリをcloneします。

```bash
git clone https://github.com/TORIFUKUKaiou/rails-dojo-git-practice.git
```

```bash
cd rails-dojo-git-practice
```

Gemをインストールします。

```bash
bundle install
```

両方のターミナルでエラーが出ず、プロンプトへ戻れば成功です。

---

## Step 14：2台からpsqlでRDSへ接続する

EC2 1とEC2 2の両方で、次のコマンドを実行します。

`RDSのendpoint`は、コピーした値へ置き換えます。

```bash
psql -h RDSのendpoint -U rails_dojo -d rails_dojo_production
```

パスワードを求められたら、次を入力します。入力中の文字は画面に表示されません。

```text
RailsDojo2026Db
```

次のプロンプトが表示されれば、RDSへ接続できています。

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

両方のEC2から接続できたことを確認してから次へ進みます。

---

## Step 15：2台で使うSECRET_KEY_BASEを作成する

EC2 1のターミナルだけで、次を実行します。

```bash
bin/rails secret
```

長い文字列が表示されます。この値をメモ帳などへコピーします。

このあと、EC2 1とEC2 2の両方で同じ値を使います。

> [!WARNING]
> `SECRET_KEY_BASE`は秘密値です。
> 今回は授業用の一時環境でのみ使用し、GitHubやチャットへ投稿しないでください。

---

## Step 16：1台目へ環境変数を設定する

EC2 1のターミナルで実行します。

`RDSのendpoint`を、自分のRDSのendpointへ置き換えます。

```bash
export DATABASE_URL='postgresql://rails_dojo:RailsDojo2026Db@RDSのendpoint:5432/rails_dojo_production'
```

```bash
export RAILS_ENV=production
```

`コピーしたSECRET_KEY_BASE`を、Step 15でコピーした値へ置き換えます。

```bash
export SECRET_KEY_BASE='コピーしたSECRET_KEY_BASE'
```

設定された変数名を確認します。

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
> `echo $DATABASE_URL`や`echo $SECRET_KEY_BASE`は実行しません。
> パスワードや秘密値が画面へ表示されます。

---

## Step 17：2台目へ同じ環境変数を設定する

EC2 2のターミナルでも、Step 16と同じ3つの環境変数を設定します。

```bash
export DATABASE_URL='postgresql://rails_dojo:RailsDojo2026Db@RDSのendpoint:5432/rails_dojo_production'
```

```bash
export RAILS_ENV=production
```

```bash
export SECRET_KEY_BASE='コピーしたSECRET_KEY_BASE'
```

`RDSのendpoint`と`コピーしたSECRET_KEY_BASE`は、EC2 1で設定した値と同じものへ置き換えます。

変数名を確認します。

```bash
env | grep -E '^(DATABASE_URL|RAILS_ENV|SECRET_KEY_BASE)=' | cut -d= -f1
```

2台とも`DATABASE_URL`、`RAILS_ENV`、`SECRET_KEY_BASE`が設定された状態にします。

---

## Step 18：production用データベースを準備する

EC2 1のターミナルだけで実行します。

Railsアプリのディレクトリにいることを確認します。

```bash
pwd
```

```bash
bin/rails db:prepare
```

エラーが出ず、プロンプトへ戻ればmigrationまで完了しています。

接続しているデータベースを確認します。

```bash
bin/rails runner 'puts ActiveRecord::Base.connection.adapter_name'
```

次のように表示されれば、PostgreSQLへ接続しています。

```text
PostgreSQL
```

2台が同じRDSを使うため、`db:prepare`はEC2 1だけで実行します。

---

## Step 19：1台目でアセットを準備してRailsを起動する

EC2 1のターミナルで実行します。

production用のアセットを準備します。

```bash
SECRET_KEY_BASE_DUMMY=1 RAILS_ENV=production bin/rails assets:precompile
```

エラーが出ず、プロンプトへ戻れば成功です。

Rails serverをバックグラウンドで起動します。

```bash
bin/rails server -b 0.0.0.0 -p 3000 -d
```

起動できたか確認します。

```bash
curl http://localhost:3000/up
```

HTMLが表示されれば成功です。

---

## Step 20：2台目でアセットを準備してRailsを起動する

EC2 2のターミナルでも、同じ操作を行います。

```bash
SECRET_KEY_BASE_DUMMY=1 RAILS_ENV=production bin/rails assets:precompile
```

```bash
bin/rails server -b 0.0.0.0 -p 3000 -d
```

```bash
curl http://localhost:3000/up
```

EC2 2でもHTMLが表示されれば成功です。

> [!IMPORTANT]
> Rails serverを起動したあとも、Session Managerのタブは閉じずに残します。
> トラブルが起きたときは、どちらのEC2を操作しているか確認します。

---

## Step 21：2台ともHealthyになることを確認する

1. EC2の左メニューから`ターゲットグループ`を開きます。
2. `rails-dojo-week12-tg`を開きます。
3. `ターゲット`タブを開きます。

数分待ち、2台とも次の状態になることを確認します。

```text
Healthy
```

`Unhealthy`の場合は、そのEC2で`curl http://localhost:3000/up`を実行し、Rails serverが動いているか確認します。

---

## Step 22：1台目から記事を登録する

ブラウザでEC2 1へ直接アクセスします。

```text
http://EC2 1のパブリックIPアドレス:3000
```

`CodeShelf`が表示されれば成功です。

次の記事を登録します。

```text
タイトル：2台で共有する記事
本文：RDS PostgreSQLに保存します
```

記事一覧に`2台で共有する記事`が表示されることを確認します。

---

## Step 23：2台目から同じ記事を確認する

ブラウザでEC2 2へ直接アクセスします。

```text
http://EC2 2のパブリックIPアドレス:3000
```

記事一覧に、EC2 1から登録した次の記事が表示されることを確認します。

```text
2台で共有する記事
```

2台のRailsが同じRDSへ接続しているため、どちらのEC2からでも同じ記事を表示できます。

---

## Step 24：RDSに記事が保存されたことを確認する

EC2 1またはEC2 2のSession Managerで、次を実行します。

```bash
psql -h RDSのendpoint -U rails_dojo -d rails_dojo_production
```

パスワード`RailsDojo2026Db`を入力します。

記事のタイトルを確認します。

```sql
SELECT title FROM articles ORDER BY id DESC LIMIT 5;
```

`2台で共有する記事`が表示されれば、RDSへ保存されています。

psqlを終了します。

```sql
\q
```

---

## Step 25：ALBから同じ記事を確認する

CloudFormationの出力`AlbDnsName`を使い、ブラウザで次を開きます。

```text
http://ALBのDNS名
```

何度かリロードし、次を確認します。

- `CodeShelf`が表示される
- `2台で共有する記事`が毎回表示される

第11週とは異なり、どちらのEC2へ通信が届いても、同じRDSから記事を読み込みます。

---

## Step 26：EC2への直接アクセスを閉じる

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

## Step 27：ALB経由だけで表示できることを確認する

ALBのURLを開きます。

```text
http://ALBのDNS名
```

`CodeShelf`と`2台で共有する記事`が表示されることを確認します。

次に、EC2 1とEC2 2へ直接アクセスします。

```text
http://EC2 1のパブリックIPアドレス:3000
http://EC2 2のパブリックIPアドレス:3000
```

どちらも接続できなければ成功です。

---

## Step 28：EC2を1台停止する

1. EC2のインスタンス一覧を開きます。
2. `rails-dojo-week12-1`を選択します。
3. `インスタンスの状態`をクリックします。
4. `インスタンスを停止`をクリックします。
5. 確認画面で停止を実行します。

> [!IMPORTANT]
> `終了`ではなく`停止`を選びます。

ターゲットグループを開き、EC2 1が`Unhealthy`などの通信対象から外れた状態になるまで待ちます。

---

## Step 29：片方のEC2だけで利用を続けられることを確認する

ALBのURLを何度かリロードします。

```text
http://ALBのDNS名
```

次を確認します。

- Railsアプリを引き続き表示できる
- `2台で共有する記事`が表示される

ALBは、正常なEC2 2だけへ通信を送っています。

記事は共通のRDSに保存されているため、EC2 1を停止しても同じ記事を表示できます。

---

## トラブルシューティング

### Session Managerで接続できない

- 対象のEC2が`実行中`か
- ステータスチェックに合格しているか
- User Dataの処理が終わるまで数分待ったか

### User Dataが完了しない

状態を確認します。

```bash
sudo cloud-init status
```

`status: error`の場合はログを確認します。

```bash
sudo tail -n 80 /var/log/cloud-init-output.log
```

### `psql`でRDSへ接続できない

- EC2とRDSが同じVPCにあるか
- endpointを正しく置き換えたか
- RDSの状態が`Available`か
- RDS用SGでEC2用SGからの5432番を許可しているか
- DB名、ユーザー名、パスワードが教材の値と一致しているか

### `bin/rails db:prepare`が失敗する

- `DATABASE_URL`のendpointを置き換えたか
- `psql`では同じendpointへ接続できるか
- `RAILS_ENV`が`production`になっているか

### Rails serverを起動できない

環境変数の名前を確認します。

```bash
env | grep -E '^(DATABASE_URL|RAILS_ENV|SECRET_KEY_BASE)=' | cut -d= -f1
```

productionのログを確認します。

```bash
tail -n 100 log/production.log
```

### ALBのターゲットがUnhealthyになる

- 対象のEC2で`curl http://localhost:3000/up`が成功するか
- Railsが3000番ポートで起動しているか
- EC2用SGでALB用SGからの3000番を許可しているか

### 2台で記事の表示が異なる

両方のEC2で、同じRDSへ接続しているか確認します。

```bash
bin/rails runner 'puts ActiveRecord::Base.connection_db_config.host'
```

2台で同じRDSのendpointが表示されることを確認します。

---

Practiceが終わったら、[Stretch](stretch.md)へ進みましょう。

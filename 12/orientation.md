# 第12週：AWSデプロイ体験（4）── 2台のRailsからRDSを使う

## 今日のゴール

前回は、異なるAvailability ZoneにEC2を1台ずつ置き、ALBから2台のRailsへ通信を振り分けました。

しかし、記事はEC2ごとのSQLiteに保存されていたため、どちらのEC2へ通信が届くかによって表示が変わりました。

今回は、2台のRailsから同じRDS PostgreSQLへ接続します。

- RDSとPostgreSQLの役割を説明できる
- 2台のRailsから同じデータベースを使う理由を説明できる
- EC2からだけRDSへ接続できる構成を作れる
- Railsをproductionモードで起動できる
- EC2を1台停止しても、ALB経由で利用を続けられることを確認できる

> [!IMPORTANT]
> AWS Academy Sandboxは3時間で終了し、作成した環境が消えます。
> 第11週のリソースは引き継がず、今回の構成を新しく作ります。

---

## 1. 前回起きたこと

第11週では、2台のEC2がそれぞれSQLiteを持っていました。

```mermaid
flowchart LR
  U["利用者"] --> ALB["ALB"]
  ALB --> EC21["EC2 1<br>Rails"]
  ALB --> EC22["EC2 2<br>Rails"]
  EC21 --> DB1["SQLite 1"]
  EC22 --> DB2["SQLite 2"]
```

EC2 1で保存した記事は、EC2 2のSQLiteには入りません。

そのため、同じALBのURLを開いても、記事が表示されたり表示されなかったりしました。

Webサーバーを2台に増やすだけでは、データは自動的に共有されません。

---

## 2. 今回作る構成

今回は、2台のRailsから同じRDS PostgreSQLへ接続します。

```mermaid
flowchart LR
  U["利用者"] -->|"HTTP 80"| ALB["ALB"]
  ALB -->|"HTTP 3000"| EC21["Availability Zone 1<br>EC2 1 / Rails"]
  ALB -->|"HTTP 3000"| EC22["Availability Zone 2<br>EC2 2 / Rails"]
  EC21 -->|"PostgreSQL 5432"| RDS["RDS PostgreSQL<br>共通のデータベース"]
  EC22 -->|"PostgreSQL 5432"| RDS
```

記事をどちらのRailsから保存しても、同じRDSへ入ります。

その後、ALBからどちらのEC2へ通信が送られても、同じ記事を表示できます。

---

## 3. RDSとPostgreSQL

RDSは、AWSが提供するリレーショナルデータベースのサービスです。

データベース用のEC2を自分で用意しなくても、AWSの画面からデータベースを作成できます。

RDSでは複数のデータベースエンジンを選べます。今回はPostgreSQLを使います。

```mermaid
flowchart LR
  Rails1["Rails 1"] --> RDS["RDS PostgreSQL"]
  Rails2["Rails 2"] --> RDS
  RDS --> DATA["共通の記事データ"]
```

RDSには接続先を表すendpointがあります。2台のRailsは、同じendpointへ接続します。

---

## 4. public subnetとprivate subnet

ALBは利用者からの通信を受け取るため、public subnetへ置きます。

EC2も、今回の演習ではSession Managerやインターネットを使ったセットアップができるよう、public subnetへ置きます。

RDSはインターネットから直接アクセスさせません。RDSが利用するsubnetとして、異なるAvailability Zoneのprivate subnetを2つ用意します。

```mermaid
flowchart TB
  Internet["インターネット"] --> ALB["public subnet<br>ALB"]
  ALB --> EC21["public subnet<br>EC2 1"]
  ALB --> EC22["public subnet<br>EC2 2"]
  EC21 --> RDS["private subnet<br>RDS"]
  EC22 --> RDS
```

RDSを作成するときは、`Public access`を`No`にします。

---

## 5. DB Subnet Group

DB Subnet Groupは、RDSが利用できるsubnetをまとめる設定です。

今回は、異なるAvailability Zoneにある2つのprivate subnetを登録します。

```mermaid
flowchart LR
  DSG["DB Subnet Group"] --> P1["private subnet 1<br>AZ 1"]
  DSG --> P2["private subnet 2<br>AZ 2"]
  DSG --> RDS["RDS PostgreSQL"]
```

DB Subnet Groupへ2つのsubnetを登録しても、それだけでRDSがMulti-AZ構成になるわけではありません。

---

## 6. RDSのMulti-AZ

本番環境では、データベースにも障害への備えが必要です。

RDSのMulti-AZ構成では、通常使うデータベースとは異なるAvailability Zoneに、待機用のデータベースが用意されます。

```mermaid
flowchart LR
  Rails["Rails"] --> ENDPOINT["RDS endpoint"]
  ENDPOINT --> PRIMARY["AZ 1<br>プライマリ"]
  PRIMARY -.->|"データを同期"| STANDBY["AZ 2<br>スタンバイ"]
```

プライマリに障害が起きた場合は、RDSがスタンバイへ切り替えます。Railsは同じendpointを使って接続を続けます。

> [!IMPORTANT]
> AWS Academyの制限があるため、今回のPracticeではMulti-AZのRDSを作成しません。
> PracticeではSingle-AZのRDSを使い、2台のRailsが同じデータを利用できることを確認します。

---

## 7. セキュリティグループ

RDSをprivate subnetへ置くだけでは、接続元を制限できません。

RDS用セキュリティグループでは、PostgreSQLの5432番ポートをEC2用セキュリティグループからだけ許可します。

| 対象 | 許可する通信 |
|---|---|
| ALB用SG | インターネットから80番 |
| EC2用SG | ALB用SGから3000番 |
| RDS用SG | EC2用SGから5432番 |

```mermaid
flowchart LR
  ALBSG["ALB用SG"] -->|"3000を許可"| EC2SG["2台で使うEC2用SG"]
  EC2SG -->|"5432を許可"| RDSSG["RDS用SG"]
```

2台のEC2には同じEC2用セキュリティグループを設定します。

---

## 8. productionモードで必要な設定

今回は、2台のRailsをproductionモードで起動します。

2台には、次の環境変数を同じ内容で設定します。

| 環境変数 | 役割 |
|---|---|
| `DATABASE_URL` | RDSの接続先をRailsへ伝える |
| `RAILS_ENV` | productionモードを指定する |
| `SECRET_KEY_BASE` | Cookieなどの署名に使う秘密値 |

`DATABASE_URL`には、RDSのendpoint、ユーザー名、パスワード、データベース名が入ります。

```text
postgresql://ユーザー名:パスワード@RDSのendpoint:5432/データベース名
```

2台で異なる`DATABASE_URL`を設定すると、同じデータベースを利用できません。

`SECRET_KEY_BASE`も2台で同じ値にします。値が異なると、アクセス先のEC2が変わったときにCookieを正しく読み取れない場合があります。

パスワードや`SECRET_KEY_BASE`は、RubyファイルやGit管理されるファイルへ書きません。

---

## 9. アセットのプリコンパイル

productionモードで起動する前に、CSSやJavaScriptなどのアセットを準備します。

```bash
SECRET_KEY_BASE_DUMMY=1 RAILS_ENV=production bin/rails assets:precompile
```

`SECRET_KEY_BASE_DUMMY=1`は、アセットを準備する処理だけを行うときに使う仮の設定です。

実際にRails serverを起動するときは、2台で共通の`SECRET_KEY_BASE`を設定します。

---

## 10. 片方のEC2が停止した場合

2台のEC2が正常なとき、ALBは両方へ通信を送ります。

片方のEC2が停止すると、ALBはヘルスチェックに成功しているEC2だけへ通信を送ります。

```mermaid
flowchart LR
  U["利用者"] --> ALB["ALB"]
  ALB -->|"通信を送る"| EC21["EC2 1<br>Healthy"]
  ALB -.->|"通信を送らない"| EC22["EC2 2<br>Unhealthy"]
  EC21 --> RDS["共通のRDS"]
```

第11週とは異なり、記事は共通のRDSにあります。そのため、片方のEC2が停止しても、残ったEC2から同じ記事を表示できます。

---

## 今回のまとめ

- 2台のRailsから同じRDS PostgreSQLへ接続する
- 記事を共通のRDSへ保存し、第11週の表示不整合を解消する
- RDSへはEC2用セキュリティグループからだけ接続を許可する
- 2台で`DATABASE_URL`、`RAILS_ENV`、`SECRET_KEY_BASE`を同じ設定にする
- production起動前にアセットをプリコンパイルする
- RDS Multi-AZは説明だけ扱い、PracticeではSingle-AZのRDSを作成する

準備ができたら、[練習](practice.md)へ進みましょう。

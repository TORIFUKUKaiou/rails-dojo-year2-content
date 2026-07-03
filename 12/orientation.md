# 第12週：AWSデプロイ体験（4）── RDS PostgreSQLへデータを保存する

## 今日のゴール

前回は、ALBをRailsアプリの入口にし、EC2へ直接アクセスできない構成を作りました。

今回は、Railsが使うデータベースをEC2の中からRDSへ移します。

第12週のゴールは、次の5つです。

- RDSとPostgreSQLの役割を説明できる
- DB Subnet Groupの役割を説明できる
- EC2からだけRDSへ接続できるセキュリティグループを設定できる
- Railsをproductionモードで起動し、RDSへデータを保存できる
- EC2、ALB、RDSを組み合わせた構成を作れる

講義で用語を確認したら、実際にAWS上で構成を2回作ります。

---

## 1. 前回の構成

第11週の完成状態では、利用者はALBのDNS名へアクセスしました。

```mermaid
flowchart LR
  U["利用者のブラウザ"] -->|"HTTP 80"| ALB["ALB"]
  ALB -->|"HTTP 3000"| EC2["EC2<br>Rails / SQLite3"]
  U -.->|"直接接続は拒否"| EC2
```

SQLite3のデータベースファイルは、Railsと同じEC2の中にありました。

この構成は学習や小さな開発には便利ですが、EC2を削除すると、EC2内のデータも一緒に失う可能性があります。

---

## 2. 今日作る構成

今回は、データベースをRDSへ分けます。

```mermaid
flowchart LR
  U["利用者のブラウザ"] -->|"HTTP 80"| ALB["ALB"]
  ALB -->|"HTTP 3000"| EC2["EC2<br>Rails / Puma<br>production"]
  EC2 -->|"PostgreSQL 5432"| RDS["RDS<br>PostgreSQL"]
  U -.->|"直接接続は拒否"| EC2
  INTERNET["インターネット"] -.->|"直接接続は不可"| RDS
```

通信の順番は次のとおりです。

```text
ブラウザ → ALB:80 → EC2上のRails:3000 → RDS PostgreSQL:5432
```

完成後は、次の結果を確認します。

| 確認するURL・接続 | 結果 |
|---|---|
| `http://ALBのDNS名` | Railsアプリが表示される |
| `http://EC2のパブリックIPアドレス:3000` | 接続できない |
| インターネットからRDSへ直接接続 | 接続できない |
| EC2上のRailsからRDSへ接続 | 接続できる |

---

## 3. RDSとPostgreSQL

RDSは、AWSが提供するリレーショナルデータベースのサービスです。

OSへ自分でデータベースをインストールする代わりに、AWSの画面からデータベースを作成できます。

RDSでは複数のデータベースエンジンを選べます。今回はPostgreSQLを使います。

```mermaid
flowchart LR
  Rails["Rails"] -->|"SQL"| PostgreSQL["PostgreSQL"]
  PostgreSQL --> DB["テーブルにデータを保存"]
```

Railsで本を登録すると、RailsがSQLを実行し、RDS上のPostgreSQLへデータが保存されます。

---

## 4. public subnetとprivate subnet

ALBは利用者からの通信を受け取るため、public subnetへ置きます。

今回のRDSは、インターネットから直接アクセスさせません。そのため、2つのprivate subnetを使います。

```mermaid
flowchart TB
  Internet["インターネット"] --> ALB["public subnet<br>ALB"]
  ALB --> EC2["public subnet<br>EC2"]
  EC2 --> RDS["private subnet<br>RDS"]
```

private subnetに置くだけで、すべての通信が自動的に安全になるわけではありません。

RDSを作成するときは、`Public access`を`No`にし、セキュリティグループでも接続元を制限します。

---

## 5. DB Subnet Group

RDSをVPC内に作成するときは、どのsubnetを利用できるかをDB Subnet Groupで指定します。

今回のDB Subnet Groupには、異なるAvailability Zoneにある2つのprivate subnetを登録します。

```mermaid
flowchart LR
  DSG["DB Subnet Group"] --> P1["private subnet 1<br>AZ 1"]
  DSG --> P2["private subnet 2<br>AZ 2"]
  DSG --> RDS["RDS PostgreSQL"]
```

Practiceでは、CloudFormationがprivate subnetを2つ用意します。DB Subnet GroupとRDSは、自分でAWSの画面から作成します。

---

## 6. RDS用セキュリティグループ

PostgreSQLは通常、5432番ポートを使います。

RDS用セキュリティグループでは、`Anywhere-IPv4`を通信元にしません。EC2用セキュリティグループを通信元にします。

| 対象 | 許可する通信 |
|---|---|
| ALB用SG | インターネットから80番 |
| EC2用SG | ALB用SGから3000番 |
| RDS用SG | EC2用SGから5432番 |

```mermaid
flowchart LR
  ALBSG["ALB用SG"] -->|"3000を許可"| EC2SG["EC2用SG"]
  EC2SG -->|"5432を許可"| RDSSG["RDS用SG"]
```

これにより、RDSへ接続できる相手を、今回のEC2に限定できます。

---

## 7. developmentモードとproductionモード

これまでは、主にdevelopmentモードでRailsを起動しました。

今回は、公開環境を想定したproductionモードで起動します。

```bash
RAILS_ENV=production bin/rails server -b 0.0.0.0 -p 3000
```

RailsへRDSの接続先を伝えるため、`DATABASE_URL`という環境変数を使います。

```text
postgresql://ユーザー名:パスワード@RDSのendpoint:5432/データベース名
```

パスワードをRubyファイルやGit管理されるファイルへ書きません。今回の演習では、Session Managerのターミナルで環境変数に設定します。

---

## 8. IaCとCloudFormationの復習

IaCは、インフラの構成をコードで管理する考え方です。

Practiceの1周目では、CloudFormationから次の土台を作ります。

- VPCとsubnet
- EC2とEBS
- EC2用・ALB用セキュリティグループ
- ALB、ターゲットグループ、リスナー

DB Subnet Group、RDS、RDS用セキュリティグループは自分で作成します。

2周目では、デフォルトVPCを使い、EC2、ALB、RDSを手動で作成します。

---

## 今回のまとめ

| 用語 | 意味 |
|---|---|
| RDS | AWSが提供するリレーショナルデータベースサービス |
| PostgreSQL | 今回RDSで使うデータベースエンジン |
| DB Subnet Group | RDSが利用できるsubnetをまとめる設定 |
| private subnet | インターネットへ直接公開しないリソースを置くsubnet |
| endpoint | RDSへ接続するときに使うホスト名 |
| `DATABASE_URL` | Railsへデータベースの接続先を渡す環境変数 |
| productionモード | 公開環境を想定したRailsの実行モード |

準備ができたら、[練習](practice.md)へ進みましょう。

/**
 * 第15回 前期期末試験の Google フォームを作成する Google Apps Script です。
 *
 * 実行方法
 * 1. https://script.google.com/ で新しいプロジェクトを作成する
 * 2. このファイルの内容を貼り付けて保存する
 * 3. createYear2ExamQuizForm を実行し、権限を許可する
 * 4. 実行ログに表示される「編集用URL」を開く
 *
 * 実行するたびに、新しい Google フォームが1つ作成されます。
 */
function createYear2ExamQuizForm() {
  const form = FormApp.create("第15回 前期期末試験");

  form.setDescription(
    [
      "前期に学んだ Rails の仕組み、データベース、Git、AWS、本番環境へのデプロイを確認するための試験です。",
      "",
      "【配点】",
      "・全30点",
      "・第1部：選択式20問（各1点）",
      "・第2部：実技試験（10点）",
      "",
      "【試験の進め方】",
      "・試験時間：180分",
      "・第1部と第2部を、上から順に取り組んでください。",
      "・講義資料、過去の演習ファイル、インターネット検索、生成AIは使って構いません。",
      "・使用する GitHub リポジトリと AWS 環境は、自分自身が作成・操作したものにしてください。",
      "",
      "【秘密値の注意】",
      "DATABASE_URL と SECRET_KEY_BASE は、GitHub、README、Google フォーム、チャット、スクリーンショットへ貼り付けません。"
    ].join("\n")
  );
  form.setIsQuiz(true);
  form.setAllowResponseEdits(false);
  form.setCollectEmail(true);
  form.setProgressBar(true);
  form.setShuffleQuestions(false);
  form.setConfirmationMessage("回答を送信しました。");

  addStudentInformation_(form);
  addPart1Questions_(form);
  addPart2PracticalQuestion_(form);

  Logger.log("==================================================");
  Logger.log("Google フォームが作成されました。");
  Logger.log("編集用URL: " + form.getEditUrl());
  Logger.log("回答用URL: " + form.getPublishedUrl());
  Logger.log("==================================================");
}

function addStudentInformation_(form) {
  form.addSectionHeaderItem()
    .setTitle("【受験者情報】")
    .setHelpText("学籍番号と氏名を入力してください。");

  form.addTextItem()
    .setTitle("学籍番号")
    .setRequired(true);

  form.addTextItem()
    .setTitle("氏名")
    .setRequired(true);
}

function addPart1Questions_(form) {
  form.addPageBreakItem()
    .setTitle("第1部：選択式問題（全20問・各1点）")
    .setHelpText("各問について、最も適切な選択肢を1つ選んでください。");

  const examData = [
    {
      number: 1,
      section: "A. データベース設計とアソシエーション（問1〜問5）",
      prompt: [
        "1つのプロジェクト（Project）に複数のタスク（Task）が属する、1対多の関係を Rails で作ります。",
        "",
        "Project モデルに has_many :tasks、Task モデルに belongs_to :project を書くとき、外部キー project_id を置くテーブルはどれですか。"
      ].join("\n"),
      choices: [
        "projects テーブル",
        "tasks テーブル",
        "両方のテーブル",
        "外部キーは不要である"
      ],
      answer: 2,
      explanation: "1対多の関係では、「多」の側が親を表す外部キーを持ちます。複数のタスクのそれぞれが、どのプロジェクトに属するかを記録するため、tasks テーブルに project_id を置きます。"
    },
    {
      number: 2,
      section: "A. データベース設計とアソシエーション（問1〜問5）",
      prompt: "すでにある products テーブルへ、在庫数を表す stock カラム（整数）を追加します。migration の change メソッドに書くコードとして正しいものはどれですか。",
      choices: [
        "add_column :stock, :products, :integer",
        "add_column :products, :stock, :integer",
        "create_column :products, :stock, :integer",
        "add_field :products, :stock, :integer"
      ],
      answer: 2,
      explanation: "add_column は、add_column :テーブル名, :カラム名, :型 の順で書きます。この問題では、products テーブルに stock という整数のカラムを追加します。"
    },
    {
      number: 3,
      section: "A. データベース設計とアソシエーション（問1〜問5）",
      prompt: [
        "次のモデルを定義しました。",
        "",
        "class Task < ApplicationRecord",
        "  belongs_to :project",
        "end",
        "",
        "@task が1件のタスクであるとき、belongs_to :project によって提供されるメソッドとして誤っているものはどれですか。"
      ].join("\n"),
      choices: [
        "@task.project で、そのタスクが属するプロジェクトを取り出せる。",
        "@task.project = @project で、タスクにプロジェクトを紐付けられる。",
        "@task.build_project で、紐付ける新しいプロジェクトをメモリ上に作れる。",
        "@task.projects で、タスクに紐付く複数のプロジェクトを取り出せる。"
      ],
      answer: 4,
      explanation: "belongs_to は、1件の親に属する関係です。Task から取り出せるプロジェクトは1件なので、メソッド名も単数形の project です。複数形の projects を使うのは、has_many 側です。"
    },
    {
      number: 4,
      section: "A. データベース設計とアソシエーション（問1〜問5）",
      prompt: "データベースの主キー（Primary Key）の役割として、最も適切なものはどれですか。",
      choices: [
        "テーブル内の各レコードを一意に識別する。",
        "テーブル同士のアソシエーションを自動的に作る。",
        "レコードの作成日時を保存する。",
        "データベースへの接続パスワードを保存する。"
      ],
      answer: 1,
      explanation: "主キーは、1つのテーブルにある各レコードを重複なく識別するための値です。Rails では通常、id カラムが主キーとして使われます。"
    },
    {
      number: 5,
      section: "A. データベース設計とアソシエーション（問1〜問5）",
      prompt: [
        "次のコマンドを実行したときの説明として、正しいものはどれですか。",
        "",
        "bin/rails db:rollback"
      ].join("\n"),
      choices: [
        "データベース内のすべてのテーブルを削除する。",
        "Rails アプリケーションのソースコードを直前の Git commit に戻す。",
        "最後に実行した migration を1つ取り消し、データベースの構造を1つ前の状態に戻す。",
        "すべての未保存データを本番データベースへ保存する。"
      ],
      answer: 3,
      explanation: "db:rollback は、直前に実行した migration の変更を取り消します。Git の履歴を戻すコマンドではなく、データベース構造を扱う Rails のコマンドです。"
    },
    {
      number: 6,
      section: "B. MVC と HTTP リクエスト（問6〜問10）",
      prompt: "ブラウザから新しい記事を登録するため、POST /articles が送信されました。保存に成功した後、redirect_to @article で記事の詳細画面を表示するまでの流れとして、最も適切なものはどれですか。",
      choices: [
        "Routing → Controller の create → Model の保存 → Redirect → ブラウザが GET /articles/:id を送信 → Routing → Controller の show → View",
        "View → Routing → Model の保存 → Controller の create → Redirect",
        "Controller の show → Routing → View → Model の保存",
        "Routing → View → Model の保存 → Controller の create"
      ],
      answer: 1,
      explanation: "最初の POST リクエストは、Routing により create アクションへ届きます。Controller が Model を使って保存し、redirect_to はブラウザへ別URLへ移動するよう指示します。その後、ブラウザが詳細画面への GET リクエストを送り直し、show と View が実行されます。"
    },
    {
      number: 7,
      section: "B. MVC と HTTP リクエスト（問6〜問10）",
      prompt: [
        "config/routes.rb に次の定義があります。",
        "",
        "resources :books",
        "",
        "ID が 12 の本の編集フォームを表示するとき、HTTP メソッドとパスの組み合わせとして正しいものはどれですか。"
      ].join("\n"),
      choices: [
        "POST /books/12/edit",
        "GET /books/12/edit",
        "PATCH /books/12",
        "GET /books/edit/12"
      ],
      answer: 2,
      explanation: "編集フォームを表示する edit アクションは、GET /books/:id/edit です。PATCH /books/:id は、フォームで入力した編集内容を送信して更新するときに使います。"
    },
    {
      number: 8,
      section: "B. MVC と HTTP リクエスト（問6〜問10）",
      prompt: [
        "Rails 8 で、ArticlesController に次のメソッドがあります。",
        "",
        "def article_params",
        "  params.expect(article: [ :title, :body ])",
        "end",
        "",
        "このコードの説明として正しいものはどれですか。"
      ].join("\n"),
      choices: [
        "article パラメータの中から、保存に使ってよい title と body だけを取り出す。",
        "articles テーブルを作成し、title と body のカラムを追加する。",
        "title と body が空文字列の場合に、必ず保存エラーにする。",
        "すべてのパラメータを無条件にデータベースへ保存する。"
      ],
      answer: 1,
      explanation: "params.expect は、フォームから送られた値のうち、指定した構造と項目を安全に取り出すための仕組みです。この場合は article の中にある title と body を扱います。migration やバリデーションを行うコードではありません。"
    },
    {
      number: 9,
      section: "B. MVC と HTTP リクエスト（問6〜問10）",
      prompt: [
        "ERB の次の2つの書き方について、正しい説明はどれですか。",
        "",
        "<%= @article.title %>",
        "<% @article.title %>"
      ].join("\n"),
      choices: [
        "上はデータベースへ保存し、下はデータベースから削除する。",
        "上は式の結果を HTML に出力し、下は処理を実行しても結果を HTML へ出力しない。",
        "上は Controller でだけ使え、下は Model でだけ使える。",
        "上下に違いはなく、どちらも同じ結果を表示する。"
      ],
      answer: 2,
      explanation: "<%= %> は、評価した結果を HTML に出力します。<% %> は、if や each などの処理を実行するときに使えますが、式の結果そのものは画面に出力しません。"
    },
    {
      number: 10,
      section: "B. MVC と HTTP リクエスト（問6〜問10）",
      prompt: "Controller で使う redirect_to articles_path と render :index の違いとして、正しいものはどれですか。",
      choices: [
        "redirect_to はブラウザに別URLへアクセスし直すよう指示し、render は現在のリクエストのまま指定した View を表示する。",
        "redirect_to はデータベースを初期化し、render は migration を実行する。",
        "redirect_to は必ず View を表示せず、render は必ず別の Controller を最初から実行する。",
        "両者はまったく同じ動きをする。"
      ],
      answer: 1,
      explanation: "redirect_to はブラウザへリダイレクトのレスポンスを返し、ブラウザが別のURLへ新しいリクエストを送ります。render は現在の Controller 処理の中で、指定したテンプレートを使ってレスポンスを作ります。"
    },
    {
      number: 11,
      section: "C. Git と GitHub Flow（問11〜問14）",
      prompt: "app/views/articles/index.html.erb の変更だけを、次の commit に含めたいです。ステージングエリアへ追加するコマンドとして正しいものはどれですか。",
      choices: [
        'git commit -m "トップ画面を変更"',
        "git push origin main",
        "git add app/views/articles/index.html.erb",
        "git save app/views/articles/index.html.erb"
      ],
      answer: 3,
      explanation: "git add は、次の commit に含める変更をステージングエリアへ追加するコマンドです。git commit はステージング済みの変更を記録し、git push は commit を GitHub へ送ります。"
    },
    {
      number: 12,
      section: "C. Git と GitHub Flow（問11〜問14）",
      prompt: "GitHub Flow で新しい機能を作り始めるとき、最も適切な手順はどれですか。",
      choices: [
        "main で直接変更し、完成したらすぐに push する。",
        "最新の main を取得してから、機能用の新しいブランチを作成して作業する。",
        "本番環境の EC2 で直接ファイルを編集してから、GitHub へコピーする。",
        "他の人が作業中のブランチを削除してから作業する。"
      ],
      answer: 2,
      explanation: "GitHub Flow では、最新の main を土台にして、機能ごとのブランチを作ります。これにより、main を安定した状態に保ちながら変更を進め、Pull Request で確認できます。"
    },
    {
      number: 13,
      section: "C. Git と GitHub Flow（問11〜問14）",
      prompt: "Codespaces で git push を実行して GitHub のリポジトリが更新されました。この直後の EC2 上の Rails アプリについて、正しい説明はどれですか。",
      choices: [
        "GitHub が更新されたため、2台の EC2 も自動的に最新コードへ切り替わる。",
        "ALB が GitHub から新しいコードを取得して、EC2へ配布する。",
        "EC2 のファイルは自動では変わらないため、各 EC2 で git pull などを行ってコードを反映する必要がある。",
        "RDS が GitHub の commit を読み取り、Rails アプリを更新する。"
      ],
      answer: 3,
      explanation: "git push が更新するのは GitHub のリモートリポジトリです。手動 deploy では、EC2 ①と EC2 ②の両方で git pull を行い、Rails server を再起動して初めて本番環境へ反映されます。"
    },
    {
      number: 14,
      section: "C. Git と GitHub Flow（問11〜問14）",
      prompt: "別のブランチを取り込むとき、同じファイルの同じ箇所に異なる変更があり、Conflict が発生しました。解決方法として正しいものはどれですか。",
      choices: [
        "<<<<<<<、=======、>>>>>>> を残したまま commit する。",
        "マージマーカーで囲まれた内容を確認して必要なコードへ直し、マージマーカーをすべて削除してから git add と git commit を行う。",
        "Conflict が起きたファイルを必ず削除する。",
        "git push だけを実行して GitHub に解決させる。"
      ],
      answer: 2,
      explanation: "Conflict は、Git がどちらの変更を残すべきか自動で判断できない状態です。人が内容を確認して必要な形へ直し、マージマーカーを残さずに保存してから、変更を commit します。"
    },
    {
      number: 15,
      section: "D. AWS インフラとネットワーク（問15〜問18）",
      prompt: "ALB から EC2 上の Rails アプリへ、3000番ポートで通信を送る構成を作ります。EC2 用セキュリティグループのインバウンドルールの送信元として、最も安全なものはどれですか。",
      choices: [
        "0.0.0.0/0",
        "ALB 用セキュリティグループの ID",
        "ALB の DNS 名",
        "自分の GitHub ユーザー名"
      ],
      answer: 2,
      explanation: "EC2 用セキュリティグループの送信元に ALB 用セキュリティグループを指定すると、ALB からの通信だけを許可できます。0.0.0.0/0 を指定すると、インターネット上の誰からでも3000番ポートへアクセスできてしまいます。"
    },
    {
      number: 16,
      section: "D. AWS インフラとネットワーク（問15〜問18）",
      prompt: "画像、CSS、JavaScript、HTML などのファイルをオブジェクトとして保存する用途に適した AWS サービスはどれですか。",
      choices: ["EC2", "RDS", "S3", "ALB"],
      answer: 3,
      explanation: "S3 はオブジェクトストレージです。ファイルをバケットに保存し、必要に応じて公開やアクセス制御を設定できます。RDS はリレーショナルデータベース、EC2 は仮想サーバー、ALB は通信を振り分けるサービスです。"
    },
    {
      number: 17,
      section: "D. AWS インフラとネットワーク（問15〜問18）",
      prompt: "RDS PostgreSQL を private subnet に置く主な理由として、最も適切なものはどれですか。",
      choices: [
        "インターネットから RDS へ直接接続されるのを防ぎ、EC2 など許可した内部の接続元からだけ使えるようにするため。",
        "RDS の PostgreSQL を SQLite に変換するため。",
        "EC2 の台数を必ず1台にするため。",
        "ALB のヘルスチェックを止めるため。"
      ],
      answer: 1,
      explanation: "データベースには重要なデータを保存するため、インターネットから直接アクセスできない private subnet に置きます。さらに、RDS 用セキュリティグループで EC2 用セキュリティグループからの PostgreSQL 通信だけを許可します。"
    },
    {
      number: 18,
      section: "D. AWS インフラとネットワーク（問15〜問18）",
      prompt: "ALB のヘルスチェックの説明として、正しいものはどれですか。",
      choices: [
        "Rails のソースコードを自動で書き換える機能である。",
        "GitHub の commit メッセージを採点する機能である。",
        "RDS のデータを毎回バックアップする機能である。",
        "EC2 上のアプリが指定したパスへ正常に応答するかを確認し、異常なターゲットには通信を振り分けないようにする機能である。"
      ],
      answer: 4,
      explanation: "ALB は、たとえば /up へ HTTP リクエストを送り、正常な応答を返すか確認します。応答に失敗する EC2 は Unhealthy となり、正常なターゲットと異なり通信の振り分け対象から外れます。"
    },
    {
      number: 19,
      section: "E. 本番起動とエラーデバッグ（問19〜問20）",
      prompt: "EC2 で新しい CSS を含むコードを取得して Rails server を再起動したところ、production 環境の画面に CSS が適用されません。原因と対策として最も適切なものはどれですか。",
      choices: [
        "RDS を削除してから Rails を起動し直す。",
        "production 用のアセットを assets:precompile で準備し、Rails server を再起動して確認する。",
        "config/routes.rb から resources をすべて削除する。",
        "ALB の DNS 名を GitHub の URL に変更する。"
      ],
      answer: 2,
      explanation: "production 環境では、CSS や JavaScript などのアセットを事前に準備します。コードを取得した後は、SECRET_KEY_BASE_DUMMY=1 RAILS_ENV=production bin/rails assets:precompile を実行し、Rails server を再起動して確認します。"
    },
    {
      number: 20,
      section: "E. 本番起動とエラーデバッグ（問19〜問20）",
      prompt: "production モードで Rails を起動しようとしたとき、ActiveRecord::ConnectionNotEstablished が表示されました。確認すべき内容として最も適切なものはどれですか。",
      choices: [
        "HTML の h1 タグが正しく閉じているか。",
        "S3 バケットの名前がページタイトルと一致しているか。",
        "DATABASE_URL の RDS endpoint、ユーザー名、パスワード、データベース名と、RDS 用セキュリティグループの5432番ポートの許可設定。",
        "Git commit メッセージに日本語が含まれていないか。"
      ],
      answer: 3,
      explanation: "このエラーは Rails がデータベースへ接続できないときに起こります。DATABASE_URL の接続先や認証情報、RDS が Available か、RDS 用セキュリティグループで EC2 からの5432番ポートを許可しているかを確認します。"
    }
  ];

  let currentSection = "";

  examData.forEach(function(question) {
    if (question.section !== currentSection) {
      currentSection = question.section;
      form.addSectionHeaderItem().setTitle("■ " + currentSection);
    }

    const item = form.addMultipleChoiceItem();
    item
      .setTitle("【問" + question.number + "】\n" + question.prompt)
      .setPoints(1)
      .setRequired(true);

    const choices = question.choices.map(function(choiceText, index) {
      return item.createChoice(choiceText, index + 1 === question.answer);
    });
    item.setChoices(choices);

    const feedback = FormApp.createFeedback()
      .setText("【正解：" + question.answer + "】\n" + question.explanation)
      .build();
    item.setFeedbackForCorrect(feedback);
    item.setFeedbackForIncorrect(feedback);
  });
}

function addPart2PracticalQuestion_(form) {
  const practiceUrl = "https://github.com/TORIFUKUKaiou/rails-dojo-year2-content/blob/main/13/practice.md";

  form.addPageBreakItem()
    .setTitle("第2部：実技試験（10点）")
    .setHelpText(
      [
        "第13回 Practice の Step 13 までを実施します。",
        "細かな手順は、次の教材を確認してください。",
        "",
        practiceUrl
      ].join("\n")
    );

  const item = form.addMultipleChoiceItem();
  item
    .setTitle("【第2部：10点】第13回 Practice を Step 13 まで完了できたか")
    .setHelpText(
      [
        "次のリンクを開き、「Step 13：ALBでas-isを確認する」までを上から順に実施します。",
        "",
        practiceUrl,
        "",
        "Step 13 まで完了できた場合は「できた」を選びます。",
        "1つでも完了できていない場合は「できなかった」を選びます。"
      ].join("\n")
    )
    .setPoints(10)
    .setRequired(true);

  item.setChoices([
    item.createChoice("できた", true),
    item.createChoice("できなかった", false)
  ]);

  const feedback = FormApp.createFeedback()
    .setText(
      [
        "「Step 13：ALBでas-isを確認する」までを完了できた場合は「できた」を選びます。",
        "1つでも完了できていない場合は「できなかった」を選びます。"
      ].join("\n")
    )
    .build();
  item.setFeedbackForCorrect(feedback);
  item.setFeedbackForIncorrect(feedback);
}

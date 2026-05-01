# 第4週：Stretch ── association を深くする

この課題は、[練習](practice.md) を終えた人向けの発展課題です。

まずは、ECサイトの注文まわりを題材にして、association を練習します。

```mermaid
erDiagram
  direction LR
  USERS ||--o{ ORDERS : has_many
  ORDERS ||--o{ ORDER_ITEMS : has_many
  PRODUCTS ||--o{ ORDER_ITEMS : has_many
  ORDERS ||--o| PAYMENTS : has_one

  USERS {
    integer id
    string name
    string email
  }
  PRODUCTS {
    integer id
    string name
    integer price
    integer stock
  }
  ORDERS {
    integer id
    integer user_id
    string status
  }
  ORDER_ITEMS {
    integer id
    integer order_id
    integer product_id
    integer quantity
    integer unit_price
  }
  PAYMENTS {
    integer id
    integer order_id
    integer amount
    string method
  }
```

---

## 準備：ECサイト用の Rails アプリを作る

ターミナルで次のコマンドを実行してください。
コマンドはまとめて貼り付けず、一行ずつ確かめながら入力しましょう。

```bash
cd ~
rails new shop_assoc_app
cd shop_assoc_app
```

次に、ECサイトで使うモデルを scaffold で作ります。

```bash
rails generate scaffold User name:string email:string
rails generate scaffold Product name:string price:integer stock:integer
rails generate scaffold Order user:references status:string
rails generate scaffold OrderItem order:references product:references quantity:integer unit_price:integer
rails generate scaffold Payment order:references amount:integer method:string
rails db:migrate
```

---

## 課題1：`schema.rb` でテーブルを確認する

`db/schema.rb` を開いて、次のテーブルがあることを確認してください。

- `users`
- `products`
- `orders`
- `order_items`
- `payments`

<details>
<summary>確認するところ</summary>

```ruby
create_table "users"
create_table "products"
create_table "orders"
create_table "order_items"
create_table "payments"
```

順番は違ってもOKです。

</details>

---

## 課題2：外部キーを確認する

`db/schema.rb` を見て、外部キーになっているカラムを探してください。

<details>
<summary>解答例</summary>

- `orders.user_id`
- `order_items.order_id`
- `order_items.product_id`
- `payments.order_id`

`add_foreign_key` も確認します。

```ruby
add_foreign_key "order_items", "orders"
add_foreign_key "order_items", "products"
add_foreign_key "orders", "users"
add_foreign_key "payments", "orders"
```

</details>

---

## 課題3：自動で作られた `belongs_to` を確認する

次のファイルを開いて、`belongs_to` が書かれていることを確認してください。

- `app/models/order.rb`
- `app/models/order_item.rb`
- `app/models/payment.rb`

<details>
<summary>解答例</summary>

```ruby
class Order < ApplicationRecord
  belongs_to :user
end
```

```ruby
class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product
end
```

```ruby
class Payment < ApplicationRecord
  belongs_to :order
end
```

</details>

---

## 課題4：`User` から `Order` をたどれるようにする

1人のユーザーは、複数の注文を持ちます。

`app/models/user.rb` に association を追加してください。

<details>
<summary>解答例</summary>

```ruby
class User < ApplicationRecord
  has_many :orders
end
```

</details>

---

## 課題5：`rails console` で `user.orders` を確認する

`rails console` を起動してください。

```bash
rails console
```

次の Ruby を実行して、`user.orders` が使えることを確認してください。

```ruby
user = User.create!(name: "田中", email: "tanaka@example.com")
order = Order.create!(user: user, status: "ordered")

user.orders
user.orders.count
```

<details>
<summary>確認すること</summary>

`user.orders.count` が `1` になればOKです。

</details>

---

## 課題6：`Order` から `OrderItem` をたどれるようにする

1つの注文には、複数の注文明細があります。

`app/models/order.rb` に association を追加してください。

モデルを変更したら、一度 `rails console` を終了して、もう一度起動してください。

```ruby
exit
```

```bash
rails console
```

<details>
<summary>解答例</summary>

```ruby
class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items
end
```

</details>

---

## 課題7：`Product` から `OrderItem` をたどれるようにする

1つの商品は、複数の注文明細に使われます。

`app/models/product.rb` に association を追加してください。

モデルを変更したら、一度 `rails console` を終了して、もう一度起動してください。

```ruby
exit
```

```bash
rails console
```

<details>
<summary>解答例</summary>

```ruby
class Product < ApplicationRecord
  has_many :order_items
end
```

</details>

---

## 課題8：商品と注文明細を作る

`rails console` で、商品と注文明細を作ってください。

```ruby
user = User.first
order = user.orders.first

keyboard = Product.create!(name: "キーボード", price: 8000, stock: 10)
mouse = Product.create!(name: "マウス", price: 3000, stock: 20)

OrderItem.create!(order: order, product: keyboard, quantity: 1, unit_price: keyboard.price)
OrderItem.create!(order: order, product: mouse, quantity: 2, unit_price: mouse.price)
```

<details>
<summary>確認すること</summary>

```ruby
order.order_items.count
keyboard.order_items.count
mouse.order_items.count
```

`order.order_items.count` が `2` になればOKです。

</details>

---

## 課題9：注文合計をモデルのメソッドにする

注文合計は、画面やコンソールに毎回計算式を書くより、`Order` モデルのメソッドにする方が扱いやすくなります。

`order_items` の `quantity` と `unit_price` を使って、注文合計を返す `total_price` メソッドを作ってください。

<details>
<summary>解答例</summary>

`app/models/order.rb` を次のようにします。

```ruby
class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items

  def total_price
    order_items.sum do |item|
      item.quantity * item.unit_price
    end
  end
end
```

モデルを変更したので、`rails console` を開き直します。

```ruby
exit
```

```bash
rails console
```

次の Ruby で確認します。

```ruby
order = Order.first
order.total_price
```

`14000` になればOKです。

</details>

---

## 課題10：`Order` から `Product` を直接たどれるようにする

今は、注文から商品を見るには `order.order_items` を経由する必要があります。

`has_many :through` を使って、`order.products` と書けるようにしてください。

<details>
<summary>解答例</summary>

```ruby
class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items
  has_many :products, through: :order_items

  def total_price
    order_items.sum do |item|
      item.quantity * item.unit_price
    end
  end
end
```

</details>

---

## 課題11：`order.products` を確認する

モデルを変更したので、`rails console` を開き直してください。

```ruby
exit
```

```bash
rails console
```

次の Ruby を実行してください。

```ruby
order = Order.first
order.products
order.products.pluck(:name)
```

<details>
<summary>確認すること</summary>

```ruby
["キーボード", "マウス"]
```

のように表示されればOKです。

</details>

---

## 課題12：`Product` から `Order` を直接たどれるようにする

商品から、その商品を含む注文をたどれるようにしてください。

`app/models/product.rb` に `has_many :through` を追加します。

<details>
<summary>解答例</summary>

```ruby
class Product < ApplicationRecord
  has_many :order_items
  has_many :orders, through: :order_items
end
```

</details>

---

## 課題13：`product.orders` を確認する

`rails console` を開き直して、次の Ruby を実行してください。

```ruby
exit
```

```bash
rails console
```

```ruby
product = Product.find_by(name: "キーボード")
product.orders
product.orders.count
```

<details>
<summary>確認すること</summary>

`product.orders.count` が `1` になればOKです。

</details>

---

## 課題14：`Order` と `Payment` の関係を考える

今回の設計では、1つの注文に対して支払いは1つだけとします。

ここで、`has_one` という association を使います。

- `has_many` は、相手が複数あるときに使う
- `has_one` は、相手が1つだけあるときに使う
- `belongs_to` は、外部キーを持っている側に書く

今回、外部キーの `order_id` は `payments` テーブルにあります。
そのため、`Payment` 側は `belongs_to :order` になります。
一方で、`Order` から見ると支払いは1つだけなので、`has_one :payment` になります。

この場合、`Order` と `Payment` にはどの association を書けばよいでしょうか。

<details>
<summary>解答例</summary>

```ruby
class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items
  has_many :products, through: :order_items
  has_one :payment

  def total_price
    order_items.sum do |item|
      item.quantity * item.unit_price
    end
  end
end
```

```ruby
class Payment < ApplicationRecord
  belongs_to :order
end
```

`payments` テーブルに `order_id` があるので、`Payment` 側は `belongs_to :order` です。
`Order` から見た支払いは1つだけなので、`Order` 側は `has_one :payment` です。

</details>

---

## 課題15：支払いデータを作る

モデルを変更したので、`rails console` を開き直してください。

```ruby
exit
```

```bash
rails console
```

`rails console` で、注文に支払いデータを追加してください。

```ruby
order = Order.first
Payment.create!(order: order, amount: order.total_price, method: "card")
```

<details>
<summary>確認すること</summary>

```ruby
order.payment
order.payment.amount
order.payment.method
```

`14000` と `"card"` が確認できればOKです。

</details>

---

## 課題16：`has_many` と `has_one` の違いを確認する

`Order` から見たとき、`order.order_items` と `order.payment` の戻り値は何が違うでしょうか。

`rails console` で確認してください。

```ruby
order = Order.first
order.order_items
order.payment
```

<details>
<summary>解答例</summary>

`order.order_items` は複数の注文明細を返します。

```ruby
order.order_items
```

`order.payment` は1つの支払いを返します。

```ruby
order.payment
```

複数なら `has_many`、1つだけなら `has_one` を使います。

</details>

---

## 課題17：注文を消したときの注文明細を考える

注文を削除したとき、その注文に属する注文明細も一緒に削除したいです。

`Order` の association を書き換えてください。

<details>
<summary>解答例</summary>

```ruby
class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy
  has_many :products, through: :order_items
  has_one :payment

  def total_price
    order_items.sum do |item|
      item.quantity * item.unit_price
    end
  end
end
```

`dependent: :destroy` を付けると、注文を削除したときに注文明細も削除されます。

</details>

---

## 課題18：注文を消したときの支払いを考える

注文を削除したとき、支払いデータも一緒に削除したいです。

`Order` の association をもう一度書き換えてください。

<details>
<summary>解答例</summary>

```ruby
class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy
  has_many :products, through: :order_items
  has_one :payment, dependent: :destroy

  def total_price
    order_items.sum do |item|
      item.quantity * item.unit_price
    end
  end
end
```

</details>

---

## 課題19：削除の動きを確認する

`rails console` を開き直して、注文を削除したときに注文明細と支払いも削除されるか確認してください。

```ruby
exit
```

```bash
rails console
```

```ruby
order = Order.first
order.order_items.count
order.payment

order.destroy

OrderItem.count
Payment.count
```

<details>
<summary>確認すること</summary>

今回作ったデータだけなら、最後は次のようになります。

```ruby
OrderItem.count
#=> 0

Payment.count
#=> 0
```

</details>

---

## 課題20：ECサイトの association を説明する

最後に、今回作った association を自分の言葉で説明してください。

次の4つを説明できればOKです。

- `User` と `Order`
- `Order` と `OrderItem`
- `Product` と `OrderItem`
- `Order` と `Payment`

<details>
<summary>解答例</summary>

```ruby
class User < ApplicationRecord
  has_many :orders
end
```

```ruby
class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy
  has_many :products, through: :order_items
  has_one :payment, dependent: :destroy

  def total_price
    order_items.sum do |item|
      item.quantity * item.unit_price
    end
  end
end
```

```ruby
class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product
end
```

```ruby
class Product < ApplicationRecord
  has_many :order_items
  has_many :orders, through: :order_items
end
```

```ruby
class Payment < ApplicationRecord
  belongs_to :order
end
```

- ユーザーは複数の注文を持つ
- 注文は1人のユーザーに属する
- 注文は複数の注文明細を持つ
- 商品は複数の注文明細に使われる
- 注文と商品は、注文明細を通してつながる
- 注文は1つの支払いを持つ

</details>

---

## 次の題材：コース選択と宿題提出

次は、学生がコースを受講し、授業ごとに宿題を提出する仕組みを作ります。

```mermaid
erDiagram
  direction LR
  STUDENTS ||--o{ ENROLLMENTS : has_many
  COURSES ||--o{ ENROLLMENTS : has_many
  COURSES ||--o{ LESSONS : has_many
  STUDENTS ||--o{ SUBMISSIONS : has_many
  LESSONS ||--o{ SUBMISSIONS : has_many

  STUDENTS {
    integer id
    string name
    string email
  }
  COURSES {
    integer id
    string title
    text description
  }
  ENROLLMENTS {
    integer id
    integer student_id
    integer course_id
    string status
  }
  LESSONS {
    integer id
    integer course_id
    string title
    integer position
  }
  SUBMISSIONS {
    integer id
    integer student_id
    integer lesson_id
    text body
    integer score
  }
```

---

## 準備：コース選択用の Rails アプリを作る

ターミナルで次のコマンドを実行してください。
コマンドはまとめて貼り付けず、一行ずつ確かめながら入力しましょう。

```bash
cd ~
rails new school_assoc_app
cd school_assoc_app
```

次に、コース選択と宿題提出で使うモデルを scaffold で作ります。

```bash
rails generate scaffold Student name:string email:string
rails generate scaffold Course title:string description:text
rails generate scaffold Enrollment student:references course:references status:string
rails generate scaffold Lesson course:references title:string position:integer
rails generate scaffold Submission student:references lesson:references body:text score:integer
rails db:migrate
```

---

## 課題21：`schema.rb` でテーブルを確認する

`db/schema.rb` を開いて、次のテーブルがあることを確認してください。

- `students`
- `courses`
- `enrollments`
- `lessons`
- `submissions`

<details>
<summary>確認するところ</summary>

```ruby
create_table "students"
create_table "courses"
create_table "enrollments"
create_table "lessons"
create_table "submissions"
```

順番は違ってもOKです。

</details>

---

## 課題22：外部キーを確認する

`db/schema.rb` を見て、外部キーになっているカラムを探してください。

<details>
<summary>解答例</summary>

- `enrollments.student_id`
- `enrollments.course_id`
- `lessons.course_id`
- `submissions.student_id`
- `submissions.lesson_id`

`add_foreign_key` も確認します。

```ruby
add_foreign_key "enrollments", "courses"
add_foreign_key "enrollments", "students"
add_foreign_key "lessons", "courses"
add_foreign_key "submissions", "lessons"
add_foreign_key "submissions", "students"
```

</details>

---

## 課題23：自動で作られた `belongs_to` を確認する

次のファイルを開いて、`belongs_to` が書かれていることを確認してください。

- `app/models/enrollment.rb`
- `app/models/lesson.rb`
- `app/models/submission.rb`

<details>
<summary>解答例</summary>

```ruby
class Enrollment < ApplicationRecord
  belongs_to :student
  belongs_to :course
end
```

```ruby
class Lesson < ApplicationRecord
  belongs_to :course
end
```

```ruby
class Submission < ApplicationRecord
  belongs_to :student
  belongs_to :lesson
end
```

</details>

---

## 課題24：`Student` から `Enrollment` をたどれるようにする

1人の学生は、複数の受講登録を持ちます。

`app/models/student.rb` に association を追加してください。

<details>
<summary>解答例</summary>

```ruby
class Student < ApplicationRecord
  has_many :enrollments
end
```

</details>

---

## 課題25：`Course` から `Enrollment` をたどれるようにする

1つのコースは、複数の受講登録を持ちます。

`app/models/course.rb` に association を追加してください。

<details>
<summary>解答例</summary>

```ruby
class Course < ApplicationRecord
  has_many :enrollments
end
```

</details>

---

## 課題26：学生とコースと受講登録を作る

`rails console` を起動してください。

```bash
rails console
```

次の Ruby を実行して、学生、コース、受講登録を作ってください。

```ruby
student = Student.create!(name: "佐藤", email: "sato@example.com")
course = Course.create!(title: "Rails基礎", description: "Railsの基本を学ぶ")
Enrollment.create!(student: student, course: course, status: "active")
```

<details>
<summary>確認すること</summary>

```ruby
student.enrollments.count
course.enrollments.count
```

どちらも `1` になればOKです。

</details>

---

## 課題27：`Student` から `Course` を直接たどれるようにする

今は、学生からコースを見るには `student.enrollments` を経由する必要があります。

`has_many :through` を使って、`student.courses` と書けるようにしてください。

<details>
<summary>解答例</summary>

```ruby
class Student < ApplicationRecord
  has_many :enrollments
  has_many :courses, through: :enrollments
end
```

</details>

---

## 課題28：`Course` から `Student` を直接たどれるようにする

コースから、そのコースを受講している学生をたどれるようにしてください。

`app/models/course.rb` に `has_many :through` を追加します。

<details>
<summary>解答例</summary>

```ruby
class Course < ApplicationRecord
  has_many :enrollments
  has_many :students, through: :enrollments
end
```

</details>

---

## 課題29：`student.courses` と `course.students` を確認する

モデルを変更したので、`rails console` を開き直してください。

```ruby
exit
```

```bash
rails console
```

次の Ruby を実行してください。

```ruby
student = Student.first
course = Course.first

student.courses.pluck(:title)
course.students.pluck(:name)
```

<details>
<summary>確認すること</summary>

```ruby
["Rails基礎"]
```

```ruby
["佐藤"]
```

のように表示されればOKです。

</details>

---

## 課題30：`Course` から `Lesson` をたどれるようにする

1つのコースには、複数の授業があります。

`app/models/course.rb` に association を追加してください。

<details>
<summary>解答例</summary>

```ruby
class Course < ApplicationRecord
  has_many :enrollments
  has_many :students, through: :enrollments
  has_many :lessons
end
```

</details>

---

## 課題31：授業データを作る

モデルを変更したので、`rails console` を開き直してください。

```ruby
exit
```

```bash
rails console
```

次の Ruby を実行して、授業データを作ってください。

```ruby
course = Course.first

Lesson.create!(course: course, title: "association入門", position: 1)
Lesson.create!(course: course, title: "中間テーブル", position: 2)
```

<details>
<summary>確認すること</summary>

```ruby
course.lessons.count
course.lessons.pluck(:title)
```

`course.lessons.count` が `2` になればOKです。

</details>

---

## 課題32：`Student` から `Submission` をたどれるようにする

1人の学生は、複数の宿題提出を持ちます。

`app/models/student.rb` に association を追加してください。

<details>
<summary>解答例</summary>

```ruby
class Student < ApplicationRecord
  has_many :enrollments
  has_many :courses, through: :enrollments
  has_many :submissions
end
```

</details>

---

## 課題33：`Lesson` から `Submission` をたどれるようにする

1つの授業には、複数の宿題提出があります。

`app/models/lesson.rb` に association を追加してください。

<details>
<summary>解答例</summary>

```ruby
class Lesson < ApplicationRecord
  belongs_to :course
  has_many :submissions
end
```

</details>

---

## 課題34：宿題提出データを作る

モデルを変更したので、`rails console` を開き直してください。

```ruby
exit
```

```bash
rails console
```

次の Ruby を実行してください。

```ruby
student = Student.first
lesson = Lesson.find_by(title: "association入門")

Submission.create!(student: student, lesson: lesson, body: "提出しました", score: 80)
```

<details>
<summary>確認すること</summary>

```ruby
student.submissions.count
lesson.submissions.count
```

どちらも `1` になればOKです。

</details>

---

## 課題35：`Lesson` から提出した学生をたどれるようにする

宿題提出を通して、授業から提出した学生をたどれるようにしてください。

`has_many :through` を使って、`lesson.students` と書けるようにします。

<details>
<summary>解答例</summary>

```ruby
class Lesson < ApplicationRecord
  belongs_to :course
  has_many :submissions
  has_many :students, through: :submissions
end
```

</details>

---

## 課題36：`lesson.students` を確認する

モデルを変更したので、`rails console` を開き直してください。

```ruby
exit
```

```bash
rails console
```

次の Ruby を実行してください。

```ruby
lesson = Lesson.find_by(title: "association入門")
lesson.students.pluck(:name)
```

<details>
<summary>確認すること</summary>

```ruby
["佐藤"]
```

のように表示されればOKです。

</details>

---

## 課題37：`Student` から提出済みの授業をたどれるようにする

学生から、宿題を提出した授業を直接たどれるようにしてください。

ただし、`Student` にはすでに `has_many :courses, through: :enrollments` があります。
今回は提出済みの授業なので、名前を `submitted_lessons` にします。

<details>
<summary>解答例</summary>

```ruby
class Student < ApplicationRecord
  has_many :enrollments
  has_many :courses, through: :enrollments
  has_many :submissions
  has_many :submitted_lessons, through: :submissions, source: :lesson
end
```

`submitted_lessons` という名前は、`lessons` テーブル名と一致しません。
そのため、`source: :lesson` で、実際には `Submission` の `lesson` をたどることを Rails に伝えます。

</details>

---

## 課題38：`submitted_lessons` を確認する

`rails console` を開き直して、次の Ruby を実行してください。

```ruby
exit
```

```bash
rails console
```

```ruby
student = Student.first
student.submitted_lessons.pluck(:title)
```

<details>
<summary>確認すること</summary>

```ruby
["association入門"]
```

のように表示されればOKです。

</details>

---

## 課題39：コースの提出数をモデルのメソッドにする

コースに対して、宿題提出が合計何件あるかを返す `submission_count` メソッドを作ってください。

コースは複数の授業を持ち、授業は複数の宿題提出を持ちます。

<details>
<summary>解答例</summary>

`app/models/course.rb` を次のようにします。

```ruby
class Course < ApplicationRecord
  has_many :enrollments
  has_many :students, through: :enrollments
  has_many :lessons

  def submission_count
    lessons.sum do |lesson|
      lesson.submissions.count
    end
  end
end
```

モデルを変更したので、`rails console` を開き直します。

```ruby
exit
```

```bash
rails console
```

次の Ruby で確認します。

```ruby
course = Course.first
course.submission_count
```

`1` になればOKです。

</details>

---

## 課題40：削除時の動きを考える

コースを削除したとき、そのコースの受講登録、授業、宿題提出も一緒に削除したいです。

どの association に `dependent: :destroy` を付ければよいでしょうか。

<details>
<summary>解答例</summary>

```ruby
class Student < ApplicationRecord
  has_many :enrollments, dependent: :destroy
  has_many :courses, through: :enrollments
  has_many :submissions, dependent: :destroy
  has_many :submitted_lessons, through: :submissions, source: :lesson
end
```

```ruby
class Course < ApplicationRecord
  has_many :enrollments, dependent: :destroy
  has_many :students, through: :enrollments
  has_many :lessons, dependent: :destroy

  def submission_count
    lessons.sum do |lesson|
      lesson.submissions.count
    end
  end
end
```

```ruby
class Lesson < ApplicationRecord
  belongs_to :course
  has_many :submissions, dependent: :destroy
  has_many :students, through: :submissions
end
```

モデルを変更したので、確認する場合は `rails console` を開き直します。

```ruby
exit
```

```bash
rails console
```

次の Ruby を実行します。

```ruby
course = Course.first
course.destroy

Enrollment.count
Lesson.count
Submission.count
```

今回作ったデータだけなら、最後はすべて `0` になればOKです。

</details>

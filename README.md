Here’s a **concise version** of your `Book-review-api` documentation, preserving essential information:

---

# 📚 Book Review API

### ⚙️ Setup

* **DB:** PostgreSQL
* **Install:** Node.js, npm, PostgreSQL (via Homebrew on macOS)
* **Init:**

  * `npm install` — install dependencies
  * `psql -U postgres -d your_db_name -f db/init.sql` — create tables
  * `npm start` — run server

---

### 🗄️ Database Structure

* **users:** stores email & hashed password (`bcrypt`)
* **books:** title, author, genre, content
* **reviews:** rating & comment per user-book

Files:

* `init.sql` — creates tables
* `db.js` — sets up DB connection

---

### 🛣️ Routes

* **Auth:** `authRoutes` (signup/login)
* **Books:** `bookRoutes` (add book, list, get by ID, add review)
* **Reviews:** `reviewsRoutes` (update/delete review)
* **Search:** in `index.js` — by title or author

Includes middleware for JWT-based email validation.

---

## 📘 Controllers

### `addBookHandler(req, res)`

Adds a book (title, author, content required; genre defaults to "Unknown").
Authenticated user required.

### `findBookHandler(req, res)`

Returns paginated list of books (filtered by author/genre).
Defaults: page = 1, limit = 10.

### `findBookbyIDHandler(req, res)`

Fetch book by ID, include avg. rating & paginated reviews.
Pagination: page = 1, limit = 5.

### `findBooksbySearchHandler(req, res)`

Search books by title or author (partial match using `ILIKE`).
Defaults: page = 1, limit = 10.

---

### 🔍 Shared Validations

* All SQL queries are parameterized (`$1, $2, ...`)
* Inputs validated (e.g., `parseInt`, `isNaN`)
* Pagination via `LIMIT` + `OFFSET`

---

## 📝 Reviews Controller

### `addBookReviewHandler`

Adds review if book/user exist & no prior review exists.
Validates: `bookId`, `rating` (1–5), `review`.

### `updateBookReviewHandler`

Updates review if it exists for given book & user.
Validates: email, `bookId`, `rating`, `review`.

### `deleteBookReviewHandler`

Deletes review if it exists for given book & user.
Validates: email, `bookId`.

---

## 🔐 Auth Controller

### `signUpControllerasync`

Registers a user after checking email uniqueness.
Hashes password with `bcrypt`.

### `signInControllerasync`

Authenticates user via email & password.
Returns JWT if credentials are valid.



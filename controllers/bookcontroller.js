const client  = require('../db.js');

const addBookHandler = async (req, res) => {
    let email = req?.email;

     let book = req?.body?.book;
    if (!book) {
        return res.status(400).send("Book is required.");
    }

    let title  = book?.title;
    let author = book?.author;
    let genre = book?.genre || "Unknown";
    // Default genre to "Unknown" if not provided   

    let content = book?.content;

   
    if (!title || !author || !content) {
        return res.status(400).send("Title, author and content are required.");
    }
     
    try {

        const userResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).send("User not found.");
        }

        // Insert into user_books table
        await client.query('INSERT INTO books (title,author,genre,content,created_by) VALUES ($1, $2,$3,$4,$5)', [title,author,genre,content,userResult.rows[0].id]);

        return res.status(201).send("Book added successfully.");

    } catch (err) {
        console.error('Add book error:', err);
        return res.status(500).send("Internal server error.");
    }
}

const findBookHandler = async (req, res) => {
  try {
    // Extract query parameters with defaults
    let { page = 1, limit = 10, author, genre } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    // Build filter conditions and parameters array
    const conditions = [];
    const params = [];

    if (author) {
      params.push(author);
      conditions.push(`author = $${params.length}`);
    }

    if (genre) {
      params.push(genre);
      conditions.push(`genre = $${params.length}`);
    }

    // Construct the base query with optional WHERE clause
    let baseQuery = 'SELECT * FROM books';
    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    // Add ordering and pagination
    params.push(limit, offset);
    baseQuery += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    // Execute the query to get books data
    const result = await client.query(baseQuery, params);

    // Construct count query to get total number of matching rows
    let countQuery = 'SELECT COUNT(*) FROM books';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    // For count query, use params without limit and offset (last two)
    const countResult = await client.query(countQuery, params.slice(0, params.length - 2));
    const total = parseInt(countResult.rows[0].count);

    // Send response with pagination info
    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      books: result.rows
    });

  } catch (err) {
    console.error('Get books error:', err);
    return res.status(500).send('Internal server error');
  }
};


const findBookbyIDHandler = async (req, res) => {
  const bookId = Number(req?.params?.id);
  let { page = 1, limit = 5 } = req.query;

  if (isNaN(bookId)) {
    return res.status(400).send('Book ID must be a number.');
  }

  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  try {
    // Fetch book
    const bookResult = await client.query('SELECT * FROM books WHERE id = $1', [bookId]);

    if (bookResult.rows.length === 0) {
      return res.status(404).send('Book not found');
    }

    const book = bookResult.rows[0];

    // Fetch average rating
    const avgRatingResult = await client.query(
      'SELECT AVG(rating)::numeric(2,1) AS average_rating FROM reviews WHERE book_id = $1',
      [bookId]
    );

    const averageRating = avgRatingResult.rows[0].average_rating || 0;

    // Fetch reviews with pagination
    const reviewsResult = await client.query(
      `SELECT r.id, r.rating, r.comment, u.email
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.book_id = $1
       ORDER BY r.id DESC
       LIMIT $2 OFFSET $3`,
      [bookId, limit, offset]
    );

    // Count total reviews for pagination info
    const countResult = await client.query(
      'SELECT COUNT(*) FROM reviews WHERE book_id = $1',
      [bookId]
    );

    const totalReviews = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalReviews / limit);

    return res.status(200).json({
      book,
      averageRating: parseFloat(averageRating),
      reviews: reviewsResult.rows,
      page,
      totalPages,
      totalReviews,
    });

  } catch (err) {
    console.error('Get book by ID error:', err);
    return res.status(500).send('Internal server error');
  }
};

const findBooksbySearchHandler = async (req, res) => {
  try {
    // Extract query parameters
    let { author, title, page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    // Build filter conditions
    if (author) {
      params.push(`%${author}%`);
      conditions.push(`author ILIKE $${params.length}`);
    }

    if (title) {
      params.push(`%${title}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }

    let baseQuery = 'SELECT * FROM books';
    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    // Add pagination
    params.push(limit, offset);
    baseQuery += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await client.query(baseQuery, params);

    // Count total matches (without limit/offset)
    let countQuery = 'SELECT COUNT(*) FROM books';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const countResult = await client.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      books: result.rows,
    });

  } catch (err) {
    console.error('Search books error:', err);
    return res.status(500).send('Internal server error');
  }
};



module.exports = {
  addBookHandler,
  findBookHandler,
  findBookbyIDHandler,findBooksbySearchHandler
};

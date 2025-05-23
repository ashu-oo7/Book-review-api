const client = require('../db');

addBookReviewHandler = async (req, res) => {

    let email = req?.email;
    let bookId = Number(req.params.id);
    let review = req?.body?.review;
    let rating = req?.body?.rating;

    if (!review || !bookId || !rating) {
        return res.status(400).send("Review, book ID and rating are required.");
    }
    if (typeof(rating) !== 'number'|| rating < 1 || rating > 5) {
        return res.status(400).send("Rating must be a Number between 1 and 5.");
    }
    if (isNaN(bookId)) {
        return res.status(400).send("bookId must be a Number.");
    }

    try {
        const userResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).send("User not found.");
        }
         const userId = userResult.rows[0].id;

        // Check if review already exists
        const existingReview = await client.query(
        'SELECT * FROM reviews WHERE book_id = $1 AND user_id = $2',
        [bookId, userId]
        );
        if (existingReview.rows.length > 0) {
            return res.status(409).send("Review already exists.");
        }

        // Check if book exists 
        const bookResult = await client.query('SELECT * FROM books WHERE id = $1', [bookId]);
        if (bookResult.rows.length === 0) {
            return res.status(404).send("Book not found.");
        }

        // Insert into reviews table
        await client.query('INSERT INTO reviews (book_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)', [bookId, userResult.rows[0].id, rating, review]);

        return res.status(201).send("Review added successfully.");

    } catch (err) {
        console.error('Add review error:', err);
        return res.status(500).send("Internal server error.");
    }
}

updateBookReviewHandler = async (req, res) => {
    let email = req?.body?.email;
    const bookId = Number(req.params.id);
    let review = req?.body?.review;
    let rating = req?.body?.rating;

    if (isNaN(bookId)) {
        return res.status(400).send("Book ID must be a number.");
    }

    if (!review || !bookId || !rating) {
        return res.status(400).send("Review, book ID and rating are required.");
    }
    if (typeof(rating) !== 'number'|| rating < 1 || rating > 5) {
        return res.status(400).send("Rating must be a Number between 1 and 5.");
    }
    if (typeof(bookId) !== 'number') {
        return res.status(400).send("bookId must be a Number.");
    }

    try {
        const userResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).send("User not found.");
        }
         const userId = userResult.rows[0].id;

        // Check if review already exists
        const existingReview = await client.query(
        'SELECT * FROM reviews WHERE book_id = $1 AND user_id = $2',
        [bookId, userId]
        );
        if (existingReview.rows.length === 0) {
            return res.status(409).send("Review does not exist.");
        }

        // Check if book exists 
        const bookResult = await client.query('SELECT * FROM books WHERE id = $1', [bookId]);
        if (bookResult.rows.length === 0) {
            return res.status(404).send("Book not found.");
        }

        // Update the review
        await client.query('UPDATE reviews SET rating = $1, comment = $2 WHERE book_id = $3 AND user_id = $4', [rating, review, bookId, userResult.rows[0].id]);

        return res.status(200).send("Review updated successfully.");

    } catch (err) {
        console.error('Update review error:', err);
        return res.status(500).send("Internal server error.");
    }
}

deleteBookReviewHandler = async (req, res) => {
    let email = req?.body?.email;
    let bookId = Number(req?.params?.id);

    if (!bookId) {
        return res.status(400).send("Book ID is required.");
    }
    if (isNaN(bookId)) {
        return res.status(400).send("bookId must be a Number.");
    }

    try {
        const userResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).send("User not found.");
        }
         const userId = userResult.rows[0].id;

       // Check if book exists 
        const bookResult = await client.query('SELECT * FROM books WHERE id = $1', [bookId]);
        if (bookResult.rows.length === 0) {
            return res.status(404).send("Book not found.");
        } 

        // Check if review already exists
        const existingReview = await client.query(
        'SELECT * FROM reviews WHERE book_id = $1 AND user_id = $2',
        [bookId, userId]
        );
        if (existingReview.rows.length === 0) {
            return res.status(409).send("Review does not exist.");
        }

        // Delete the review
        await client.query('DELETE FROM reviews WHERE book_id = $1 AND user_id = $2', [bookId, userResult.rows[0].id]);

        return res.status(200).send("Review deleted successfully.");

    } catch (err) {
        console.error('Delete review error:', err);
        return res.status(500).send("Internal server error.");
    }
}
module.exports = {
    addBookReviewHandler,updateBookReviewHandler,deleteBookReviewHandler
}
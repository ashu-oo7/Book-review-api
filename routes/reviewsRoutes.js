express = require('express')
const router = express.Router();

const {updateBookReviewHandler,deleteBookReviewHandler } = require('../controllers/reviewscontroller.js');

router.put('/:id',updateBookReviewHandler)
router.delete('/:id',deleteBookReviewHandler)

module.exports = router
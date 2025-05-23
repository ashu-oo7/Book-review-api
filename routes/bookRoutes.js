express = require('express')
const router = express.Router();
const { addBookHandler,findBookHandler,findBookbyIDHandler } = require('../controllers/bookcontroller.js');
const { addBookReviewHandler} = require('../controllers/reviewscontroller.js');
const { tokenValidator } = require('../middleware/tokenHandler.js');


router.post('/',tokenValidator,addBookHandler) 
router.get('/',findBookHandler)
router.get('/:id',findBookbyIDHandler)

router.post('/:id/reviews',tokenValidator,addBookReviewHandler)



module.exports = router

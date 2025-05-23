const express = require('express')
const app = express()
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const reviewRoutes = require('./routes/reviewsRoutes');
const {findBooksbySearchHandler} = require('./controllers/bookcontroller.js');

app.use(express.json());

app.use('/', authRoutes);
app.use('/books', bookRoutes);
app.use('/reviews',reviewRoutes);

app.get('/search',findBooksbySearchHandler);






app.listen(3000,()=>console.log("Server is runing"))
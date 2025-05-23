const express = require('express');
const router = express.Router();
const { signUpControllerasync,signInControllerasync } = require('../controllers/signingcontroller.js');

router.post('/signup',signUpControllerasync);

router.post('/login',signInControllerasync);

module.exports = router

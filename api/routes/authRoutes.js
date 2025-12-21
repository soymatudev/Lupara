const express = require('express');
const router = express.Router();

const { userLogin, userCreate, userLogout, userStatus, forgotPassword, resetPassword } =  require('../controllers/authController');

router.post('/login', userLogin);

router.post('/register', userCreate);

router.post('/logout', userLogout);

router.get('/status', userStatus);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

module.exports = router;
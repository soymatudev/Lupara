const express = require('express');
const router = express.Router();

const { userLogin, userCreate, userLogout } =  require('../controllers/authController');

router.post('/login', userLogin);

router.post('/register', userCreate);

router.post('/logout', userLogout);

module.exports = router;
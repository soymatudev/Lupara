const express = require('express');
const router = express.Router();

const { userLogin, userCreate, userLogout, userStatus } =  require('../controllers/authController');

router.post('/login', userLogin);

router.post('/register', userCreate);

router.post('/logout', userLogout);

router.get('/status', userStatus);

module.exports = router;
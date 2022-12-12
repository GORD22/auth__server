const { model } = require('mongoose');
const userController = require('../controllers/user-controller')
const Router = require('express').Router;
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const userModel = require('../models/user-model');
const tokenService = require('../service/token-service');

router.post('/signup', 
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.signup);
router.post('/signin', userController.signin);
router.post('/logout', userController.logout);
router.get('/me/:id', authMiddleware, userController.me);
router.get('/users', authMiddleware, userController.getUsers);
router.get('/user/:id', userController.getUser);
router.get('/refresh', userController.refresh);


module.exports = router;
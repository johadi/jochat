const passport=require("passport");
const configPassport=require("../utils/passport");
const router=require('express').Router();
let authController=require('../controllers/auth');

router.route('/signup')
    .post(authController.postSignup);
router.route('/login')
    .post(passport.authenticate('local-login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true})
    );

router.route('/chat-pro')
    .get(authController.getChatPro);
router.route('/chat')
    .get(authController.getChat);
router.route('/chat-login')
    .get(authController.getChatLogin);
router.route('/user/login')
    .post(authController.postAjaxProcessLogin);
router.route('/user/signup')
    .post(authController.postAjaxProcessSignup);
router.route('/home')
    .get(authController.getHome);
router.route('/signup-successful')
    .get(authController.getSignupSuccessful);
router.route('/quote')
    .post(authController.postQuote);
router.route('/logout')
    .get(authController.logout);

module.exports=router;

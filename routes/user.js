/**
 * Created by ILYASANATE on 24/04/2017.
 */
const passport=require("passport");
const configPassport=require("../utils/passport");
const router=require('express').Router();
let userController=require('../controllers/user');

router.route('/profile')
    .get(userController.getProfile)
    .post(userController.postProfile);

module.exports=router;

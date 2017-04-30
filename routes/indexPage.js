/**
 * Created by ILYASANATE on 11/04/2017.
 */
const router=require('express').Router();
const indexController=require('../controllers/indexPage');

router.route('/')
    .get(indexController.getIndex);
module.exports=router;
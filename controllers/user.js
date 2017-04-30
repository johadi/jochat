/**
 * Created by ILYASANATE on 24/04/2017.
 */
const User = require('../models/user');
const Quote = require('../models/quote');
const Validator = require('validatorjs');
const bcrypt=require('bcrypt-nodejs');
const _=require('lodash');
const fs = require('fs');
const path = require('path');

module.exports={
    getProfile(req,res){
        if(!req.user){
            return res.send("<h2>Oops! Bad Request</h2>")
        }
        res.render('user/profile',{title: 'Profile'});
    },
    postProfile(req,res){
        if(!req.user){
            return res.send("<h2>Oops! Bad Request</h2>");
        }
    }
}
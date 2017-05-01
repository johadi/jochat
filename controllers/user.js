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
        res.render('user/profile',{title: 'Profile',message: req.flash('message')});
    },
    postProfile(req,res){
        if(!req.user){
            return res.send("<h2>Oops! Bad Request</h2>");
        }
        let obj=req.body;
        if(!obj.email || !obj.fullname || !obj.username){
            req.flash('message','fail');
            return res.redirect('/profile');
        }

        User.findOne({username: obj.username})
            .then(user=>{
                if(!user){
                    req.flash('message','error');
                    return res.redirect('/profile');
                }

                user.fullname=obj.fullname;
                user.email=obj.email;
                user.phone=obj.phone;
                user.preferred_language=obj.lang;
                return user.save();
            })
            .then(saved_user=>{
                if(saved_user){
                    req.flash('message','success');
                    return res.redirect('/profile');
                }
            })
            .catch(err=>{
                throw err;
            })
    }
}
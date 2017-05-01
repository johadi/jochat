const User = require('../models/user');
const Quote = require('../models/quote');
const Validator = require('validatorjs');
const bcrypt=require('bcrypt-nodejs');
const _=require('lodash');
const fs = require('fs');
const path = require('path');
const {createDirectory} =require('../utils/helpers');

//NOTE: any changes made to this array should be reflected in same array for active_room.js of public/js folder as they work together
const all_rooms=['angular','angular2','react','nodejs','php','python','java','android','cplus','csharp','ruby','sql','nosql'];

module.exports={
    getChatPro(req,res){
        res.render('auth/chat_pro');
    },
    getChat(req,res){
        if(!req.user || !req.query.name || !req.query.room){
            return res.send("<h2>Oops! Error 404</h2>");
        }
        if(req.query.name.toLowerCase()!==req.user.username){//if username is not for logged in user
            return res.send("<h2>Oops! Somthing's wrong</h2>");
        }
        if(!_.includes(all_rooms,req.query.room.toLowerCase())){//if room is not an admin's accepted room
            return res.send("<h2>Oops! Somthing's wrong</h2>");
        }

        // res.render('auth/chat');
        res.render('auth/chat_pro');
        //res.render('test');
    },
    getChatLogin(req,res){
        res.render('auth/chat_login');
    },
    postAjaxProcessLogin(req,res){
        if(!req.body.username || !req.body.password){
            return res.send('<h2>Oops! Bad request</h2>');
        }
        let username=req.body.username;
        let password=req.body.password;

        User.findOne({username})
            .then(found_user=>{
                let status=0;
                if(!found_user){
                    status=1;
                    return res.json({status});
                }
                if(!found_user.comparePassword(password)){
                    status=1;
                    return res.json({status});
                }
                return res.json({status});
            })
            .catch(err=>res.json({status: 3}));
    },
    postAjaxProcessSignup(req,res){
        if(!req.body.username && !req.body.fullname && !req.body.email  && !req.body.password){
            return res.send('<h2>Oops! Bad request</h2>');
        }

        var obj = req.body,
            rules = User.createRules(),
            validator = new Validator(obj, rules);

        if (validator.passes()){

            User.findOne({$or: [{email: obj.email}, {username: obj.username}]}).exec()
                .then(function (existingUser) {
                    let status = 0;
                    if (existingUser) {
                        if (existingUser.email == obj.email) {
                            status =2 ;
                        }// "A user with this email already exists";}
                        if (existingUser.username == obj.username) {
                            status =3;
                        } //"That username  has been taken";

                        req.session.signup="fail";
                        return res.json({status});
                    }

                    req.session.signup="success";
                    return res.json({status});// status=0 since user doesn't exist before
                })
                .catch(err=>{
                    req.session.signup="fail";
                    res.json({status: 4}
                )
                }); //an error occurred
        }
        else {
            res.json({status: 1}); //=There are problems with your input
        }
    },
    getHome(req,res){
        if(!req.user){
            return res.send("<h2>Oops! Bad request</h2>");
        }
        //if all is well
        Quote.find({user: {$ne: req.user._id}})//get quotes of other members
            .sort({createdAt: -1})
            .limit(5)
            .populate('user')
            .exec()
            .then(quotes=>{
                Quote.find({user: req.user._id})//get the quotes of this user
                    .sort({createdAt:-1})
                    .limit(4)
                    .populate('user')
                    .select(['text'])
                    .exec()
                    .then(my_quotes=>{
                        return res.render('auth/home',{quotes,my_quotes});
                    })
                    .catch(err=>Promise.reject(err));
            })
            .catch(err=>res.send(err));
    },
    postSignup(req, res, next) {

        if (req.session && req.session.signup==='success') {
            //create directory for the user
            //const directoryPath = `${__dirname}/public/upload/${obj.username}`;
            const directoryPath=path.join(__dirname,'../public/uploads/'+req.body.username);
            // const subDirectoryPath=path.join(__dirname,'../public/uploads/'+req.body.username+'/temp');

            createDirectory(directoryPath)
                .then((user_path) => {
                    console.log(`Successfully created directory: '${user_path}'`);
                    let obj = req.body;
                    let user = new User(obj);
                    return user.save();//returns the promise of user.save()
                })
                .then(user=>{
                    req.session.signup=null;//to avoid reloading
                    req.session.success=true;
                    console.log(`user created Successfully: '${user}'`);
                    return res.redirect("/signup-successful");
                })
                .catch((error) => next(error));
        }
        else {
            res.send("<h2>Oops! something is wrong</h2>");
        }
    },
    getSignupSuccessful(req,res){
        if(req.session && req.session.success===true){
            return res.render('auth/signup_successful',{user: ''});
        }
        res.send("<h2>Oops! something is wrong</h2>");
    },
    postQuote(req,res){
        if (!req.user || !req.body.quote) {
            return res.send("<h2>404! NOT  FOUND</h2>");
        }

        let text = req.body.quote.trim();
        let user = req.user._id;

        let quote=new Quote({text,user});
        quote.save()
            .then(quote=>res.redirect('/home'))
            .catch(err=>res.send(err));
    }
    ,
    logout: function (req, res) {
        req.session.destroy();
        req.logout();
        res.redirect("/");
    }
}

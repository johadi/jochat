/**
 * Created by ILYASANATE on 12/04/2017.
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User=require("../models/user");

//stores user ID in the session to be used by deserializeUser
passport.serializeUser(function(user, done) {
    done(null, user._id); //result of this is attached to the session  as "req.user._id"
});
//uses the ID serializeUser stores in session to retrieve user's object from the database
passport.deserializeUser(function(id, done) {//note the id in this function parameter is a key that maps _id in done(null,user._id) of serializeUser
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//specifies that we are using local strategy, that is from this computer
passport.use("local-login",new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, username, password, done) {
        User.findOne({ username: username.toLowerCase()}, function(err, user) {

            if (err) { return done(err); }
            if (!user) {
                return done(null, false, req.flash("loginMessage","Invalid Username or Password"));//Username doesn't exist
            }
            if (!user.comparePassword(password)) {
                return done(null, false, req.flash("loginMessage","Invalid Username or Password"));//Incorrect Password
            }
            return done(null, user);
        });
    }
));

exports.isAuthenticated=function(req, res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
};

/**
 * Created by ILYASANATE on 12/04/2017.
 */
var session=require("express-session");
var MongoStore=require("connect-mongo")(session);
var passport=require("passport");
var flash=require("express-flash");
var config = require('config');

module.exports=function(app){
    app.use(session({
        resave :true,
        saveUninitialized: true,
        secret: "Cat Key",
        store: new MongoStore({url:config.get("db.url"),autoReconnect: true})
    }));

    app.use(flash());

//initializing passport for use in express
    app.use(passport.initialize());
    app.use(passport.session());

}
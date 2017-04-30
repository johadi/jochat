const NodeGeocoder=require('node-geocoder');
const API_KEY='1028bf26864cc6922da7';
const options = {
    provider: 'locationiq',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: API_KEY, // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
}
const geocoder=NodeGeocoder(options);

//multer setup
var multer=require("multer");//saves pictures
var jimp=require("jimp");//for resizing pictures

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,'./public/uploads/picture1/');
    },
    filename: function (req, file, cb) {
        var ext=file.originalname.split(".").pop();
        cb(null, req.body.username+"."+ext.toLowerCase());
    }
});
var upload=multer({storage: storage,
    fileFilter: function (req, file, cb) {
        var ext=file.originalname.split(".").pop();

        if (ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg' || ext.toLowerCase() == 'png' || ext.toLowerCase() == 'gif') {
            console.log(file);
            return cb(null, true);
        }
        else{
            console.log(ext+" file not allowed");
            return cb(null, false, new Error('I don\'t have a clue!'));
        }

    }

}).single("upload");



module.exports=function(app){
    //local middleware
    app.use((req,res,next)=>{
        if(req.user){
            res.locals.user=req.user;
        }
        next();
    });
    app.use(require('./auth'));
    app.use(require('./indexPage'));
    app.use(require('./user'));

    //to test and practice
    app.get('/test',(req,res)=>{
        res.render('test',{message: ''});
    });

    app.get("*",function (req,res, next) {
        res.status(404).send("<h1>404!</h1><h3>Page not found</h3>");
    });
}

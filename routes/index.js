const NodeGeocoder=require('node-geocoder');
const cloudinary=require('cloudinary');

const CLOUDINARY_KEY='752993747339659';
const CLOUDINARY_SECRET='5FzXdCawGzDGWLOOl4aatoCDtyg';
const CLOUDINARY_NAME='devechat';


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
        var username="jimoh";
        cb(null, username+"."+ext.toLowerCase());
    }
});
var upload=multer({storage: storage,
    fileFilter: function (req, file, cb) {
        var ext=file.originalname.split(".").pop();

        if (ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg' || ext.toLowerCase() == 'png' || ext.toLowerCase() == 'gif') {
            return cb(null, true);
        }
        else{
            console.log(ext+" file not allowed");
            return cb(null, false, new Error('I don\'t have a clue!'));
        }

    }

}).single("image");

cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_KEY,
    api_secret: CLOUDINARY_SECRET
});

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
        if(req.session.img){
            return res.render('test',{message: req.flash('message'),imagee: req.session.img});
        }
        res.render('test',{message: req.flash('message'),imagee: ''});
    });
    app.post('/test',(req,res)=>{
        upload(req,res,function(err) {
            if(err) throw err;
            if(!req.file) {
                req.flash("message","fail");
                return res.redirect("/test");
            }

            var ext=req.file.originalname.split(".").pop();
            var filename="jimoh."+ext.toLowerCase();

            var oldPath="public/uploads/picture1/"+filename;
            cloudinary.uploader.upload(req.file.path,function(result) {
                console.log(result);
                req.session.img=result.url;
                req.flash("message","success");
                return res.redirect("/test");
            },
                {
                    public_id: 'johadi10/jimoh2',
                    width: 300,
                    height: 300
                    // eager: [
                    //     { width: 200, height: 200, crop: 'thumb', gravity: 'face',
                    //         radius: 20, effect: 'sepia' },
                    //     { width: 100, height: 150, crop: 'fit', format: 'png' }
                    // ],
                    // tags: ['special', 'for_homepage']
                } );
            // var ext=req.file.originalname.split(".").pop();
            // var filename=req.body.postId+"."+ext.toLowerCase();
            //
            // var oldPath="uploads/"+req.user.username+"/picture1/"+filename;
            // var newPath="resized_pictures/"+req.user.username+"/picture1/"+filename;
            // appendix.uploadPhoto(res,jimp,oldPath,newPath,"/user/post-2"); //resize the picture,save it and redirect page to "post-2"

        });
    });
    app.get("*",function (req,res, next) {
        res.status(404).send("<h1>404!</h1><h3>Page not found</h3>");
    });
}

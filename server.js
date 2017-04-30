const express=require('express');
const path=require('path');
const http=require('http');
const ejs=require('ejs');
const engine=require('ejs-mate');
const logger=require('morgan');
const cookieParser=require('cookie-parser');
const Siofu=require('socketio-file-upload');
const config=require('config');

const mongooseSetting=require('./utils/mongoose_setting');
mongooseSetting();

const publicPath=path.join(__dirname,'public');
const routeIndex=require('./routes/index');
const bodyParser=require('body-parser');
const settings=require('./utils/settings');

let app=express();
const server=http.createServer(app);

app.use(Siofu.router);
app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({extended : true}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(logger('dev'));

app.set('views',path.join(__dirname,'views'));
app.engine('ejs',engine);
app.set('view engine','ejs');

let socket=require('./socket/socket');

settings(app);
socket(server,Siofu);
routeIndex(app);
// app.get('/chat',(req,res)=>{
//     res.render('chat');
// });
server.listen(config.get('app.port'),(err)=>{
    if(err) return console.log(err);
    console.log('app running on port 5000');
});
//siofu.listen(server);


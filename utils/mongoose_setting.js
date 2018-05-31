/**
 * Created by ILYASANATE on 07/04/2017.
 */
require('dotenv').load();
const mongoose=require('mongoose');
const config=require('config');

module.exports=()=>{
    mongoose.Promise=require('q').Promise;

    mongoose.connect(process.env.MONGODB_URI,(err)=>{
        if(err) return console.error('could\'t connect to database');

        console.log('database connected');
    });
}

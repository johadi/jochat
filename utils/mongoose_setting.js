/**
 * Created by ILYASANATE on 07/04/2017.
 */
const mongoose=require('mongoose');
const config=require('config');

module.exports=()=>{
    mongoose.Promise=require('q').Promise;

    mongoose.connect(config.get('db.url'),(err)=>{
        if(err) return console.error('could\'t connect to database');

        console.log('database connected');
    });
}
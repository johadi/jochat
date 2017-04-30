/**
 * Created by ILYASANATE on 07/04/2017.
 */
const mongoose=require('mongoose');

let historySchema=mongoose.Schema({
    from: String,
    room: String,
    text: {type: String,default:""},
    file_path: {type: String,default:""},
    state: {type: String, default: ""},
    user_avatar: String,
    country: {type: String, default: ""},
    createdAt: Number
});

module.exports=mongoose.model('history',historySchema);
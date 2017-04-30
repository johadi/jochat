/**
 * Created by ILYASANATE on 15/04/2017.
 */
const mongoose=require('mongoose');
const Schema=mongoose.Schema;

let QuoteSchema=new Schema({
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        text: {type: String, required: true,lowercase: true}
},{
        timestamps: true
});

module.exports=mongoose.model('Quote',QuoteSchema);
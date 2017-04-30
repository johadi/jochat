/**
 * Created by ILYASANATE on 11/04/2017.
 */
module.exports={
    getIndex(req,res){
        res.render('index',{title: 'Chat page',user: ''});
    }
}
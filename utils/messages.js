/**
 * Created by ILYASANATE on 05/04/2017.
 */
const moment=require('moment');
const User=require('../models/user');
const fs=require('fs');
const path=require('path');
const jimp=require('jimp');
let findUserInfoFromDB=(username)=>{
    return new Promise((resolve,reject)=>{
        User.findOne({username})
            .exec((err,user)=>{
                if(err) return reject(err);
                if(user){
                    //const avatar='/uploads/default_avatar.png';
                    const info= {username : user.username,avatar_path: user.avatar_path}//user.avatar_path
                    return resolve(info);
                }else{
                    return resolve('');
                }
            })
    })
}

let generateRealMessage=(from,text,file_path,createdAt,state,country,user_avatar)=>{
    return {
        from,text,file_path,createdAt,state,country,user_avatar
    }
};
//to remove user Temp files
let removeTempFiles=(username)=>{
    //empty the user temp dir when he disconnects from server
    return new Promise((resolve,reject)=>{
        let temp_dir=path.join(__dirname,'../public/uploads/'+username+'/temp');
        fs.stat(temp_dir,(err)=>{
            if(err){
                if(err.code=='ENOENT'){//dir doesn't exist
                    resolve('ENOENT');
                }else{
                    reject(err);
                }
            }else{
                fs.readdir(temp_dir,(err,files)=>{//read files in this directory
                    if(err){
                        reject(err);
                    }
                    files.forEach(file=>{//get each files and remove them
                        fs.unlink(path.join(temp_dir,file), error => {//empty the directory
                            if(error){
                                reject(err);
                            }else{
                                resolve('unlink');
                            }

                        });
                    });
                })
            }
        });
    });
}
let renameFile=(old_path,new_path)=>{
    return new Promise((resolve,reject)=>{
        fs.rename(old_path, new_path, (err)=> {//note: rename also remove file from the old path it has before
            if ( err ) return reject(err);
            return resolve(new_path);

        });
    });

}
let changePicture=(old_path,new_path)=>{
    return new Promise((resolve,reject)=>{
        fs.rename(old_path, new_path, (err)=> {//note: rename also remove file from the old path it has before
            if ( err ) return reject(err);
            jimp.read(new_path,function(err,image){
                if(err) return reject(err);
                image.resize(200,200)
                    .quality(100)
                    .write(new_path);
                return resolve(new_path);
            });

        });
    });

}
module.exports={generateRealMessage,findUserInfoFromDB,removeTempFiles,renameFile,changePicture};
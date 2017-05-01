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
let removeTempFiles=(username,room)=>{
    //remove user files from uploads dir when he disconnects from server
    return new Promise((resolve,reject)=>{
        let uploads_dir=path.join(__dirname,'../public/uploads');
        fs.stat(uploads_dir,(err)=>{
            if(err){
                if(err.code=='ENOENT'){//dir doesn't exist
                    resolve('ENOENT');
                }else{
                    reject(err);
                }
            }else{
                fs.readdir(uploads_dir,(err,files)=>{//read files in this directory
                    if(err){
                        return reject(err);
                    }
                    files.forEach(file=>{//get each user files and remove them
                        let ext=file.split('.').pop();
                        let user_file=username+'_'+room+'.'+ext;
                        if(file==user_file){
                            fs.unlink(path.join(uploads_dir,file), error => {//remove user file
                                if(error){
                                    reject(err);
                                }else{
                                    resolve('unlink');
                                }

                            });
                        }
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
let changePicture=(old_path,new_path,cloud_path,cloudinary)=>{
    return new Promise((resolve,reject)=>{
        //comment if you want to save to local compuer
        cloudinary.uploader.upload(old_path,(result)=> {//for saving pictures to cloud
                fs.unlink(old_path,(err)=>{
                    if(err) return reject(err);

                    return resolve(result.secure_url);
                });
            },
            {
                public_id: cloud_path,//picture is saved according to this path
                width: 200,
                height: 200
            } );
        //uncomment if you want to save to local computer
        // fs.rename(old_path, new_path, (err)=> {//note: rename also remove file from the old path it has before
        //     if ( err ) return reject(err);
        //     jimp.read(new_path,function(err,image){
        //         if(err) return reject(err);
        //         image.resize(200,200)
        //             .quality(100)
        //             .write(new_path);
        //         return resolve(new_path);
        //     });
        //
        // });
    });

}

//create a directory or empty it if it exists
let createDirectory=(directoryPath)=> {
    const directory = path.normalize(directoryPath);//normalize path espcially on windows. C://folder1\file = C://folder/file

    return new Promise((resolve, reject) => {
        fs.stat(directory, (error) => {
            if (error) {
                if (error.code === 'ENOENT') {//directory doesn't exist. we can create one
                    fs.mkdir(directory, (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(directory);
                        }
                    });
                } else {
                    reject(error);
                }
            } else {//directory exists
                fs.readdir(directory, (err, files) => {//empty the directory
                    if (err) reject(err);
                    for (const file of files) {
                        fs.stat(path.join(directory, file),(err,stats)=>{//get info about the content of the existing folder
                            if(err) reject(err);
                            else{
                                if(stats.isDirectory()){//if the existing folder contains a directory
                                    fs.rmdir(path.join(directory, file),(error)=>{
                                        if(error) {
                                            //check if the error is because the sub-folder to remove is not empty
                                            if(error.code=='ENOTEMPTY'){
                                                const sub_dir=path.join(directory,file);//get the sub-directory
                                                fs.readdir(sub_dir,(err,sub_dir_files)=>{//read files in this sub-directory
                                                    if(err) return reject(err);
                                                    sub_dir_files.forEach(sub_dir_file=>{//get each files and remove them
                                                        fs.unlink(path.join(sub_dir, sub_dir_file), error => {//empty the sub-directory
                                                            if(error){
                                                                if(error.code=='EPERM'){
                                                                    return resolve(directory);
                                                                }else{
                                                                    return reject(error);
                                                                }
                                                            }else{
                                                                return resolve(directory);
                                                            }
                                                        });
                                                    })
                                                })
                                            }else{
                                                reject(error);
                                            }

                                        }
                                        else{
                                            resolve(directory);
                                        }
                                    })
                                    //this will delete directory. even if it has files in it
                                    // deleteFile(directory,file)
                                    //     .then(dir=>resolve(directory))
                                    //     .catch(err=>reject(err))
                                }
                                else{//if folder contains files only,remove or unlink those files
                                    fs.unlink(path.join(directory, file), error => {
                                        if(error){
                                            if(error.code=='EPERM'){
                                                return resolve(directory);
                                            }else{
                                                return reject(error);
                                            }
                                        }else{
                                            resolve(directory);
                                        }
                                    });
                                }
                            }
                        });//end of fs.stat()
                    }//end of for loop
                });
            }
        });
    });
}
module.exports={generateRealMessage,findUserInfoFromDB,removeTempFiles,renameFile,changePicture,createDirectory};
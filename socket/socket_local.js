const socketIO=require('socket.io');
const fs=require('fs');
const moment=require('moment');
const path=require('path');
const jimp=require('jimp');
const async=require('async');

const {generateRealMessage,findUserInfoFromDB,removeTempFiles,renameFile,changePicture}=require('../utils/helpers');
const {isRealString,realValue,isImageAvailable} =require('../utils/validation');
const {ChattingUsers}=require('../utils/chattingUsers');
const NodeGeocoder=require('node-geocoder');
const API_KEY='1028bf26864cc6922da7';
const options = {
    provider: 'locationiq',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: API_KEY, // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
}
let History=require('../models/history');
let User=require('../models/user');
const geocoder=NodeGeocoder(options);


module.exports=(server,Siofu)=>{
    let io=socketIO.listen(server);
    let chatUsers=new ChattingUsers();
    let uploader = new Siofu();
    var realUsername;
    let profile='';

    io.on('connection',(socket)=>{
        uploader.listen(socket);
        console.log('a new user is connected');

        io.emit('room-list',chatUsers.getActiveRooms());

        socket.on('join',(params,callback)=>{
            if(!isRealString(params.name) || !isRealString(params.room) || params.room===''){
                return callback('Display name and Room name required!');
            }
            let username=realUsername=realValue(params.name);

            let userRoom=realValue(params.room);

            if(chatUsers.checkUserExist(username,userRoom)){
                return callback("Join another room instead");
            }

            socket.join(params.room);
            chatUsers.removeUser(socket.id);
            chatUsers.addUsers(socket.id,username,userRoom);
            let createdAt= moment().valueOf();

            //removes user files from uploads directory anytime he joins a room or just get connected to server
            //let user uploads_dir=path.join(__dirname,'../public/uploads/jimo_angular.jpg');
            let uploads_dir=path.join(__dirname,'../public/uploads');
            fs.stat(uploads_dir,(err)=>{
                if(err){
                    if(err.code=='ENOENT'){//dir doesn't exist
                        return callback('no directory')
                    }else{
                        return callback('error for fsStat');
                    }
                }else{
                    fs.readdir(uploads_dir,(err,files)=>{//read files in uploads directory
                        if(err){
                            return callback('error for readDir');
                        }
                        let error1='';
                        files.forEach(file=>{//get each user files and remove them
                            let ext=file.split('.').pop();
                            let user_file=params.name+'_'+params.room+'.'+ext;
                            if(file==user_file){
                                fs.unlink(path.join(uploads_dir,file), error => {//remove the file
                                    if(error){
                                        error1=error;
                                    }
                                });
                            }
                        });
                        if(error1){
                            return callback('error for unlink');
                        }
                        //all is well. create User history and emit
                        //user newly joined room. fetch history from DB by room and emit appropriately
                        History.find({room: params.room})
                            .sort({createdAt: -1})// returns history by recent time
                            .limit(10)
                            .exec()
                            .then(histories=>{
                                socket.emit('history',histories);//emitting history

                                io.emit('room-list',chatUsers.getActiveRooms());//get active rooms (rooms and their occurrency) as object and emit
                                //get users from DB and send it alongside the username of online users
                                User.find({})
                                    .select(['username','avatar_path','fullname'])
                                    .exec()
                                    .then(users=>{
                                        io.to(params.room).emit('updateUserList',{all_users: users,online_users: chatUsers.getUserList(params.room)});//get current room users and emit
                                    })
                                    .catch(err=>console.log(err));
                                //socket.leave(params.room) //to leave a room

                                socket.emit('newMessage',generateRealMessage('Admin',`welcome to ${params.room} chat room`,'',createdAt,'','',''));
                                socket.broadcast.to(params.room).emit('newMessage',generateRealMessage('Admin',`${params.name} joined the chat`,'',createdAt,'','',''));
                                callback();
                            })
                            .catch(err=>console.log(err));
                    })
                }
            });//end of fs.stat

        });
        // handles file uploads for both chat and when user wants to upload profile photo
        uploader.dir = path.join(__dirname,'../public/uploads/');
        // Do something when a file is saved:
        uploader.on("saved", function(event){
            console.log(event.file);
        });

        // Error handler:
        uploader.on("error", function(event){
            console.log("Error from uploader", event);
        });
        //emit event when a file is saved
        socket.on('file_saved',(data,cb)=>{
            //handles chat uploads
            if(data.type=='chat'){
                let user=chatUsers.getUser(socket.id);
                console.log('file is saved. username: '+user.name+' ,file :'+data.file_name);
                let fileOriginalname=data.file_name;
                let ext=fileOriginalname.split('.').pop();
                let uploader_username=user.name;
                let uploader_room=user.room;

                const oldNamePath=path.join(__dirname,"../public/uploads/"+fileOriginalname);
                const newNamePath=path.join(__dirname,"../public/uploads/"+uploader_username+"_"+uploader_room+'.'+ext.toLowerCase());
                const newNameRelativePath="/uploads/"+uploader_username+"_"+uploader_room+'.'+ext.toLowerCase();//this is used by browser to display file later

                renameFile(oldNamePath,newNamePath)
                    .then(newPath=>{
                        if(newPath){
                            socket.emit('file-uploaded',{path: oldNamePath,relative_path: newNameRelativePath},(msg)=>{
                                console.log('browser recieves the file', msg);
                            });
                        }
                    })
                    .catch(err=>{
                        console.log(err);
                    });
                cb();
                //handles profile photo uploads
            }else if(data.type=='profile'){
                console.log('file is saved. username: '+data.username+' ,file :'+data.file_name);
                let fileOriginalname=data.file_name;
                let uploader_username=data.username;
                const ext=fileOriginalname.split('.').pop();
                const newFileName=uploader_username+'.'+ext;

                const oldNamePath=path.join(__dirname,"../public/uploads/"+fileOriginalname);
                const newNamePath=path.join(__dirname,"../public/uploads/profile_pictures/"+newFileName.trim().toLowerCase());
                const newNameRelativePath="/uploads/profile_pictures/"+newFileName.trim().toLowerCase();//this is used by browser to display file later

                changePicture(oldNamePath,newNamePath)
                    .then(newPath=>{
                        if(newPath){
                            return User.findOne({username: uploader_username})
                                .exec()
                                .then(user=>{
                                    if(user){
                                        user.avatar_path=newNameRelativePath;
                                        return user.save();
                                    }
                                })
                        }
                    })
                    .then(user=>{
                        if(user){
                            //update the path of user avatar in history DB
                            History.find({from: uploader_username})
                                .exec()
                                .then(user_history=>{
                                    if(user_history){
                                        user_history.forEach(history=>{
                                            history.user_avatar=newNameRelativePath;
                                            history.save();
                                        })
                                    }
                                })
                        }
                        //emit file-uploaded event
                        if(user){
                            socket.emit('file-uploaded',{path: oldNamePath,relative_path: newNameRelativePath},(msg)=>{
                                console.log('browser recieves the file', msg);
                            });
                        }
                    })
                    .catch(err=>{
                        console.log(err);
                    });
                cb();
            }else{
                cb();
            }
        });
        //user click on remove file for browser
        socket.on('remove_file',(data,callback)=>{
            fs.unlink(path.join(__dirname,'../public/'+data.uploaded_path),(err)=>{
                if(err) return console.log(err);
                console.log('file removed successfully');
                callback({status: 'success'});
            });
        });

        //when user sends a message
        socket.on('createMessage',(message,callback)=>{
            let user=chatUsers.getUser(socket.id);

            if(user && (isRealString(message.text) || isImageAvailable(message.path))){// && (isRealString(message.text) || isImageAvailable(message.path))
                let createdAt= moment().valueOf();//set time
                //resize image once the upload starts and save to user dir
                async.waterfall([
                    (cb)=>{
                        findUserInfoFromDB(user.name)
                            .then((user_info)=>{
                                if(user_info){
                                    cb(null,user_info);
                                }else{
                                    cb(null,'');
                                }
                            })
                            .catch(err=>{
                                if(err) cb(err);
                            });
                    },
                    (user_info,cb)=>{
                        if(isImageAvailable(message.path)){//check if image is available in the message
                            const ext=message.path.split(".").pop();
                            const newFilename=user.name+"_"+createdAt+"."+ext.toLowerCase();

                            const oldPath=path.join(__dirname,'../public/'+message.path);
                            const newPath=path.join(__dirname,'../public/uploads/'+user.name+'/'+newFilename);
                            const newRelativePath='/uploads/'+user.name+'/'+newFilename;

                            jimp.read(oldPath,function(err,image){
                                if(err) throw err;
                                image.resize(200,200)
                                    .quality(100)
                                    .write(newPath);
                                fs.unlink(oldPath,(err)=>{
                                    if(err) throw err;
                                    message.path=newRelativePath;
                                    cb(null,user_info);
                                });

                            });
                        }//end of if isImageAvailable()
                        else{
                            cb(null,user_info);
                        }
                    },
                    (user_info)=>{
                        let lat=message.lat;
                        let lon=message.lon;
                        let state='';
                        let country='';
                        console.log(lat,lon);
                        if(lat && lon){//if user allows location
                            geocoder.reverse({lat,lon}) //find user location by this latitude and longitude provided
                                .then(result=>{
                                    console.log(result);
                                    state=result[0].state;
                                    country=result[0].country;

                                    //NOTE: generateRealMessage returns {name,text,createdAt,state,country}
                                    socket.broadcast.to(user.room).emit('newMessage',generateRealMessage(user.name,message.text,message.path,createdAt,state,country,user_info.avatar_path));
                                    socket.emit('newMessage',generateRealMessage('You',message.text,message.path,createdAt,state,country,user_info.avatar_path));

                                    //save message to DB as history
                                    let history=new History({from: user.name, text: message.text,file_path: message.path, room: user.room, state, country,user_avatar: user_info.avatar_path, createdAt});
                                    history.save()
                                        .then((saved_history)=>{
                                            return console.log(saved_history);
                                        })
                                        .catch((err)=>console.log(err));
                                    //history DB format: {room: 'standard',from: 'jimoh',text: 'hello',createdAt: 23456,kogi,nigeria}
                                })
                                .catch(err=>{
                                    console.log(err);
                                });
                        }else{//user didnt allow his location
                            //NOTE: generateRealMessage returns {name,text,createdAt,state,country,...}
                            socket.broadcast.to(user.room).emit('newMessage',generateRealMessage(user.name,message.text, message.path,createdAt,state,country,user_info.avatar_path));
                            socket.emit('newMessage',generateRealMessage('You',message.text,message.path,createdAt,state,country,user_info.avatar_path));

                            //save message to DB as history
                            let history=new History({from: user.name, text: message.text,file_path: message.path, room: user.room, state, country,user_avatar: user_info.avatar_path, createdAt});
                            history.save()
                                .then((saved_history)=>{
                                    return console.log(saved_history);
                                })
                                .catch((err)=>console.log(err));
                            //history DB format: {room: 'standard',from: 'jimoh',text: 'hello',createdAt: 23456,kogi,nigeria}
                        }
                    }//,
                    // ()=>{
                    //
                    // }
                ])
            }
            callback();
        });

        socket.on('typing',(data)=>{
            let user=chatUsers.getUser(socket.id);
            if(data.status==='finished'){
                socket.broadcast.to(user.room).emit('typing-reply',{status: 'finished'});
            }else if(data.status==='typing'){
                socket.broadcast.to(user.room).emit('typing-reply',{status: 'typing',name: user.name});
            }
        });

        socket.on('disconnect',()=>{
            //let user=chatUsers.removeUser(socket.id);
            let user=chatUsers.removeUser(socket.id);
            let createdAt= moment().valueOf();//set time

            if(user){
                io.emit('room-list',chatUsers.getActiveRooms());
                io.to(user.room).emit('updateUserList',chatUsers.getUserList(user.room));
                io.to(user.room).emit('newMessage',generateRealMessage('Admin',`${user.name} has left`,'',createdAt,'','',''));
                removeTempFiles(user.name,user.room)
                    .then(msg=>{
                        if(msg=='ENOENT'){
                            console.log('ENOENT');
                        }else if(msg=='unlink'){
                            console.log('user files unlinked');
                        }else{
                            console.log('nothing was unlink in uploads dir for user');
                        }
                    })
                    .catch(err=>console.log(err));
            }
            console.log('user disconnected');
            //empty user temp dir
            // let user=chatUsers.removeUserByUsername(realUsername);

        });
    });
    // io2.on('connection',(socket)=>{
    //     console.log('user 2 connected');
    //     //this is for profile picture upload
    //     socket.on('profile_upload',(data,cb)=>{
    //         profile=data.name;
    //         cb(profile);
    //     });
    // })
}

const _=require('lodash');
let User=require('../models/user');
const async=require('async');

class ChattingUsers{
    constructor(){
        this.users=[];
    }
    addUsers(id,name,room){
        var user={id,name,room};
        this.users.push(user);

        return user;
    }
    removeUser(id){
        var user=this.getUser(id);
        if(user){
            this.users=this.users.filter(user => user.id !== id);
        }
        return user;
    }
    getUser(id){
        return this.users.filter((user)=>user.id===id)[0]
    }
    getUserList(room){
        var users=this.users.filter((user)=>user.room===room);
        var namesArray=users.map((user)=>user.name);

        return namesArray;
    }
    getActiveRooms(){
        //get all rooms occupied currently. it can include repetition as more than one user can be in same room
        var rooms=this.users.map(user=>user.room); //[Angular,React,Angular,PHP,Angular,PHP]
        //returns an object of rooms and number of people in it
        var roomsAndOccurrence=_.countBy(rooms,_.identity); //{Angular: 3,React: 1,PHP: 2}

        return roomsAndOccurrence;
    }
    checkUserExist(name,room){
        var users=this.users.filter((user)=>{
            return user.name===name && user.room===room;
        });

        if(users.length>0){
            return true;
        }else{
            return false;
        }
    }
}

module.exports={ChattingUsers};
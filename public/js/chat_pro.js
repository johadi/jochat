
//Socket.Io and other codes comes here

var socket=io();
var uploaded_path="";
//function that performs the scrolling to bottom automatically as messages trickles in
function scrollToBottom(){
    //selectors
    var messages=jQuery('.chat_area');

    var newMessage=$('.chat_area li:last-child');

    //heights
    var clientHeight=messages.prop('clientHeight');
    var scrollTop=messages.prop('scrollTop');
    var scrollHeight=messages.prop('scrollHeight');
    var newMessageHeight=newMessage.innerHeight();
    var lastMessageHeight=newMessage.prev().innerHeight();

    if(clientHeight + scrollTop + newMessageHeight+ lastMessageHeight >= scrollHeight){
        messages.scrollTop(scrollHeight);
    }
}

var params=jQuery.deparam(window.location.search);//convert your url query string (i.e ?name=jo&age=20) to object
socket.on('connect',function(){
    params={name: params.name.toLowerCase(),room: params.room.toLowerCase()};

    socket.emit('join',params,function(err){//join a room by the username and room you choose
        if(err){
            console.log(err);
            // swal({
            //     title: 'You already in '+params.room.toLowerCase()+' room!',
            //     type: 'warning',
            //     text: err,
            //     showConfirmButton: false,
            //     timer: 2000
            // }).then(
            //     function () {},
            //     // handling the promise rejection
            //     function (dismiss) {
            //         if (dismiss === 'timer') {
            //             window.location.href='/home';
            //         }
            //     }
            // )
            // alert(err);
        }else{
            if(uploaded_path){
                uploaded_path='';
            }
            console.log('request to join room accepted');
        }
    })
});

socket.on('disconnect',function(){
    console.log('disconnected from server');
});

socket.on('updateUserList',function(usersList){//where active users are displayed
    //NOTE: online_users is an array of usernames only = ['jimoh','sanni','muhammed','bello']
    //all_users is an array of objects of all users from DB containing only {usernames,fullnames,avatar_path}
    //i.e of all_users= [{username: 'jimoh',fullname: 'jim had',avatar_path: '/uploads/jim.jpg'},{...},{...}]

    //filter all users with online users' usernames to get the full details of online users
    var online_users_details=usersList.all_users.filter(function(user){
        return _.includes(usersList.online_users,user.username);//used to get the details of online users.
    })

    var ul=jQuery('<ul class="list-unstyled"></ul>');
    online_users_details.forEach(function(online_user){
        var template=jQuery('#members-template').html();
        var output=Mustache.render(template,{user: online_user.username,member_avatar: online_user.avatar_path});

        ul.append(output);
    });
    jQuery('#member_list').html(ul);
    //jQuery('#online').text('| online: '+usersList.length);
});

socket.on('history',function(histories){
    _.reverse(histories);//this makes recent history to show first as the list goes down
    jQuery('#messages2').html('');
    histories.forEach(function (history) {
        var formattedTime=moment(history.createdAt).format('MMM Do YY, h:mm a');
        var divider="";
        var file_pull="pull-left";
        var location_pull="pull-right";
        var admin_chat="";

        if(history.state !="" && history.country !=""){
            divider=".";
        }
        if(history.file_path){//if history has a file

            if(history.from===params.name) {//if message is from user
                history.from='';
                file_pull="pull-right";
                location_pull="pull-left";
                admin_chat="admin_chat";

                var template=jQuery('#message-template-for-user-file').html();

                var output=Mustache.render(template,{
                    text: history.text,
                    from: history.from,
                    createdAt: formattedTime,
                    url: history.file_path,
                    file_pull: file_pull,
                    location_pull: location_pull,
                    admin_chat: admin_chat,
                    location: divider+" "+history.state+' , '+history.country
                });
                jQuery('#messages2').append(output);
                scrollToBottom();

            }else{//if message is by other members
                var template=jQuery('#message-template-for-file').html();

                var output=Mustache.render(template,{
                    text: history.text,
                    from: history.from,
                    createdAt: formattedTime,
                    avatar: history.user_avatar,
                    url: history.file_path,
                    file_pull: file_pull,
                    location_pull: location_pull,
                    admin_chat: admin_chat,
                    location: divider+" "+history.state+' , '+history.country
                });
                jQuery('#messages2').append(output);
                scrollToBottom();
            }
        }else{//if history has no file
            if(history.from===params.name) {//if history is for user
                history.from='';
                file_pull="pull-right";
                location_pull="pull-left";
                admin_chat="admin_chat";

                var template=jQuery('#message-template-for-user').html();

                var output=Mustache.render(template,{
                    text: history.text,
                    from: history.from,
                    createdAt: formattedTime,
                    file_pull: file_pull,
                    location_pull: location_pull,
                    admin_chat: admin_chat,
                    location: divider+" "+history.state+' , '+history.country
                });
                jQuery('#messages2').append(output);
                scrollToBottom();
            }else{//if history is for other members
                var template=jQuery('#message-template').html();

                var output=Mustache.render(template,{
                    text: history.text,
                    from: history.from,
                    createdAt: formattedTime,
                    avatar: history.user_avatar,
                    file_pull: file_pull,
                    location_pull: location_pull,
                    admin_chat: admin_chat,
                    location: divider+" "+history.state+' , '+history.country
                });
                jQuery('#messages2').append(output);
                scrollToBottom();
            }
        }
    });
    // jQuery('#messages').append('<hr/>');
    // scrollToBottom();
});

var siofu=new SocketIOFileUpload(socket);
//user trying to upload a file
siofu.listenOnInput(document.getElementById("upload-file-selector")); //does not require submit button to upload

// Do something if upload starts:
siofu.addEventListener("start", function(event){
    $('#fileselector').hide();
    $('#show-location').attr('disabled','disabled');
    $('#send-button').attr('disabled','disabled');

    var span=jQuery('<span id="uploading">Uploading...</span>');
    var loader=jQuery('#loader');
    span.insertAfter(loader);
    loader.show();
    console.log("Upload has started");
});
// Do something on upload progress:especially for progress bar
siofu.addEventListener("progress", function(event){
    var percent = event.bytesLoaded / event.file.size * 100;

    console.log("File is", percent.toFixed(2), "percent loaded");
});

// Do something when a file is uploaded:
siofu.addEventListener("complete", function(event){
    $('#uploading').remove();
    $('#loader').hide();
    $('#remove_file').show();
    $('#show-location').removeAttr('disabled');
    $('#send-button').removeAttr('disabled');
    // $('#upload-file-selector').attr('disabled','disabled');
    // $('#fileselector').show();
    console.log('Success: '+event.success);
    console.log(event.file.name);
    socket.emit('file_saved',{file_name: event.file.name,type: 'chat',username: ''},function(){
        console.log('file saved to the server successfully');
    })
});
//user uploaded file and is saved temporary. path for the temporary file is set for future use when user want to send message
socket.on('file-uploaded',function(data,callback){//when file is temporarily saved
    uploaded_path=data.relative_path;
    $('#show-location').removeAttr('disabled');
    $('#send-button').removeAttr('disabled');
    console.log(uploaded_path);
    callback(data);
});

//code for when user wants to preview the image he uploaded temporary. use uploaded_path variable

//user has no intention of sending a message or send message with file again.so he cancel image and the temporary uploaded file is removed
$('#remove_icon').on('click',function(){
    if(uploaded_path){
        $('#remove_file').hide();
        $('#fileselector').show();// display normal place for user to upload if he wishes again
        socket.emit('remove_file',{uploaded_path: uploaded_path},function(data){
            if(data.status==='success'){
                uploaded_path="";
            }
            console.log('file removed successfully. Path: '+uploaded_path);
        });
    }
});
//if user ever tries to reload a page while there is a pending file uploaded temporarily.empty his temp folder
// 0 => user just typed in an Url
// 1 => page reloaded
// 2 => back button clicked.
//check for navigation time API support
// if (window.performance) {
//     console.info("window.performance work's fine on this browser");
// }
// if (performance.navigation.type == 1) {
//     socket.emit('page_action',{action: 'reload'},function(data){
//         if(data.status=='error'){
//             console.log('error happened')
//         }else if(data.status=='fail'){
//             console.log('fail');
//         }
//         else if(data.status=='success'){
//             uploaded_path='';
//             console.log('success');
//         }
//     });
//     console.info( "This page is reloaded.");
// } else if(performance.navigation.type == 2){
//     socket.emit('page-action',{action: 'back'},function(data){
//         if(data.status=='error'){
//             console.logt('error happened')
//         }else if(data.status=='fail'){
//             console.log('fail');
//         }
//         else if(data.status=='success'){
//             uploaded_path='';
//             console.log('success');
//         }
//     });
//     console.info( "user click browser back button ");
// }
//end of user trying to upload

//user sending a message
var messageTextBox=jQuery('[name=message]');//get the message box
jQuery('#message-form').on('submit',function(e){//handles the message form field
    e.preventDefault();//prevents the form from reloading on submit
    var showLocation=this.elements['show_location'];
    var text=messageTextBox.val();

    if(text){
        $('#show-location').attr('disabled','disabled');
        $('#upload-file-selector').attr('disabled','disabled');
        $('#send-button').attr('disabled','disabled');
        $('#buttonload').show();
    }
    if(showLocation.checked){//if user permits his location to be shared
        if(!navigator.geolocation){
            return alert('Geolocation not supported for your browser');
        }
        navigator.geolocation.getCurrentPosition(function(position){
            if(!text){
                text="";
            }
            socket.emit('createMessage', {
                    text: text,
                    path: uploaded_path,
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                },
                function(){
                    $('#show-location').removeAttr('disabled');
                    $('#upload-file-selector').removeAttr('disabled');
                    $('#send-button').removeAttr('disabled');
                    $('#buttonload').hide();
                    uploaded_path='';//empty the uploaded path variable
                    messageTextBox.val('');//empty the message field once the user sent it
                }
            );
        },function(){
            $('#show-location').removeAttr('disabled');
            $('#upload-file-selector').removeAttr('disabled');
            $('#send-button').removeAttr('disabled');
            $('#buttonload').hide();
            alert('Unable to fetch location');
        });

    }else{//if user does not permit his location
        if(!text){
            text="";
        }
        socket.emit('createMessage', {
                text: text,
                path: uploaded_path,
                lat: '',
                lon: ''
            },
            function(){
                $('#show-location').removeAttr('disabled');
                $('#upload-file-selector').removeAttr('disabled');
                $('#send-button').removeAttr('disabled');
                $('#buttonload').hide();
                uploaded_path='';
                messageTextBox.val('');//empty the message field once the user sent it
            }
        );
    }
});

var typing=jQuery('#typing');//get the typing p element
socket.on('newMessage',function(message){//where coming messages are appended
    var formattedTime=moment(message.createdAt).format('h:mm a');
    var divider="";
    var file_pull="pull-left";
    var location_pull="pull-right";
    var admin_chat="";

    if(message.state !="" && message.country !=""){
        divider=".";
    }

    if(message.from=='Admin'){
        var template=jQuery('#message-template-for-admin').html();

        var output=Mustache.render(template,{
            text: message.text,
            createdAt: formattedTime,
            location_pull: location_pull,
            admin_chat: admin_chat,
        });
        typing.text("");//empty the typing P element
        jQuery('#messages2').append(output);

        $('#show-location').removeAttr('disabled');
        $('#upload-file-selector').removeAttr('disabled');
        $('#send-button').removeAttr('disabled');
        $('#buttonload').hide();

        $('#remove_file').hide();
        $('#fileselector').show();// display normal place for user to upload if he wishes again
        scrollToBottom();
    }
    else if(message.file_path) {//if a message has file attachement

        if(message.from==='You') {//if message is sent by user
            file_pull="pull-right";
            location_pull="pull-left";
            admin_chat="admin_chat";

            var template=jQuery('#message-template-for-user-file').html();
            var output=Mustache.render(template,{
                text: message.text,
                createdAt: formattedTime,
                url: message.file_path,
                file_pull:file_pull,
                location_pull: location_pull,
                admin_chat: admin_chat,
                location: divider+' '+message.state+" , "+message.country
            });
            typing.text("");//empty the typing P element
            jQuery('#messages2').append(output);

            $('#show-location').removeAttr('disabled');
            $('#upload-file-selector').removeAttr('disabled');
            $('#send-button').removeAttr('disabled');
            $('#buttonload').hide();

            $('#remove_file').hide();
            $('#fileselector').show();// display normal place for user to upload if he wishes again
            scrollToBottom();

        }else{//if message is sent by other members in the room
            var template=jQuery('#message-template-for-file').html();
            var output=Mustache.render(template,{
                text: message.text,
                from: message.from,
                createdAt: formattedTime,
                url: message.file_path,
                avatar: message.user_avatar,
                file_pull:file_pull,
                location_pull: location_pull,
                admin_chat: admin_chat,
                location: divider+' '+message.state+" , "+message.country
            });
            typing.text("");//empty the typing P element
            jQuery('#messages2').append(output);

            $('#show-location').removeAttr('disabled');
            $('#upload-file-selector').removeAttr('disabled');
            $('#send-button').removeAttr('disabled');
            $('#buttonload').hide();

            $('#remove_file').hide();
            $('#fileselector').show();// display normal place for user to upload if he wishes again
            scrollToBottom();

        }
    }else{//if a message has no file attachement
        if(message.from==='You') {
            file_pull="pull-right";
            location_pull="pull-left";
            admin_chat="admin_chat";

            var template=jQuery('#message-template-for-user').html();
            var output=Mustache.render(template,{
                text: message.text,
                createdAt: formattedTime,
                file_pull:file_pull,
                location_pull: location_pull,
                admin_chat: admin_chat,
                location: divider+' '+message.state+" , "+message.country
            });
            typing.text("");//empty the typing P element
            jQuery('#messages2').append(output);
            $('#show-location').removeAttr('disabled');
            $('#upload-file-selector').removeAttr('disabled');
            $('#send-button').removeAttr('disabled');
            $('#buttonload').hide();
            scrollToBottom();
        }else{
            var template=jQuery('#message-template').html();
            var output=Mustache.render(template,{
                text: message.text,
                from: message.from,
                createdAt: formattedTime,
                avatar: message.user_avatar,
                file_pull:file_pull,
                location_pull: location_pull,
                admin_chat: admin_chat,
                location: divider+' '+message.state+" , "+message.country
            });
            typing.text("");//empty the typing P element
            jQuery('#messages2').append(output);
            $('#show-location').removeAttr('disabled');
            $('#upload-file-selector').removeAttr('disabled');
            $('#send-button').removeAttr('disabled');
            $('#buttonload').hide();
            scrollToBottom();
        }
    }

});

messageTextBox.on('keyup',function(e){
    if(e.keyCode===13){
        socket.emit('typing',{status: 'finished'});
    }else{
        socket.emit('typing',{status: 'typing'});
    }

});
socket.on('typing-reply',function(data){
    if(data.status==='typing'){
        typing.text(data.name+' is typing...');

        setTimeout(function () {
            jQuery('#typing').text("");
        }, 10000);

    }else{
        typing.text("");
    }
});

// var locationButton=jQuery('#send-location');
//
// locationButton.on('click',function(){//handles the location button using geolocation available in our browsers
//     if(!navigator.geolocation){
//         return alert('Geolocation not supported for your browser');
//     }
//
//     locationButton.attr('disabled','disabled').text('Sending location...');
//     navigator.geolocation.getCurrentPosition(function(position){
//         locationButton.removeAttr('disabled').text('Send Location');
//         socket.emit('createLocationMessage',{
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude
//         });
//     },function(){
//         locationButton.removeAttr('disabled').text('Send Location');
//         alert('Unable to fetch location');
//     })
// });

// jQuery('#leave').on('click',function(){
//     alert('hello');
// });
// $('#leave').click(function(){
//     swal({
//         title: 'Are you sure?',
//         html: 'You are about to leave '+params.room.toUpperCase()+' room.',
//         type: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, Leave room!'
//     }).then(function () {
//         window.location.href='/home'
//     });
// })

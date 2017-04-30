/**
 * Created by ILYASANATE on 29/03/2017.
 */
var socket=io();

//function that performs the scrolling to bottom automatically as messages trickles in
function scrollToBottom(){
    //selectors
    var messages=jQuery('#messages');

    var newMessage=messages.children('li:last-child');

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
            swal({
                title: 'You already in '+params.room.toLowerCase()+' room!',
                type: 'warning',
                text: err,
                showConfirmButton: false,
                timer: 2000
            }).then(
                function () {},
                // handling the promise rejection
                function (dismiss) {
                    if (dismiss === 'timer') {
                        window.location.href='/home';
                    }
                }
            )
            // alert(err);
        }else{
            console.log('request to join room accepted');
        }
    })
});

socket.on('disconnect',function(){
    console.log('disconnected from server');
});

socket.on('updateUserList',function(usersList){//where active users are displayed
    var ol=jQuery('<ol></ol>');
    usersList.forEach(function(userList){
        ol.append(jQuery('<li></li>').text(userList));
    });
    jQuery('#users').html(ol);
    jQuery('#online').text('| online: '+usersList.length);
});

socket.on('history',function(histories){
    _.reverse(histories);//this makes recent history to show first as the list goes down
    jQuery('#messages').html('');
    histories.forEach(function (history) {
        var formattedTime=moment(history.createdAt).format('MMM Do YY, h:mm a');
        var template=jQuery('#message-template').html();

        if(history.from===params.name) history.from='You';

        var output=Mustache.render(template,{
            text: history.text,
            from: history.from,
            createdAt: formattedTime
        });

        jQuery('#messages').append(output);
        scrollToBottom();
    });
    // jQuery('#messages').append('<hr/>');
    // scrollToBottom();
});

var typing=jQuery('#typing');//get the typing p element
socket.on('newMessage',function(message){//where coming messages are appended
    var formattedTime=moment(message.createdAt).format('h:mm a');
    var template=jQuery('#message-template').html();
    var output=Mustache.render(template,{
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });

    typing.text("");//empty the typing P element
    jQuery('#messages').append(output);
    scrollToBottom();
});

socket.on('newLocationMessage',function(message){//where user locations are appended
    var formattedTime=moment(message.createdAt).format('h:mm a');
    var template=jQuery('#location-message-template').html();
    var output=Mustache.render(template,{
        url: message.url,
        from: message.from,
        createdAt: formattedTime
    });
    jQuery('#messages').append(output);
    scrollToBottom();
});
var messageTextBox=jQuery('[name=message]');//get the message box
jQuery('#message-form').on('submit',function(e){//handles the message form field
    e.preventDefault();//prevents the form from reloading on submit

    socket.emit('createMessage', {
            text: messageTextBox.val()
        },
        function(){
            messageTextBox.val('');//empty the message field once the user sent it
        }
    );
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

var locationButton=jQuery('#send-location');

locationButton.on('click',function(){//handles the location button using geolocation available in our browsers
    if(!navigator.geolocation){
        return alert('Geolocation not supported for your browser');
    }

    locationButton.attr('disabled','disabled').text('Sending location...');
    navigator.geolocation.getCurrentPosition(function(position){
        locationButton.removeAttr('disabled').text('Send Location');
        socket.emit('createLocationMessage',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    },function(){
        locationButton.removeAttr('disabled').text('Send Location');
        alert('Unable to fetch location');
    })
});

// jQuery('#leave').on('click',function(){
//     alert('hello');
// });
$('#leave').click(function(){
    swal({
        title: 'Are you sure?',
        html: 'You are about to leave '+params.room.toUpperCase()+' room.',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Leave room!'
    }).then(function () {
        window.location.href='/home'
    });
})

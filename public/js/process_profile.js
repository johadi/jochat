/**
 * Created by ILYASANATE on 24/04/2017.
 */

var socket=io();

socket.on('connect',function(){
    console.log('login connected');
});
var siofu=new SocketIOFileUpload(socket);

var username=$('#avatar_username').val();
var uploaded_path="";

siofu.listenOnInput(document.getElementById("avatar_upload")); //does not require submit button to upload
// Do something if upload starts:
siofu.addEventListener("start", function(event){
    // $('#fileselector').hide();
    // $('#show-location').attr('disabled','disabled');
    // $('#send-button').attr('disabled','disabled');
    //
    // var span=jQuery('<span id="uploading">Uploading...</span>');
    // var loader=jQuery('#loader');
    // span.insertAfter(loader);
    // loader.show();
    console.log("Upload has started");
});
// Do something on upload progress:especially for progress bar
siofu.addEventListener("progress", function(event){
    var percent = event.bytesLoaded / event.file.size * 100;
    var percentString=percent.toFixed(0).toString()+"%";

    $('#progress').show();
    $('#progressbar').css('width',percentString).text(percent.toFixed(0).toString()+"% Complete (success)");
    console.log("File is", percent.toFixed(2), "percent loaded");
});

// Do something when a file is uploaded:
siofu.addEventListener("complete", function(event){
    // $('#uploading').remove();
    // $('#loader').hide();
    // $('#remove_file').show();
    // $('#show-location').removeAttr('disabled');
    // $('#send-button').removeAttr('disabled');
    // // $('#upload-file-selector').attr('disabled','disabled');
    // // $('#fileselector').show();
    console.log('Success: '+event.success);
    console.log(event.file.name);

    socket.emit('file_saved',{file_name: event.file.name,type: 'profile',username: username},function(){
        console.log('profile photo saved to the server successfully');
    })
});
//user uploaded file and is saved temporary. path for the temporary file is set for future use when user want to send message
socket.on('file-uploaded',function(data,callback){//when file is temporarily saved
    uploaded_path=data.relative_path;
    $('#img-frame').attr('src',uploaded_path);
    var iframe=document.getElementById('img-frame');
    iframe.src=iframe.src;
    $('#progress').hide();
    $('#progressbar').html('');
    // $('#show-location').removeAttr('disabled');
    // $('#send-button').removeAttr('disabled');
    console.log(uploaded_path);
    callback(data);
});
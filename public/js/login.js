/**
 * Created by ILYASANATE on 05/04/2017.
 */
var socket=io();

var all_rooms=['standard','programming','education','sport','politics','celebrities','business'];

socket.on('connect',function(){
    console.log('login connected');
});

socket.on('room-list',function(rooms){
    var online_rooms=Object.keys(rooms);
    var offline_rooms=all_rooms.filter(function(room){
        return !_.includes(online_rooms,room);
    });

    var select=jQuery("<select name='room' required></select>");
    select.append(jQuery('<option></option>').attr('value','').text('-Select Room-'));

    online_rooms.forEach(function(room){//online rooms added to the select field
        select.append(jQuery('<option></option>').attr('value',room).text(room+'  ('+rooms[room]+' online)'));
    });
    offline_rooms.forEach(function(room){//offline rooms added to the select field too
        select.append(jQuery('<option></option>').attr('value',room).text(room));
    });

    jQuery('#active_rooms').html(select);
    //select.before(label);//same as insertBefore .just syntax diff
    jQuery('<label>Rooms</label>').insertBefore(select);
});
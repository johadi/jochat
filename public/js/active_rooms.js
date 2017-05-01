
var socket=io();

//NOTE: any changes made to this array should be reflected in same array for auth.js of controller folder as they work together
var all_rooms=['angular','angular 2','react','nodejs','php','python','java','android','c++','c#','ruby','sql','nosql'];

socket.on('connect',function(){
    console.log('login connected');
});

socket.on('room-list',function(rooms){//something like {Angular: 3,React: 1,PHP: 2} =rooms and no of members in it
    var online_rooms=Object.keys(rooms); //get only the keys. (i.e [Angular,React,PHP])
    var offline_rooms=all_rooms.filter(function(room){//offline to return array of elements not in online array above
        return !_.includes(online_rooms,room);//check if room is in online rooms
    });

    var select=jQuery("<select class='form-control' name='room' required></select>");
    select.append(jQuery('<option></option>').attr('value','').text('-Select Room-'));

    online_rooms.forEach(function(room){//online rooms added to the select field
        var value=room;
        if(room=='angular 2') value='angular2';
        if(room=='c++') value='cplus';
        if(room=='c#') value='csharp';
        select.append(jQuery('<option></option>').attr('value',value).text(room+'  ('+rooms[room]+' online)'));
    });
    offline_rooms.forEach(function(room){//offline rooms added to the select field too
        var value=room;
        if(room=='angular 2') value='angular2';
        if(room=='c++') value='cplus';
        if(room=='c#') value='csharp';
        select.append(jQuery('<option></option>').attr('value',value).text(room));
    });

    jQuery('#active_rooms').html(select);
    //select.before(label);//same as insertBefore .just syntax diff
    jQuery('<label class="text-success">Pick a room to start chatting with developers</label>').insertBefore(select);
});
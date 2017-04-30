/**
 * Created by ILYASANATE on 12/04/2017.
 */
function processLogin(username,password){
    var data={username: username,password: password}
    $.ajax({
        type: "POST",
        dataType: "json",
        //url: "http://localhost:5000/user/login",
        url: "https://devechat.herokuapp.com/user/login",
        data: JSON.stringify(data) ,//converts the string to json data and sends to server
        contentType: "application/json", //use req.body to get your data.if you don't use this, you will have to get your data using req.params
        success: function(returnedData) {
            switch(returnedData.status){

                case 0:
                    var login=$('#login');
                    login.off('submit'); //off the preventDefault submit
                    login.submit();// submit form without preventDefault event
                    break;

                case 1:
                    var login_div=$('#login-message');
                    login_div.html("Invalid Username or Password").css("display","block");
                    setTimeout(function(){
                        login_div.html("").css("display","none");
                    },5000);
                    break;

                default:
                    alert('can.t login now...try again');

            }//end of switch
        },
        error: function(jqXHR, textStatus, err) {
            //show error message
            alert('text status '+textStatus+', err '+err);
        }
    });
}

function processSignup(username,fullname,email,password){
    var data={username: username, fullname: fullname,email: email,password: password}
    $.ajax({
        type: "POST",
        dataType: "json",
        //url: "http://localhost:5000/user/signup",
        url: "https://devechat.herokuapp.com/user/signup",
        data: JSON.stringify(data) ,//converts the string to json data and sends to server
        contentType: "application/json", //use req.body to get your data.if you don't use this, you will have to get your data using req.params
        success: function(returnedData) {
            // if(returnedData.status===0){
            //     var signup=$('#signup');
            //     signup.off('submit'); //off the preventDefault submit form for signup
            //     var agreed=this.elements['agreed']; //name of the check input form
            //     if(agreed.checked){
            //         alert('checkbox is checked');
            //         signup.submit();
            //         return;
            //     }else{
            //         alert('You must accept our terms and condition to signup');
            //     }
            //     signup.submit()//submit form without preventDefault submit
            //     return;
            // }
            //
            // var signup_message=$('#signup-message');
            // signup_message.text('Username already exist');

            switch (returnedData.status){
                case 0 :
                    var signup=$('#signup');
                    signup.off('submit'); //off the preventDefault event for signup submit

                    // $('#agreed').on('change',function(){
                    //     if(this.checked){
                    //         alert('checkbox is checked');
                    //         signup.submit();
                    //         return;
                    //     }else{
                    //         alert('You must accept our terms and condition to signup');
                    //         return;
                    //     }
                    // });
                    signup.submit()//submit form without preventDefault event
                    break;
                case 1 :
                    var signup_div=$('#signup-message');
                    signup_div.html("There are problems with your inputs").css("display","block");
                    setTimeout(function(){
                        signup_div.html("").css("display","none");
                    },5000);
                    break;
                case 2 :
                    var signup_div=$('#signup-message');
                    signup_div.html("The email is already used").css("display","block");
                    $('#signup-email').select();
                    setTimeout(function(){
                        signup_div.html("").css("display","none");
                    },5000);

                    break;
                case 3 :
                    var signup_div=$('#signup-message');
                    signup_div.html("Username is already existing").css("display","block");
                    $('#signup-username').select();
                    setTimeout(function(){
                        signup_div.html("").css("display","none");
                    },5000);
                    break;
                default :
                    alert('Error occurred ...Try again');
            }

        },
        error: function(jqXHR, textStatus, err) {
            //show error message
            alert('text status '+textStatus+', err '+err);
        }
    });
}

$(document).ready(function(){
    $('#login').on('submit',function(e){
        e.preventDefault();//prevent form from submit until Ajax process the login

        var username=$('#login-username').val();
        var password=$('#login-password').val();
        var login_message=$('#login-message');

        if(!username || !password){
            login_message.text('All fields are required');
            setTimeout(function(){
                login_message.text('');
            },5000)//clear message after 5 seconds
            return ;
        }

        //call ajax to handle the login
        processLogin(username,password);
    });

    $('#signup').on('submit',function(e){
        e.preventDefault();//prevent the page from loading until ajax process the signup


        var username=$('#signup-username').val();
        var fullname=$('#signup-fullname').val();
        var email=$('#signup-email').val();
        var password=$('#signup-password').val();
        var confirm_password=$('#signup-confirm-password').val();
        var sinup_message=$('#signup-message');

        if(password !==confirm_password){
            var signup_div=$('#signup-message');
            signup_div.html("Password not matched!").css("display","block");
            setTimeout(function(){
                signup_div.html("").css("display","none");
            },5000);
            return;
        }

        //call ajax to handle the signup
        processSignup(username,fullname,email,password);
    });
})
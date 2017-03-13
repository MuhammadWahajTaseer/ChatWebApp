// shorthand for $(document).ready(...)
$(function() {

    var socket = io();

    // Server assigned me this name
    socket.on('assignedName', function(name){

        var cookie = document.cookie;
        // Check for a cookie
        if(cookie.includes("username")){
            var uname = cookie.split("=")[1];

            socket.username = uname;
            $('#yourName').html(uname);
            socket.emit('haveACookie', uname);
        }


        // If there isn't a cookie then make one
        else{
            // Assign client side socket the same name
            socket.username = name;
            $('#yourName').html(name);

            // Make a cookie
            document.cookie = "username=" + name;
        }

    });


    $('form').submit(function(){
      if($('#m').val().trim()){
          console.log(socket);
          socket.emit('chat', {m: $('#m').val(), sender: socket.username});
          $('#m').val('');
      }
		return false;
	});

	socket.on('chat', function(msg){
	var sender = msg.sentBy;

	// Prepend html insertion for time
    var rowInsert = '<tr><td class = "col1">' + msg.time;

    // Modify middle of html string for user depending on color
    if(msg.color && (socket.username.localeCompare(sender) === 0)){
      rowInsert += '</td><td class = "col2 thisIsMe" style="color: #' + msg.color + '">';
    }
    else if(msg.color){
        rowInsert += '</td><td class = "col2" style="color: #' + msg.color + '">';
    }
    else if(socket.username.localeCompare(sender) === 0) {
        rowInsert += '</td><td class = "col2 thisIsMe">';
    }
    else{
        rowInsert += '</td><td class = "col2">';
    }
    rowInsert += msg.user;

    // Append ending for actual message bolded depending on sender
    if(socket.username.localeCompare(sender) === 0){
        // Bold message
        rowInsert +=  ' </td><td class = "col3 thisIsMe">' + msg.message + '</td></tr>';
    }
    else{
        // Not bold
        rowInsert +=  ' </td><td class = "col3">' + msg.message + '</td></tr>';
    }

    // HTML line for message is "rowInsert"
    $('#messageTable').find('tbody').append(rowInsert);
    $('#containerMSG').scrollTop($('#containerMSG').scrollTop() + $('#containerMSG').height());

  });



  socket.on('updateYourName', function(myUser){
    $('#yourName').html(myUser);
    socket.username = myUser;
    document.cookie = "username=" + myUser;
  });

  socket.on('get users', function(data){
    var htm = '';
      for (var i = 0; i < data.length; i++){
        htm += '<li>'+data[i]+'</li>';
      }
      $('#users').html(htm);
  });

});

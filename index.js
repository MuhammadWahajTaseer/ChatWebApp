var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var chatlog = [];

var color = "";
var users = [];
var connections = [];
var username = "User";
var userCount = 1;

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// listen to 'chat' messages
io.on('connection', function(socket){

    // New user
    connections.push(socket);
    socket.color = "";
    socket.username = username + userCount;
    userCount++;
    users.push(socket.username);

    // Sending client's username to client, upon which client checks for cookies
    socket.emit('assignedName', socket.username);

    console.log("Connected: %s sockets connected | User: %s connected", connections.length, socket.username);
    //socket.emit('newUser', socket.username);

    updateUsernames();

    // If user disconnects
    socket.on('disconnect', function(data){
      users.splice(users.indexOf(socket.username), 1);
      updateUsernames();

      connections.splice(connections.indexOf(socket), 1);
      console.log('Diconnected: %s sockets connected', connections.length);
    });


    // If client has cookie, update their username
    socket.on('haveACookie', function(uname){
        // Get rid of previous username in array
        users.splice(users.indexOf(socket.username), 1);

        // Update socket's name, add it to array and update users
        socket.username = uname;
        users.push(uname);
        updateUsernames();
    });

    // After username stuff retreive messages from log
    if(chatlog.length > 0){
      for(var i = 0; i < chatlog.length; i++){
        socket.emit('chat', {time: chatlog[i][0],
          user: chatlog[i][1],
          message: chatlog[i][2],
          color: chatlog[i][3],
          sentBy: chatlog[i][4]});
        }
    }




    // Send message
    io.emit()
    socket.on('chat', function(msg){

      // Declaring received attributes
      var sender = msg.sender;
	    msg = msg.m;

      // Check if nickname request command
      if(msg.split(" ")[0].localeCompare("/nick") === 0){

        // Check if user name exists
        var nickname = msg.replace("/nick ","");
        if (nickname){

            // Check if it's unique
            for(i = 0; i < users.length; i++){
                if(nickname.localeCompare(users[i]) === 0){
                    return;
                }

                // Assigning unique username to user
                users.splice(users.indexOf(socket.username), 1);    // Delete previous username
                users.push(nickname);                               // Add new suername
                socket.username = nickname;                         // Assign it to soket
                updateUsernames();                                  // Update online users
                socket.emit('updateYourName', nickname);            // Let client know
            }
        }
        return;
      }

      // Check if nickname colour request command
      if(msg.split(" ")[0].localeCompare("/nickcolor") === 0){

        // Check format              *** must be in format "RRGGBB" and it must be hex value ****
        var nickColor = msg.split(" ", 2)[1];
        if (nickColor.length === 6){

            //Assign color to the user
            socket.color = nickColor;
        }
        return;
      }

      now = new Date().toString().split(" ")[4];
      var socketName = socket.username;
      var socketColor = socket.color;
      io.emit('chat', {time: now,
                      user: socketName,
                      message: msg,
                      color: socket.color,
                      sentBy: sender});

        // Logging it
        chatlog.push([now, socketName, msg, socketColor, sender]);
        if(chatlog.length > 200){
            chatlog.shift();
        }

    });

    function updateUsernames(){
        io.emit('get users', users);
        return;
    }

});

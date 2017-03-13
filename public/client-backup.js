// shorthand for $(document).ready(...)
$(function() {

    var socket = io();

    $('form').submit(function(){

      if($('#m').val().trim()){
    		socket.emit('chat', $('#m').val());
    		$('#m').val(''); 
      }
		return false;
	});
	

	socket.on('chat', function(msg){
		var rowInsert = "<tr><td>" + msg.time + " </td><td>" + msg.user + " </td><td>" + msg.message + "</td></tr>";
    $('messageTable').append(rowInsert);


		$('#containerMSG').scrollTop($('#containerMSG').scrollTop() + $('#containerMSG').height());
  });

  socket.on('newUser', function(myUser){
   	$('#yourName').html(myUser);
  });

  socket.on('get users', function(data){
    var htm = '';
    for (i = 0; i < data.length; i++){
      htm += '<li>'+data[i]+'</li>';
    }
    $('#users').html(htm);
  });
    
});

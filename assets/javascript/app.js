//if player leaves in middle of game then may need to refresh other player's browser

$(document).ready(function() {
	//initialize firebase

	var config = {
    apiKey: "AIzaSyDzxyb8_5GNp9ttdv3hkzcmP72XcN8zOoo",
    authDomain: "week7-rps.firebaseapp.com",
    databaseURL: "https://week7-rps.firebaseio.com",
    storageBucket: "week7-rps.appspot.com",
    messagingSenderId: "812448373875"
  	};

  	firebase.initializeApp(config);

  	// Get a reference to the database service
    var database = firebase.database();
    var num;
    // setup a player
    var newPlayer;
    var numPlayers = database.ref("Players");
    var chat = database.ref("Chat");
    var player1Exists;
    var player2Exists;
    var player1Data = database.ref("Players/Player_1");
    var player2Data = database.ref("Players/Player_2");
    var player1Wins = 0;
    var player2Wins = 0;
    var player1Losses = 0;
    var player2Losses = 0;
    var player1Ties = 0;
    var player2Ties = 0;

    var player1Choice;
    var player2Choice;
    var turn;
    var name;
    var playerNumber; //use this var to keep track of the player state

    //if two players already playing, need to prevent third player being added to database
    //if at least one player isn't already present then need to delete all chat data from the database
    numPlayers.on("value", function(snapshot) {
    	num = snapshot.numChildren();
    	console.log(num);
      if (snapshot.child("Player_1").exists()) {
        turn = snapshot.child("Player_1").val().turn;
      };
      console.log(turn);
    });
    //check if player 1 and/or exist
    numPlayers.on("value", function(snapshot) {
        player1Exists = snapshot.child("Player_1").exists();
        console.log(player1Exists)
        player2Exists = snapshot.child("Player_2").exists();
        //remove all previous chats if two players no longer present
        if (!(player1Exists || player2Exists)) {
          chat.remove();
        }
    });

    numPlayers.on("child_added", function(snapshot) {
      console.log(snapshot.key);
      var playerAdded = snapshot.key;
      if (playerAdded === "Player_2") {
        $(".selection-buttons").css("display", "initial");
        $(".selection-made").html("");
      }
    })

    $("#submit-player").on("click", function(event) {
  		// Prevent form from submitting
  		event.preventDefault();

  		// Get the input values
      

      if (!player1Exists) {
        playerNumber = "Player 1";
        console.log(playerNumber);
    	name = $("#player-name").val().trim();
    	newPlayer = numPlayers.child("Player_1"); 
    	newPlayer.onDisconnect().remove();
    	newPlayer.set({
       		playerName: name,
        	wins: 0,
        	losses: 0,
          ties: 0,
          turn: 1
      	});
      // need selection to appear once both players are present
      $(".player-input").remove();
      $("#submit-player").remove();
      $(".selection").css("display", "initial");
      if (!player2Exists) {
        $(".selection-buttons").css("display", "none");
        $(".selection-made").text("Waiting for Player 2 to join the game");
      } 
      //$(".selection").css("display", "initial");
      $(".results").html("<p> Wins: " + player1Wins + "</p>" + "<p> Losses: " + player1Losses + "</p>" + "<p> Ties: " + player1Ties + "</p>");
      //$(".selection-buttons").css("display", "none");
      //$(".selection-made").text("Waiting for Player 2 selection") //need within if/else since player 2 might exist from previous round
      $(".player").html("<h3>" + name + "</h3>");
      } else {
        playerNumber = "Player 2";
        name = $("#player-name").val().trim();
        newPlayer = numPlayers.child("Player_2"); //use this var to keep track of the player state
        newPlayer.onDisconnect().remove();
        newPlayer.set({
          playerName: name,
          wins: 0,
          losses: 0,
          ties: 0,
          turn: 1
        });
        // need selection to appear when player 1 is present and after player one has made a selection
        $(".player-input").remove();
        $("#submit-player").remove();
        $(".selection").css("display", "initial");
        $(".results").html("<p> Wins: " + player2Wins + "</p>" + "<p> Losses: " + player2Losses + "</p>" + "<p> Ties: " + player2Ties + "</p>")
        $(".selection-buttons").css("display", "none");
        $(".selection-made").text("Waiting for Player 1 selection")
        $(".player").html("<h3>" + name + "</h3>");
      }
    });

      
    $(".selection").on("click", "#rps-selection", function(event) {
      var selection = $(this).val();
      console.log(selection);
      /*newPlayer.set({
          choice: selection
      });*/
      newPlayer.update({
        choice: selection
      });

      $(".selection-buttons").css("display", "none");
      $(".selection-made").append(selection);
      //newPlayer.child(choice).setValue(selection);

      //function to check winner
      //will need to check if other player has submitted answer
      //else say waiting for other player
      //could do this by checking for existence of choice child
      //or by checking the number of children and making sure it is 5
      /*numPlayers.on("value", function(snapshot) {
      var key = snapshot.key();
      var player = snapshot.val();
      console.log(player);
      console.log(key);
      });*/

      
    });
    //chat stuff
    $(".chat").on("click", "#submit-message", function(event) {
      event.preventDefault(); //prevent page from refreshing
      console.log("button working");
      var message = $("#message").val().trim(); //grab the message typed and store in variable

      chat.push({
        name: name,
        message: message
      });
      $("#message").val("");
    });

    chat.on("child_added", function(snapshot) {
      var addingMessage = snapshot.val();
      $("#comment").prepend(addingMessage.name + ": " + addingMessage.message + "\n");
    });

    
    //when player disconnects display disconnect message in chat area
    //need to add feature here that restarts the game for the existing player without removing their data
    numPlayers.on("child_removed", function(snapshot) {
      //debugger;
      var playerDisconnect = snapshot.val().playerName; 
      console.log(playerDisconnect);
      chat.push({
        name: "ALERT",
        message: playerDisconnect + " has left the game"
      });
    }); 

     player1Data.on("child_added", function(snapshot) {
      player1Choice = snapshot.val(); //this should be the choice made
      console.log("player 1 made a selection");
      console.log(player1Choice);
      $(".selection-buttons").css("display", "initial");
      $(".selection-made").html(""); //removes waiting for player 1 selection
    });
     //if (newPlayer === numPlayers.child("Player_1")) {
      player1Data.on("value", function(snapshot) {
      if (playerNumber === "Player 1") {
        //debugger;
        console.log("newplayer is player 2")
        player1Wins = snapshot.val().wins;
        player1Losses = snapshot.val().losses;
        player1Ties = snapshot.val().ties;
        player1Choice = snapshot.val().choice;
        $(".results").html("<p> Wins: " + player1Wins + "</p>" + "<p> Losses: " + player1Losses + "</p>" + "<p> Ties: " + player1Ties + "</p>");
      };
     });

     //if (newPlayer === numPlayers.child("Player_2")) {
     player2Data.on("value", function(snapshot) {
      if (playerNumber === "Player 2") {
        //debugger;
        console.log("newplayer is player 2")
        player2Wins = snapshot.val().wins;
        player2Losses = snapshot.val().losses;
        player2Ties = snapshot.val().ties;
        player2Choice = snapshot.val().choice;
        $(".results").html("<p> Wins: " + player2Wins + "</p>" + "<p> Losses: " + player2Losses + "</p>" + "<p> Ties: " + player2Ties + "</p>");
      };
     });


    player2Data.on("child_added", function(snapshot) {
      //debugger;
      player2Choice = snapshot.val(); //this should be the choice made
      console.log("player 2 made a selection");
      console.log(player2Choice);
      if(player2Choice === "rock" || player2Choice === "scissors" || player2Choice === "paper") {
        RPSLogic();
        clearChoices();
        
        
      }
      //RPSLogic(); can't put this here since if both are undefined or NaN (not sure) then number of ties increments
    });

    //player2Data.on("value", function(snapshot) {
      //if(snapshot.child("choice").exists()) {
        //RPSLogic(); //this causes continuous addition to database, need to force chrome to shut
      //};
    //});

    function RPSLogic() {

      if ((player1Choice === "rock") && (player2Choice === "scissors")) {
        player1Winner();
      }
      if ((player1Choice === "rock") && (player2Choice === "paper")) {
        player2Winner();
      }
      if ((player1Choice === "scissors") && (player2Choice === "paper")) {
        player1Winner();
      }
      if ((player1Choice === "scissors") && (player2Choice === "rock")) {
        player2Winner();
      }
      if ((player1Choice === "paper") && (player2Choice === "rock")) {
        player1Winner();
      }
      if ((player1Choice === "paper") && (player2Choice === "scissors")) {
        player2Winner();
      }
      if ((player1Choice === player2Choice)) {
        playersTie();
      }
    };

    function player1Winner() {
      console.log("Player 1 wins");   
      player1Wins++;
      player2Losses++;
      player1Data.update({
        wins: player1Wins
      });
      player2Data.update({
        losses: player2Losses
      });  
    };

    function player2Winner() {
      console.log("Player 2 wins");   
      player2Wins++;
      player1Losses++;
      player2Data.update({
        wins: player2Wins
      });
      player1Data.update({
        losses: player1Losses
      });  
    };

    function playersTie() {
      console.log("Players tie");   
      player1Ties++;
      player2Ties++;
      player1Data.update({
        ties: player1Ties
      });
      player2Data.update({
        ties: player2Ties
      });
    };

    function clearChoices() {
      player1Data.update({
        choice: null
      });
      player2Data.update({
        choice: null
      });
      setTimeout(function() {
      // 2 seconds pause
      $(".selection-made").html("");
      $(".selection-buttons").css("display", "initial");
      if (playerNumber === "Player 2") {
          $(".selection-buttons").css("display", "none");
          $(".selection-made").text("Waiting for Player 1 selection")
        }
      }, 2000);
      
    };

});
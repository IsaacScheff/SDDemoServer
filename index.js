const server = require("express");
const http = require('http').createServer(server);
//const cors = require('cors');

let connectedClients = {};

const playerInstance = (socketId) => {
    return {
      id: socketId,
      isPlayerA: false
    };
}

const roomInstance = () => {
    return {
        players: [],
        readyCheck: 0,
        passed: 0,
        gameState: 'not ready',
        movesReceived: 0,
        playerAMove: '',
        playerBMove: ''
    }
}

let gameRooms = new Map();

let hashMapSocketIdToRoomIdRelation = new Map();

let roomId = 0;
gameRooms.set(roomId, roomInstance(roomId));

// Helper function to extract players in a room
const getRoomPlayers = (socketId) => {
    const roomId = hashMapSocketIdToRoomIdRelation.get(socketId);
    const room = gameRooms.get(roomId);
    return room.players;
}

const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:8080',
        methods: ["GET", "POST"]
    }
});

io.on('connection', function(socket){
    console.log('User Connected: ' + socket.id);
    console.log('Room:', roomId);
    let currentRoom = gameRooms.get(roomId);
    let roomPlayers = currentRoom.players;

    console.log('currentRoom', currentRoom, currentRoom.players);

    if (roomPlayers.length < 2) {
        socket.join(roomId);
        currentRoom.players.push(playerInstance(socket.id));
        currentRoom.players[0].isPlayerA = true;
        hashMapSocketIdToRoomIdRelation.set(socket.id, roomId);
  
        if (currentRoom.players.length === 1) {
            io.to(roomId).emit('yourePlayerA');
        }else{
            io.to(roomId).emit("selectScreen"); 
        }
  
    } else { //start a new room
        roomId++;
        gameRooms.set(roomId, roomInstance(roomId));
        console.log('ROOOOOOOMS', gameRooms);
        console.log('creating a new room...', roomId);
        let currentRoom = gameRooms.get(roomId);
        currentRoom.players.push(playerInstance(socket.id));
        currentRoom.players[0].isPlayerA = true;
        socket.join(roomId);
        hashMapSocketIdToRoomIdRelation.set(socket.id, roomId);
        io.to(roomId).emit("selectScreen");
    }
  
    socket.on('characterSelect', function (character) {
        console.log('received: ' + character + ' from ' + socket.id);
        let roomId = hashMapSocketIdToRoomIdRelation.get(socket.id)
        //let players = gameRooms.get(roomId).players;
        //let selectedPlayer = players.find(player => player.id === socketId);

        io.to(roomId).emit('oppoCharacter', character, socket.id);
    });
    

    socket.on ('moveSelection', function (type, move) {
        let roomId = hashMapSocketIdToRoomIdRelation.get(socket.id);
        let room = gameRooms.get(roomId);
        let selectedPlayer = room.players.find(player => player.id === socket.id);

        if(selectedPlayer.isPlayerA){
            room.playerAMove = type + ',' + move;
        }else{
            room.playerBMove = type + ',' + move;
        }
        if(room.playerAMove && room.playerBMove){
            io.to(roomId).emit('playerMoves', room.playerAMove.concat(',', room.playerBMove));
            room.playerAMove = '';
            room.playerBMove = '';
        }
    });

    socket.on('disconnect', function () {
        console.log('A user disconnected: ' + socket.id);
        let roomId = hashMapSocketIdToRoomIdRelation.get(socket.id);
        io.to(roomId).emit('opponentDisconnect');
        // let selectedPlayer = players.find(player => player.id === socket.id);
        // delete selectedPlayer;
        gameRooms.set(roomId, roomInstance(roomId));
        console.log(gameRooms);
    });

});


http.listen(3000, () => {
    console.log("SCserver listening on port 3000")
});




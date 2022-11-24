const server = require("express");
const http = require('http').createServer(server);
//const cors = require('cors');

let players = {};
//let characterSelected = 0;
let playersReady = 0;
let selectionsReceived = 0;
let playerAMove = '';
let playerBMove = '';

const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:8080',
        methods: ["GET", "POST"]
    }
});

io.on('connection', function(socket){
    console.log('User Connected: ' + socket.id);

    players[socket.id] = {
        isPlayerA: false,
        character: null,
        ready: null
    };

    if (Object.keys(players).length < 2) {
        players[socket.id].isPlayerA = true;
    }

    socket.on('playerReady', function () {
        console.log("someone's ready");
        playersReady++;
        if(playersReady === 1){
            io.to(socket.id).emit('yourePlayerA');
            console.log('attempted emit to ' + socket.id);
        }else if(playersReady === 2){
            console.log('Received two readies!');
            io.to(socket.id).emit('yourePlayerB');
            io.emit("selectScreen");
        }
    });

    socket.on('disconnect', function () {
        console.log('A user disconnected: ' + socket.id);
        delete players[socket.id];
    });

    socket.on('characterSelect', function (character) {
        players[socket.id].character = character;
        console.log(players);
        //characterSelected++;
        //console.log(characterSelected);
        io.emit("oppoCharacter", character, socket.id);
    });

    socket.on('moveSelection', function (type, move) {
        if(players[socket.id].isPlayerA === true){
            playerAMove = type + ',' + move;
            console.log(playerAMove);
        }else{
            playerBMove = type + ',' + move;
            console.log(playerBMove);
        }

        selectionsReceived++;
        if(selectionsReceived == 2){
            //emit player A selection to player B and vice versa
            selectionsReceived = 0;
            playerAMove = '';
            playerBMove = '';
            //io.emit('playerAMove', playerAMove);
            //io.emit('playerBMove', playerBMove);
        }
    });
});

http.listen(3000, () => {
    console.log("SCserver listening on port 3000")
});




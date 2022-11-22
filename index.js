const server = require("express");
const http = require('http').createServer(server);
const cors = require('cors');

let players = {};
//let playerA = {};
//let playerB = {};
let selected = 0;
let playersReady = 0;

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
        if(playersReady == 2){
            console.log('Received two readies!');
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
        selected++;
        console.log(selected);
        io.emit("oppoCharacter", character, socket.id);
    });

    if(selected == 2){
        //emit player A selection to player B and vice versa
    }
});

http.listen(3000, () => {
    console.log("SCserver listening on port 3000")
});




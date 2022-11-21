const server = require("express");
const http = require('http').createServer(server);
const cors = require('cors');

const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:8080',
        methods: ["GET", "POST"]
    }
});

//const app = server();  //const app = express(); (might not be using nay of this)

// app.get("/", (req, res) => {
//     res.send("SCserver running");
// });

io.on('connection', function(socket){
    console.log('User Connected: ' + socket.id);
});

http.listen(3000, () => {
    console.log("SCserver listening on port 3000")
});




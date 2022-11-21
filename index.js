const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("SCserver running");
});

app.listen(8080, () => {
    console.log("SCserver listening on port 8080")
});



//console.log("node server?");
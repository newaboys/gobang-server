const dotenv = require("dotenv");
dotenv.config();
dotenv.config({path:`.env.${process.env.NODE_ENV}`});
var express = require('express');
var expressWs = require('express-ws');
var app = express();
expressWs(app);
var wsMap = require('./src/server/wsMap')();
app.ws("/"+process.env.WEBSOCKET_SUFFIX, function (ws, req){
    ws.on('message', function (msg) {
        wsMap.msgDispatcher(ws,msg);
    });
});
app.listen(process.env.SERVER_PORT, function () {
    console.log('app listening on port '+process.env.SERVER_PORT+'!');
});

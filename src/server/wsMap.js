function wsMap() {
    let maps = new Map();//选手的信息keyMap  {key:{palyer:{},ws}}
    let rooms = new Map();//房间{key:{players:[],audience:[]}}
    let player1 = 'player1';
    let player2 = 'player2';
    function sendJSON(ws,msg) {
        ws.send(JSON.stringify(msg));
    }
    function getRoomNo(uuid){
        if(rooms.size === 0){
            rooms.set(uuid,{players:[uuid],audience:[]});
            return uuid;
        }
        let no = "";
        for(let key of rooms.keys()){
            if(rooms.get(key).players.length === 1){
                no = key;
                rooms.get(key).players.push(uuid);
                break;
            }
        }
        if(!no){
            no = uuid;
            rooms.set(uuid,{players:[uuid],audience:[]});
        }

        return no;
    }
    return {
        method:function(ws,uuid,msgJSON){
            let {data, to} = msgJSON;
            let wsArr = [];
            to.forEach(item => {
                if (maps.has(item)) {
                    debugger;
                    sendJSON(maps.get(item).ws,{cmd: "method", data: data});
                }
            });
        },
        /**
         * 双方对话
         * @param ws
         * @param uuid
         * @param msgJSON
         */
        talk:function(ws,uuid,msgJSON){
            let {data, to} = msgJSON;
            let wsArr = [];
            to.forEach(item => {
                if (maps.has(item)) {
                    sendJSON(maps.get(item).ws,{cmd: "talk", data: data});
                }
            });
        },
        clear: function (ws, uuid, msgJSON) {
            maps.clear();
            rooms.clear();
        },
        updateUUID: function (ws, uuid, msgJSON) {
            let {data, to} = msgJSON;
            let wsArr = [];
            maps.forEach(item => {
                if (to.includes(item.player)) {
                    wsArr.push(item.ws);
                }
            });
            wsArr.forEach(item => {
                sendJSON(item,{cmd: "update", data: data});
            })
        },
        update: function (ws, uuid, msgJSON) {
            let {data, to} = msgJSON;
            let wsArr = [];
            to.forEach(item => {
                if (maps.has(item)) {
                    sendJSON(maps.get(item).ws,{cmd: "update", data: data});
                }
            });
        },
        first_connect: function (ws, uuid, msgJSON) {
            uuid = require("uuid").v4();
            let no = getRoomNo(uuid);
            let {playerName} = msgJSON;
            maps.set(uuid, {playerName: playerName, ws: ws});
            if(rooms.get(no).players.length !== 2) return;
            let one1 = rooms.get(no).players[0];
            let one2 = rooms.get(no).players[1];
            let playerNames = {
                [player1]:maps.get(one1).playerName,
                [player2]:maps.get(one2).playerName,
            }
            for(let key of maps.keys()){
                if(one1 === key){
                    sendJSON(maps.get(key).ws,{cmd: "update", data: [{key: 'currentPlayer',val:player1},{key: 'otherPlayer',val:player2}]});
                }
                if(one2 === key){
                    sendJSON(maps.get(key).ws,{cmd: "update", data: [{key: 'otherPlayer',val:player1},{key: 'currentPlayer',val:player2}]});
                }
                sendJSON(maps.get(key).ws,{cmd: "update", data: [
                        {
                            key: 'uuids',
                            val: {
                                [player1]:one1,
                                [player2]:one2,
                            }
                        },
                        {key: 'playing',val:'player1'},
                        {key: 'playerNames',val:playerNames}
                    ]});
            }
        },
        msgDispatcher: function (ws, msg) {
            let msgJSON = JSON.parse(msg);
            let {uuid, params} = msgJSON;
            params.forEach(item => {
                let cmd = item.cmd;
                this[cmd](ws, uuid, item);
            });
        },
        checkWs: function (ws) {
            // if(!sets.has(ws)){
            //     this.addWs(ws);
            // }
        },
        onLineWs: function () {
        },
        addWs: function (ws) {
            // sets.add(ws);
        },
        removeWs: function () {
        },
    }
}

module.exports = wsMap;
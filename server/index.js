var express = require('express');
var http = require('http').Server(app);
const io = require('socket.io')(http,{
    pingTimeout: 60000,
});

const _ = require('lodash');

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline')

const port = new SerialPort('/dev/tty.usbserial-A1065UIA', {
//   parser: SerialPort.parsers.Readline('\n'),
baudRate: 57600,
});

const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
// const parser = port; 

parser.on('data', function (data) {
    received(data);
  });

// expressアプリケーション生成
var app = express();
app.use('/', express.static(__dirname + '/..'));


//serverを生成
var server = app.listen(80, "localhost", function() {
        console.log('%s: Node server started on %s:%d ...',Date(Date.now()));
        });

// socket.ioを設定
io.attach(server);


var buf = [];

function received(s) {
    console.log(s);
    const data = parseLine(s);
    sendDataToClient('41898DD0',data);
}


function parseLine(s) {
    const vs = _.map(s.split(' '),parseFloat);
    return {pressure: _.slice(vs,1,7), temperature: _.slice(vs,7,9)};
}

function sendDataToClient(device_id,data) {
    const time = new Date().valueOf();
    const d = {time,data};
    console.log(JSON.stringify(d));
    io.emit('data',{
        time,
        data
    });
}


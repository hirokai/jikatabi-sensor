var express = require('express');
var http = require('http').Server(app);
const io = require('socket.io')(http,{
    pingTimeout: 60000,
});

const SerialPort = require('serialport');
const port = new SerialPort('/dev/tty.usbserial-DN0519AV', {
//   parser: SerialPort.parsers.Readline('\n'),
baudRate: 9600
});

port.on('data', function (data) {
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
    // console.log(s.length, s);
    if(s[0] == 126){
        const {analog,v_in} = parseLine(buf);
        sendDataToClient('41898DD0',v_in,analog);
        buf = [];
    }
    var b = [];
    for(var i=0;i<s.length;i++){
        b.push(s[i]);
    }
    buf = buf.concat(b);
}


function parseLine(s) {
    const v1 = s[20] * 256 + s[21];
    const v2 = s[22] * 256 + s[23];
    const v3 = s[24] * 256 + s[25];
    const v_in = s[26] * 256 + s[27];
    // const dummy = [Math.random()*100+900,Math.random()*200+800,Math.random()*30+500];
    return {analog: [v1 > 1024 ? 0 : v1, v2 > 1024 ? 0 : v2, v3 > 1024 ? 0 : v3], v_in};
}

function sendDataToClient(device_id,v_in,analog) {
    const time = new Date().valueOf();
    console.log(time,v_in,analog);
    io.emit('data',{
        time,
        v_in,
        analog
    });
}


var io = require("socket.io");
var socket = io();
var serialport = require('serialport');
var readline = require('readline');

var portname = "COM6";

var myPort = new serialport(portname, {
    baudRate: 9600
});

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
myPort.on('open', onOpen);
myPort.on('data', onrecieveData);
myPort.on('error', showError);
rl.on('line', sendData);

function onOpen()
{
    console.log("open connection");
}

function onrecieveData(data)
{
    //console.log(data.toString());
    socket.emit("order",data.toString());
    //sendData("Y");
}

function sendData(data)
{
    //console.log("sending to serial: " + data);
    myPort.write(data);
}

function showError(error)
{
    console.log('Serial port error: ' + error);
}


socket.on("connection",function (newSocket) {
    console.log("Connection received");
    newSocket.on("order", function(msg){
        console.log(msg);
        sendData(msg);
    });
});

module.exports = socket;
var io = require("socket.io");
var socket = io();
var serialport = require('serialport');
var readline = require('readline');

var portname = "COM3";

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

socket.on("L", function(){
    sendData("L");
});

socket.on("S", function(){
    sendData("S");
});

socket.on("connection",function () {
    console.log("Connection received");
});

module.exports = socket;
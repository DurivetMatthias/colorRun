var io = require("socket.io");
var socket = io();
var users = [];
var serialport = require('serialport');
var readline = require('readline');

var portname = "COM5";

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
    console.log(data.toString());
    socket.emit("order",data.toString());
}

function sendData(data)
{
    console.log("sending to serial: " + data);
    myPort.write(data + "\n");
}

function showError(error)
{
    console.log('Serial port error: ' + error);
}

socket.on("connection",function (socket) {
    //console.log("Connection received");



});



module.exports = socket;
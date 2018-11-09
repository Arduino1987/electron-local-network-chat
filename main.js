const { app, BrowserWindow } = require('electron')
const ipc = require('electron').ipcMain;
let username = require('username');
let win

username = username.sync()


function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})




var PORT = 6024;
// var MULTICAST_ADDR = '192.168.1.255';
var MULTICAST_ADDR = '255.255.255.255';
var dgram = require('dgram');
var server = dgram.createSocket("udp4");

server.bind(PORT);

server.on('listening', function () {
  server.setBroadcast(true);
  var address = server.address();
  console.log('UDP server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, rinfo) {
  message = Buffer.from(message, 'base64').toString('utf-8')
  message = Buffer.from(message, 'base64').toString('utf-8')
  console.log(message)
  console.log('Message from: ' + rinfo.address + ':' + rinfo.port + ' - ' + message);
  win.webContents.send('receivedMsg', message)
});

ipc.on('broadcastMsg', function(event, message){
  message = username + ': ' + message
  message = Buffer.from(message).toString('base64')
  server.send(message, 0, message.length, PORT, MULTICAST_ADDR, function () {
    // console.log(`Sent ${message}`)
    console.log(message)
  }); 
});
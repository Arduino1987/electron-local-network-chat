const {
	app,
	BrowserWindow,
	Menu,
	Tray,
	ipcMain
} = require('electron');

const Main = new class
{
	constructor()
	{
		this.mainWindow = null;
		this.mainTray = null;

		this.path = require('path');

		ipcMain.on('broadcast-send-message', this.sendMessage.bind(this));
	}

	/**
	 * Create main window
	 */
	createWindow()
	{
		if ( this.mainWindow !== null ) {
			return false;
		}

		this.mainWindow = new BrowserWindow({
			width: 1024,
			height: 768,
			icon: this.path.join(__dirname, '/icons/app.png'),
			title: 'Chat Messenger'
		});

		// and load the index.html of the app.
		this.mainWindow.loadFile('index.html');
	
		// Emitted when the window is closed.
		this.mainWindow.on('closed', () => {
			console.log('mainWindow::Event -> Close');
			// Dereference the window object, usually you would store windows
			// in an array if your app supports multi windows, this is the time
			// when you should delete the corresponding element.
			this.mainWindow = null;

			return false;
		});

		// win.on('ipc-message', (event, message) => {
		// 	console.log('ipc-message', event, message);
		// });
	}

	/**
	 * Create application tray
	 */
	createTray()
	{
		if ( this.mainTray !== null ) {
			return false;
		}

		let icon_path = this.path.join(__dirname, './icons/tray.png');

		this.mainTray = new Tray(icon_path);

		let contextMenu = Menu.buildFromTemplate([
			{
				label: 'Show Chat',
				click: () => {
					this.mainWindow.show();
				}
			},
			{
				label: 'Quit Chat',
				click: () => {
					app.isQuiting = true;
					app.quit();
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'Open the DevTools.',
				click: () => {
					this.mainWindow.webContents.openDevTools();
				}
			}
		]);
		this.mainTray.setToolTip('This is my application.');
		this.mainTray.setContextMenu(contextMenu);
	}

	sendMessage(event, message)
	{
		var buffer = Buffer.from(message);
		server.send(buffer, PORT, MULTICAST_ADDR, () => {
			console.log('server.send::'+buffer);
		});
	}

	receiveMessage(event, message)
	{
		//
	}
}

const Server = new class
{
	constructor()
	{
		//
	}

	getLocalAddress()
	{
		var os = require('os');
		var ifaces = os.networkInterfaces();

		for ( let item in ifaces ) {
			for ( let i in ifaces[item] ) {
				if ( ifaces[item][i].internal === false && ifaces[item][i].family == 'IPv4' ) {
					return ifaces[item][i].address;
				}
			}
		}

		return 0;
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	Main.createWindow();
	Main.createTray();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	console.log('add::Event -> window-all-closed');
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if ( process.platform !== 'darwin' ) {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	Main.createWindow();
	Main.createTray();
});



var PORT = 6024;
var MULTICAST_ADDR = '255.255.255.255';
var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.bind(PORT);

server.on('listening', function () {
  server.setBroadcast(true);
  var address = server.address();
  console.log('UDP server listening on ' + address.address + ":" + address.port);
});

// Приходящие сообщения
server.on('message', function (buffer, info) {
  var data = {
	from: info.address !== Server.getLocalAddress(),
	message: buffer.toString()
  };
  Main.mainWindow.webContents.send('broadcast-receive-message', data);
});

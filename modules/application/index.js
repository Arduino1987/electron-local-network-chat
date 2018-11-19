'use strict';

class Application
{
    constructor(pathToIndex)
    {
        // Dependencies
        this.electron = require('electron');
        this.server = require('../server');
        this.osInfo = require('../os_info');
        this.path = require('path');

        // Properties
        this.pathToIndex = pathToIndex;
        this.mainWindow = null;
        this.mainTray = null;
        this.defaultWindowSize = {
            width: 1024,
            height: 768
        }
        this.minimumWindowSize = {
            width: 460,
            height: 660
        }
    }

    /**
     * Runs the application.
     */
    run()
    {
        this._createWindow();
        this._createTray();
        this._bindAppLifecycleHandlers();
        this.electron.ipcMain.on('broadcast-send-message', this._sendMessage.bind(this));
        this.server.socket.on('message', this._receiveMessage.bind(this));
    }

    /**
     * Create main window.
     */
    _createWindow()
    {
        if ( this.mainWindow !== null ) {
            return false;
        }

        this.mainWindow = new this.electron.BrowserWindow({
            width: this.defaultWindowSize.width,
            height: this.defaultWindowSize.height,
            icon: this.path.join(__dirname, '/icons/app.png'),
            title: 'Chat Messenger',
            minWidth: this.minimumWindowSize.width,
            minHeight: this.minimumWindowSize.height,
        });

        // and load the index.html of the app.
        this.mainWindow.loadFile(this.pathToIndex);

        // Emitted when the window is closed.
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;

            return false;
        });
    }

    /**
     * Create application tray.
     */
    _createTray()
    {
        if ( this.mainTray !== null ) {
            return false;
        }

        let icon_path = this.path.join(__dirname, './icons/tray.png');
        this.mainTray = new this.electron.Tray(icon_path);

        let contextMenu = this.electron.Menu.buildFromTemplate([
            {
                label: 'Show Chat',
                click: () => {
                    // this.mainWindow.show();
                    let window = this.mainWindow;
                    if (window) {
                        this.showAndFocus();
                    }
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
                label: 'Open DevTools',
                click: () => {
                    this.mainWindow.webContents.openDevTools();
                }
            }
        ]);
        this.mainTray.setToolTip('This is my application.');
        this.mainTray.setContextMenu(contextMenu);
    }

    /**
     * Send message.
     *
     * @param event
     * @param message
     */
    _sendMessage(event, message)
    {
        var buffer = Buffer.from(message);
        this.server.send(buffer);
    }

    /**
     * Receive message.
     *
     * @param buffer
     * @param info
     */
    _receiveMessage(buffer, info)
    {
        var data = {
            from: info.address !== this.osInfo.getLocalAddress(),
            message: buffer.toString()
        };

        this.mainWindow.webContents.send('broadcast-receive-message', data);
    }

    /**
     * Bind app events handlers.
     *
     * @param mainWindow
     * @private
     */
    _bindAppLifecycleHandlers(mainWindow)
    {
        // Quit when all windows are closed.
        this.electron.app.on('window-all-closed', () => {
            // On macOS it is common for applications and their menu bar
            // to stay active until the user quits explicitly with Cmd + Q
            if ( process.platform !== 'darwin' ) {
                this.electron.app.quit();
            }
        });

        this.electron.app.on('activate', () => {
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            this._createWindow();
            this._createTray();
        });
    }

    /**
     * Check window state.
     *
     * @returns boolean
     */
    hasValidWindow() {
        return this.mainWindow && !this.mainWindow.isDestroyed();
    }

    /**
     * Show window.
     */
    showAndFocus() {
        if (!this.hasValidWindow()) {
            return;
        }
        if (this.mainWindow.isMinimized()) {
            this.mainWindow.restore();
        }
        this.mainWindow.show();
        this.mainWindow.focus();
        this.mainWindow.setMinimumSize(this.minimumWindowSize.width, this.minimumWindowSize.height);
    }
}

module.exports = Application;

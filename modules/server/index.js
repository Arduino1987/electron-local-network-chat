'use strict';

class Server
{
    constructor()
    {
        // Dependencies
        this.dgram = require('dgram');

        // Properties
        this.PORT = 6024;
        this.MULTICAST_ADDR = '255.255.255.255';
        this.socket = this.dgram.createSocket('udp4');

        // Initialization
        this.socket.bind(this.PORT);
        this.socket.on('listening', this._listeningHandler.bind(this));
    }

    /**
     * Broadcast buffer.
     *
     * @param buffer
     */
    send(buffer)
    {
        this.socket.send(buffer, this.PORT, this.MULTICAST_ADDR, () => {
            console.log('socket.send: '+buffer);
        });
    }

    /**
     * Socket bound event handler.
     *
     * @private
     */
    _listeningHandler()
    {
        this.socket.setBroadcast(true);
        var address = this.socket.address();
        console.log('UDP socket listening on ' + address.address + ":" + address.port);
    }
}

module.exports = new Server();

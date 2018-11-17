'use strict';

var os = require('os');
var ifaces = os.networkInterfaces();

/**
 * Get system external active ip address.
 *
 * @returns string
 */
function getLocalAddress()
{
    for ( let item in ifaces ) {
        for ( let i in ifaces[item] ) {
            if ( ifaces[item][i].internal === false && ifaces[item][i].family == 'IPv4' ) {
                return ifaces[item][i].address;
            }
        }
    }

    return '';
}

module.exports.getLocalAddress = getLocalAddress;

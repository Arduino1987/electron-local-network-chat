'use strict';

const electron = require('electron');
const Application = require('./Application');
let application;

try {
    application = new Application();
} catch (e) {
    console.log('Something wrong: ', e);
}

if (application) {
    electron.app.on('ready', () => {
        application.run();
    });
}

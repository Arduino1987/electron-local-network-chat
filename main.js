'use strict';

const electron = require('electron');
const path = require('path');
const Application = require('./modules/application');
let application, pathToIndex;

try {
    pathToIndex = path.join(__dirname, './public/index.html');
    application = new Application(pathToIndex);
} catch (e) {
    console.log('Something wrong: ', e);
}

if (application) {
    electron.app.on('ready', () => {
        application.run();
    });
}

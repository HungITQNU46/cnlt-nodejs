const EventEmitter = require('events');
class AppEmitter extends EventEmitter {}
const appEmitter = new AppEmitter();
appEmitter.on('logAction', (message) => {
    const fs = require('fs');
    const logMsg = `[${new Date().toLocaleString()}] ${message}\n`;
    fs.appendFileSync('./data/log.txt', logMsg);
    console.log('Event Triggered:', message);
});

module.exports = appEmitter;
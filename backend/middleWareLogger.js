const fs = require('fs');
const path = require('path');
const suffixPath = "http://localhost:3000"
const stream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

const requestLogger = (request, response, next) => {
    const body = JSON.stringify(request.body, null, 2); 
    const requestPath = suffixPath + request.path;
    const method = request.method;
    const logTime = new Date().toISOString();
    const log = `Time stamp: ${logTime}\nHTTP request method: ${method}\nrequest target path: ${requestPath}\nrequest body ${body}\n\n`;
    stream.write(log);
    next();
};

module.exports = requestLogger;

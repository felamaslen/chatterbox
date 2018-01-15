import { Logger, transports } from 'winston';

function getLogLevel() {
    if (process.env.DEBUG === 'true') {
        return 'debug';
    }

    if (process.env.VERBOSE === 'true') {
        return 'verbose';
    }

    if (process.env.NODE_ENV === 'production') {
        return 'warn';
    }

    return 'info';
}

class TestLogger {
    constructor() {
        this.itemLog = [];
    }
    log(method, ...args) {
        this.itemLog.push({ method, ...args });
    }
    silly(...args) {
        return this.log('silly', ...args);
    }
    debug(...args) {
        return this.log('debug', ...args);
    }
    verbose(...args) {
        return this.log('verbose', ...args);
    }
    info(...args) {
        return this.log('info', ...args);
    }
    warn(...args) {
        this.log('warn', ...args);
    }
    error(...args) {
        this.log('error', ...args);
    }
}

let logger = null;

if (process.env.NODE_ENV === 'test') {
    logger = new TestLogger();
}
else {
    logger = new Logger({
        transports: [
            new transports.Console()
        ],
        level: getLogLevel()
    });
}

export default logger;


import * as winston from "winston";

let logger = new winston.Logger({
    level: process.env.NODE_ENV === 'DEV' ? 'debug' : 'info',
    transports: [
        new (winston.transports.Console)({
            colorize: 'all'
        })
    ],
});


export { logger };






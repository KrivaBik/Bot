var winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;
const logger = winston.createLogger({
    level: 'info',
    format: combine(
        label({ label: 'right meow!' }),
        timestamp(),
        prettyPrint()
    ),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: 'logs.log' })
    ]
});


module.exports=logger;
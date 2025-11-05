
import { createLogger, format, transports } from 'winston';
import { WinstonModule } from 'nest-winston';

const { combine, timestamp, printf, colorize, simple } = format;

const consoleFormat = printf(({ level, message, namespace }) => {
    return `[${new Date().toISOString()}][${namespace ? namespace : 'server'}]`.padEnd(40) + `${level}: ${message}`;
});

export const mainLogger = WinstonModule.createLogger({
    level: 'info',
    defaultMeta: {
        service: 'needy-server'
    },
    transports: [
        new transports.File({
            filename: './logs/logs.log',
            level: 'info',
            format: combine(
                timestamp(),
                format.json(),
            )
        }),
        new transports.File({
            filename: './logs/error.log',
            level: 'error',
            format: combine(
                timestamp(),
                format.json(),
            )
        }),
        new transports.Console({
            format: combine(
                colorize(),
                consoleFormat
            )
        })
    ],
    exceptionHandlers: [
        new transports.File({
            filename: './logs/uncaughtExceptions.log',
            format: combine(
                timestamp(),
                format.json(),
            )
        })
    ]
});

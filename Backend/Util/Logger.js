// logger/index.js
import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const { combine, timestamp, printf, errors, colorize } = format;

// Required to use __dirname with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Define custom format for logs
const customFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

// ✅ Create logger instance
const logger = createLogger({
  level: 'info', // Change to 'debug' for more verbosity
  format: combine(
    timestamp(),
    errors({ stack: true }),
    customFormat
  ),
  transports: [
    new transports.File({ filename: path.join(__dirname, '..', 'logs', 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(__dirname, '..', 'logs', 'combined.log') }),
  ],
});

// ✅ Add console transport in non-production
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      customFormat
    )
  }));
}

export default logger;

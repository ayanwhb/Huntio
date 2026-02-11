import winston from "winston";
import chalk from "chalk";
import { Request, Response, NextFunction } from "express";

const { combine, timestamp, printf } = winston.format;

/**
 * This variable defines all available log levels and their numeric priorities for the logger.
 */
const levels = {
	fatal: 0,
	error: 1,
	warn: 2,
	info: 3,
	http: 4,
	debug: 5
} as const;

type LevelName = keyof typeof levels;

/**
 * This function applies color and formatting styles to a log level string
 * so it is visually distinct in console output.
 *
 * @param level - The raw log level name.
 * @returns The styled log level string.
 */
function styleLevel(level: string) {
	const lvl = level.toUpperCase() as Uppercase<LevelName>;

	switch (lvl) {
		case "FATAL":
			return chalk.bgRed.white.bold(lvl);
		case "ERROR":
			return chalk.red.bold(lvl);
		case "WARN":
			return chalk.yellow.bold(lvl);
		case "INFO":
			return chalk.green(lvl);
		case "HTTP":
			return chalk.cyan(lvl);
		case "DEBUG":
			return chalk.gray(lvl);
		default:
			return chalk.white(lvl);
	}
}

const consoleFormat = printf(({ level, message, timestamp }) => {
	const lvl = styleLevel(level);
	const time = chalk.dim(String(timestamp));
	return `[${time}] ${lvl}: ${String(message)}`;
});

export const logger = winston.createLogger({
	levels,
	level: "http",
	transports: [
		new winston.transports.Console({
			format: combine(timestamp({ format: "YYYY-MM-DDTHH:mm:ss[Z]" }), consoleFormat)
		})
	]
});

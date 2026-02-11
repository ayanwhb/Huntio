import { NextFunction, Request, Response } from "express";
import { logger } from "../util/logger.js";

/**
 * This function logs incoming HTTP requests and their responses,
 * including duration, status, and slow-request warnings.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next middleware function.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
	const start = process.hrtime.bigint();
	let slowTimer: NodeJS.Timeout | null = null;

	const { method, originalUrl } = req;

	slowTimer = setTimeout(() => {
		logger.warn(`${method} ${originalUrl} is still running after 500ms`);
	}, 500);

	res.on("finish", () => {
		if (slowTimer) {
			clearTimeout(slowTimer);
		}

		const end = process.hrtime.bigint();
		const durationMs = Number(end - start) / 1_000_000;
		const { statusCode, statusMessage } = res;

		const message = `${method} ${originalUrl} → ${statusCode} ${statusMessage.toUpperCase()} (${durationMs.toFixed(1)}ms)`;

		logger.http(message);
	});

	next();
}

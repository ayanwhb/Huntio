import "dotenv/config";
import app from "./server.js";
import { logger } from "./util/logger.js";
import chalk from "chalk";
import { prisma } from "./util/prisma.js";

const port: number = Number(process.env.PORT);

if (!Number.isInteger(port) || port <= 0) {
	logger.fatal(`Port ${process.env.PORT} is invalid. Can't start server.`);
	process.exit(1);
}

const url: string = `http://localhost:${port}/`;
const prettyUrl: string = process.stdout.isTTY ? chalk.blue(url) : url;

let shuttingDown: boolean = false;

const server = app.listen(port, async () => {
	logger.info(`The server is available on ${prettyUrl}`);

	const dbConnectionAvailable: boolean = await isConnectedToDB();
	if (dbConnectionAvailable) {
		logger.info("Successfully connected to database.");
	} else {
		logger.error("Failed to connect to database...");
		await shutdown(1);
	}
});

server.on("error", (err: NodeJS.ErrnoException) => {
	logger.fatal(`Server failed to start: ${err.code ?? ""} ${err.message}`);
	process.exit(1);
});

/**
 * This function gracefully shuts down the server and database connection,
 * ensuring all resources are released before exiting the process.
 *
 * @param exitCode - The process exit code to use when shutting down.
 */
async function shutdown(exitCode = 0) {
	if (shuttingDown) return;
	shuttingDown = true;

	logger.info("The server is shutting down...");

	const forceTimer = setTimeout(() => {
		logger.error("Shutdown timed out. Forcing exit.");
		process.exit(1);
	}, 10_000);

	try {
		await prisma.$disconnect();
		logger.info("Successfully disconnected from database.");
	} catch (e) {
		logger.error("Failed to disconnect from database...");
	}

	server.close(err => {
		clearTimeout(forceTimer);

		if (err) {
			logger.error("An error occurred while closing the server.");
			process.exit(1);
		}

		logger.info("The server has successfully shutdown.");
		process.exit(exitCode);
	});
}

process.on("SIGINT", () => void shutdown(0));
process.on("SIGTERM", () => void shutdown(0));

/**
 * This function checks whether the application can successfully
 * communicate with the database by running a simple test query.
 *
 * @returns A promise that resolves to `true` if the database is reachable,
 * or `false` if the query fails.
 */
async function isConnectedToDB(): Promise<boolean> {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return true;
	} catch (e) {
		return false;
	}
}

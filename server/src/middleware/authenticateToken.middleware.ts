import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * This function authenticates an incoming HTTP request by validating
 * a JWT access token from the Authorization header and attaching
 * the user ID to the request object.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next middleware function.
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
	const authHeader: string = req.headers.authorization;
	if (!authHeader || Array.isArray(authHeader)) {
		res.status(StatusCodes.UNAUTHORIZED).json({ message: "Missing Authorization header" });
		return;
	}

	const [scheme, token] = authHeader.split(" ");

	if (scheme !== "Bearer" || !token) {
		res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid Authorization header format" });
		return;
	}

	const secretAccessKey = process.env.ACCESS_TOKEN_SECRET;
	if (!secretAccessKey) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server misconfigured" });
		return;
	}

	const decoded = jwt.verify(token, secretAccessKey) as JwtPayload;

	req.userId = decoded.sub as string;
	next();
}

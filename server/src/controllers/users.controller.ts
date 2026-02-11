import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "../generated/prisma/client.js";
import { updateUserById, findUserById } from "../services/users.service.js";
import { isObject } from "../util/helper.js";
import { logger } from "../util/logger.js";

/**
 * This controller retrieves the currently authenticated user's profile.
 *
 * It extracts the userId from the request,
 * fetches the corresponding user from the database,
 * and returns the user object as a JSON response.
 *
 * @param req - Express request object containing the authenticated userId.
 * @param res - Express response object used to return the HTTP response.
 * @returns A promise that resolves to an HTTP response containing the User record.
 */
export async function getMe(req: Request, res: Response) {
	const userId: string = req.userId as string;
	const me: User = await findUserById(userId);

	return res.status(StatusCodes.OK).json(me);
}

/**
 * This controller updates the currently authenticated user's profile.
 *
 * It validates that the request body is an object,
 * forwards the updated user data to the service layer,
 * logs the profile update action,
 * and returns a no-content response upon success.
 *
 * @param req - Express request object containing the authenticated userId and updated user data.
 * @param res - Express response object used to return the HTTP response.
 * @returns A promise that resolves to an HTTP response.
 */
export async function updateMe(req: Request, res: Response) {
	const userId: string = req.userId as string;
	const user: User | null = isObject(req.body) ? (req.body as User) : null;

	if (!user) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: "The request body is not an object" });
	}

	await updateUserById(userId, user);

	const updatedUser: User = await findUserById(userId);
	logger.info(`'${updatedUser.username}' has updated their profile`);

	return res.sendStatus(StatusCodes.NO_CONTENT);
}

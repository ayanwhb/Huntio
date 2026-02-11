import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JobApplication, User } from "../generated/prisma/client.js";
import { createJobApplicationByUserId, deleteApplicationById, findApplicationsByUserId, updateApplicationById } from "../services/applications.service.js";
import { findUserById } from "../services/users.service.js";
import { isObject } from "../util/helper.js";
import { logger } from "../util/logger.js";

/**
 * This controller creates a new job application for the authenticated user.
 *
 * It validates that the request body is an object and forwards the
 * application data to the service layer for persistence.
 * After successful creation, it logs the action.
 *
 * @param req - Express request object containing the authenticated userId and application data.
 * @param res - Express response object used to return the HTTP response.
 * @returns A promise that resolves to an HTTP response.
 */
export async function createApplication(req: Request, res: Response): Promise<Response> {
	const userId: string = req.userId as string;
	const application: JobApplication | null = isObject(req.body) ? (req.body as JobApplication) : null;

	if (!application) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: "The request body is not an object" });
	}

	await createJobApplicationByUserId(application, userId);

	const user: User = await findUserById(userId);
	logger.info(`'${user.username}' has started tracking a new job application`);

	return res.status(StatusCodes.OK).send();
}

/**
 * This controller deletes a job application by its unique ID.
 *
 * It extracts the application ID from the route parameters
 * and delegates the deletion to the service layer.
 * After successful deletion, it logs the action.
 *
 * @param req - Express request object containing the application ID and authenticated userId.
 * @param res - Express response object used to return the HTTP response.
 * @returns A promise that resolves to an HTTP response.
 */
export async function deleteApplication(req: Request, res: Response): Promise<Response> {
	const applicationId: string = req.params.id as string;
	const userId: string = req.userId as string;

	await deleteApplicationById(applicationId);

	const user: User = await findUserById(userId);
	logger.info(`'${user.username}' has deleted a job application`);

	return res.sendStatus(StatusCodes.NO_CONTENT);
}

/**
 * This controller updates an existing job application.
 *
 * It validates that the request body is an object and forwards
 * the updated data to the service layer using the application ID.
 * After successful update, it logs the action.
 *
 * @param req - Express request object containing the application ID, authenticated userId, and updated data.
 * @param res - Express response object used to return the HTTP response.
 * @returns A promise that resolves to an HTTP response.
 */
export async function updateApplication(req: Request, res: Response): Promise<Response> {
	const userId: string = req.userId as string;
	const applicationId: string = req.params.id as string;
	const application: JobApplication | null = isObject(req.body) ? (req.body as JobApplication) : null;

	if (!application) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: "The request body is not an object" });
	}

	await updateApplicationById(application, applicationId);

	const user: User = await findUserById(userId);
	logger.info(`'${user.username}' has updated a job application`);

	return res.sendStatus(StatusCodes.NO_CONTENT);
}

/**
 * This controller retrieves all job applications
 * that belong to the authenticated user.
 *
 * It delegates the data fetching to the service layer
 * and returns the list as a JSON response.
 *
 * @param req - Express request object containing the authenticated userId.
 * @param res - Express response object used to return the HTTP response.
 * @returns A promise that resolves to an HTTP response containing a list of JobApplication records.
 */
export async function getAllApplications(req: Request, res: Response): Promise<Response> {
	const userId: string = req.userId as string;
	const applications: JobApplication[] = await findApplicationsByUserId(userId);
	return res.status(StatusCodes.OK).json(applications);
}

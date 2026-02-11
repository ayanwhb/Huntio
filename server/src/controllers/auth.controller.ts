import { StatusCodes } from "http-status-codes";
import { RefreshToken, User } from "../generated/prisma/client.js";
import { Request, Response } from "express";
import { randomUUID, UUID } from "crypto";
import { logger } from "../util/logger.js";
import { createUser, findUserByEmail, findUserById } from "../services/users.service.js";
import { generateAccessToken, createJwtPayload, generateRefreshToken } from "../services/jwt.service.js";
import { createRefreshToken, deleteRefreshTokenByUserId, findRefreshTokenByUserId, updateHashOfRefreshTokenByUserId, upsertHashOfRefreshTokenByUserId } from "../services/refreshTokens.service.js";
import { isObject } from "../util/helper.js";
import { compare, hash } from "../util/crypto.util.js";
import { setRefreshCookie } from "../services/cookies.service.js";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * This controller registers a new user.
 *
 * It validates the request body, hashes the provided password,
 * creates a new user, generates access and refresh tokens,
 * stores the hashed refresh token in the database,
 * sets the refresh token as an HTTP-only cookie,
 * and returns the access token.
 *
 * @param req - Express request object containing username, email, and password.
 * @param res - Express response object used to return the HTTP response.
 * @returns A promise that resolves to an HTTP response.
 */
export async function register(req: Request, res: Response) {
	if (!isObject(req.body)) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: "The request body is not an object" });
	}

	try {
		const hashedPassword: string = await hash(req.body.password);

		const createdUser: User = await createUser(req.body.username, req.body.email, hashedPassword);
		const createdUserId: string = createdUser.id;

		const secretRefreshKey = process.env.REFRESH_TOKEN_SECRET;
		const secretAccessKey = process.env.ACCESS_TOKEN_SECRET;
		if (!secretAccessKey || !secretRefreshKey) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server misconfigured" });
		}

		const accessTokenJti: UUID = randomUUID();
		const accessToken: string = generateAccessToken(createJwtPayload(createdUserId, accessTokenJti), secretAccessKey);

		const refreshTokenJti: UUID = randomUUID();
		const refreshToken: string = generateRefreshToken(createJwtPayload(createdUserId, refreshTokenJti), secretRefreshKey);

		const hashedRefreshToken: string = await hash(refreshToken);

		await createRefreshToken(hashedRefreshToken, createdUserId, refreshTokenJti);

		logger.info(`User '${createdUser.username}' has been registered`);
		setRefreshCookie(res, refreshToken);
		return res.status(StatusCodes.CREATED).json({ accessToken });
	} catch (e) {
		logger.error(`Error occurred while registering a new user: \n${e}`);
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
	}
}

/**
 * This controller authenticates an existing user.
 *
 * It verifies the provided credentials, generates new access
 * and refresh tokens, updates the stored refresh token hash,
 * sets the refresh token cookie, and returns the access token.
 *
 * @param req - Express request object containing email and password.
 * @param res - Express response object used to return the HTTP response.
 * @returns A promise that resolves to an HTTP response.
 */
export async function login(req: Request, res: Response) {
	if (!isObject(req.body)) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: "The request body is not an object" });
	}

	const email = req.body.email;

	try {
		const user: User | null = await findUserByEmail(email);
		if (user === null) {
			return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Email or password are incorrect" });
		}

		const userId = user.id;
		const storedHashedPassword: string = user.hashedPassword;
		const plaintextPassword: string = req.body.password as string;

		const isPasswordCorrect: boolean = await compare(plaintextPassword, storedHashedPassword);
		if (!isPasswordCorrect) {
			return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Email or password are incorrect" });
		}

		const secretRefreshKey = process.env.REFRESH_TOKEN_SECRET;
		const secretAccessKey = process.env.ACCESS_TOKEN_SECRET;
		if (!secretAccessKey || !secretRefreshKey) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server misconfigured" });
		}

		const accessTokenJti: UUID = randomUUID();
		const accessToken: string = generateAccessToken(createJwtPayload(userId, accessTokenJti), secretAccessKey);

		const refreshTokenJti: UUID = randomUUID();
		const refreshToken: string = generateRefreshToken(createJwtPayload(userId, refreshTokenJti), secretRefreshKey);

		const hashedRefreshToken: string = await hash(refreshToken);

		await upsertHashOfRefreshTokenByUserId(userId, hashedRefreshToken, refreshTokenJti);

		logger.info(`User '${user.username}' logged in`);
		setRefreshCookie(res, refreshToken);
		return res.status(StatusCodes.OK).send({ accessToken });
	} catch (e) {
		logger.error(`Error occurred while logging in an existing user`);
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
	}
}

/**
 * This controller logs out an authenticated user.
 *
 * It verifies the refresh token from cookies,
 * removes the stored refresh token from the database,
 * clears the refresh token cookie,
 * and logs the logout action.
 *
 * @param req - Express request object containing the refresh token cookie.
 * @param res - Express response object used to return the HTTP response.
 * @returns A promise that resolves to an HTTP response.
 */
export async function logout(req: Request, res: Response) {
	const refreshToken = req.cookies?.refreshToken;
	if (typeof refreshToken !== "string" || refreshToken.length === 0) {
		return res.status(StatusCodes.BAD_REQUEST).send();
	}

	const secretRefreshKey = process.env.REFRESH_TOKEN_SECRET;
	if (!secretRefreshKey) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server misconfigured" });
	}

	const decoded = jwt.verify(refreshToken, secretRefreshKey) as JwtPayload;

	const userId: string = decoded.sub;

	try {
		await deleteRefreshTokenByUserId(userId);

		const user: User = await findUserById(userId);

		logger.info(`User '${user.username}' logged out`);
		res.clearCookie("refreshToken", { path: "/auth/" });
		return res.sendStatus(StatusCodes.NO_CONTENT);
	} catch (e) {
		logger.error(`Error occurred while a user tried to log out: \n${e}`);
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
	}
}

/**
 * This controller generates new access and refresh tokens
 * using a valid refresh token.
 *
 * It validates the refresh token, verifies its hash and JTI,
 * rotates both tokens, updates the stored refresh token hash,
 * sets the new refresh token cookie, and returns the new tokens.
 *
 * @param req - Express request object containing the refresh token cookie.
 * @param res - Express response object used to return the HTTP response.
 * @returns A promise that resolves to an HTTP response containing new tokens.
 */
export async function refresh(req: Request, res: Response) {
	try {
		const refreshToken = req.cookies?.refreshToken;
		if (typeof refreshToken !== "string" || refreshToken.length === 0) {
			return res.status(StatusCodes.UNAUTHORIZED).send({ message: "The refresh token is not valid" });
		}

		const secretRefreshKey = process.env.REFRESH_TOKEN_SECRET;
		if (!secretRefreshKey) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server misconfigured" });
		}

		const decoded = jwt.verify(refreshToken, secretRefreshKey) as JwtPayload;

		const secretAccessKey = process.env.ACCESS_TOKEN_SECRET;
		if (!secretAccessKey) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server misconfigured" });
		}

		const userId: string = decoded.sub;

		const storedRefreshToken: RefreshToken | null = await findRefreshTokenByUserId(userId);
		if (storedRefreshToken === null) {
			return res.status(StatusCodes.FORBIDDEN).json({ message: "The user has no refresh token stored in the database" });
		}

		const isHashMatch: boolean = await compare(refreshToken, storedRefreshToken.hash);
		if (!isHashMatch) {
			return res.status(StatusCodes.FORBIDDEN).json({ message: "The refresh token is not valid" });
		}

		const isJtiMatch: boolean = decoded.jti === storedRefreshToken.jti;
		if (!isJtiMatch) {
			return res.status(StatusCodes.FORBIDDEN).json({ message: "The refresh token is not valid" });
		}

		const newAccessTokenJti: UUID = randomUUID();
		const newAccessToken: string = generateAccessToken(createJwtPayload(userId, newAccessTokenJti), secretAccessKey);

		const newRefreshTokenJti: UUID = randomUUID();
		const newRefreshToken: string = generateRefreshToken(createJwtPayload(userId, newRefreshTokenJti), secretRefreshKey);

		const newHashedRefreshToken: string = await hash(newRefreshToken);

		await updateHashOfRefreshTokenByUserId(userId, newHashedRefreshToken, newRefreshTokenJti);

		const user: User = await findUserById(userId);

		logger.info(`New tokens for user '${user.username}' generated`);
		setRefreshCookie(res, refreshToken);
		return res.status(StatusCodes.OK).send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
	} catch (e) {
		logger.error(`Error occurred while generating a new token`);
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
	}
}

import { RefreshToken } from "../generated/prisma/client.js";
import { prisma } from "../util/prisma.js";

/**
 * This function checks whether a refresh token with the given hash
 * exists in the database.
 *
 * @param hash - The hashed refresh token value to look up.
 * @returns A promise that resolves to `true` if the token exists, otherwise `false`.
 */
export async function refreshTokenExists(hash: string): Promise<boolean> {
	const refreshToken: RefreshToken = await prisma.refreshToken.findUnique({
		where: { hash }
	});

	return refreshToken !== null;
}

/**
 * This function retrieves the hash of a refresh token associated
 * with a specific user ID.
 *
 * @param userId - The unique identifier of the user.
 * @returns A promise that resolves to the refresh token hash or `null` if none exists.
 */
export async function findHashOfRefreshTokenByUserId(userId: string): Promise<string | null> {
	const refreshToken: RefreshToken = await prisma.refreshToken.findUnique({
		where: { userId }
	});

	return refreshToken.hash;
}

/**
 * This function retrieves the full refresh token record associated
 * with a specific user ID.
 *
 * @param userId - The unique identifier of the user.
 * @returns A promise that resolves to the RefreshToken or `null` if none exists.
 */
export async function findRefreshTokenByUserId(userId: string): Promise<RefreshToken | null> {
	return await prisma.refreshToken.findUnique({
		where: { userId }
	});
}

/**
 * This function updates the hash and JTI of a refresh token for
 * a given user ID.
 *
 * @param userId - The unique identifier of the user.
 * @param hash - The new hashed refresh token value.
 * @param jti - The new JWT ID associated with the refresh token.
 * @returns A promise that resolves to the updated RefreshToken.
 */
export async function updateHashOfRefreshTokenByUserId(userId: string, hash: string, jti: string): Promise<RefreshToken> {
	return await prisma.refreshToken.update({
		data: { hash, jti },
		where: { userId: userId }
	});
}

/**
 * This function creates or updates a refresh token for a user,
 * ensuring that a refresh token always exists for the given user ID.
 *
 * @param userId - The unique identifier of the user.
 * @param hash - The hashed refresh token value.
 * @param jti - The JWT ID associated with the refresh token.
 * @returns A promise that resolves to the updated or created RefreshToken.
 */
export async function upsertHashOfRefreshTokenByUserId(userId: string, hash: string, jti: string): Promise<RefreshToken> {
	return await prisma.refreshToken.upsert({
		where: { userId },
		create: { hash, userId, jti },
		update: { hash, jti }
	});
}

/**
 * This function deletes the refresh token associated with a given
 * user ID.
 *
 * @param userId - The unique identifier of the user.
 * @returns A promise that resolves to the deleted RefreshToken.
 */
export async function deleteRefreshTokenByUserId(userId: string): Promise<RefreshToken> {
	return await prisma.refreshToken.delete({
		where: { userId }
	});
}

/**
 * This function creates a new refresh token for a user with the given
 * hash, user ID, and JWT ID.
 *
 * @param hash - The hashed refresh token value.
 * @param userId - The unique identifier of the user.
 * @param jti - The JWT ID associated with the refresh token.
 * @returns A promise that resolves to the newly created RefreshToken.
 */
export async function createRefreshToken(hash: string, userId: string, jti: string): Promise<RefreshToken> {
	return await prisma.refreshToken.create({
		data: { hash, userId, jti }
	});
}

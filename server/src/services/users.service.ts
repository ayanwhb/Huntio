import { User } from "../generated/prisma/client.js";
import { prisma } from "../util/prisma.js";

/**
 * This function retrieves a user from the database by its unique ID.
 *
 * @param userId - The unique identifier of the user.
 * @returns A promise that resolves to the matching User or `null` if no user was found.
 */
export async function findUserById(userId: string): Promise<User | null> {
	return await prisma.user.findUnique({
		where: { id: userId }
	});
}

/**
 * This function retrieves a user from the database by its unique email address.
 *
 * @param email - The email address associated with the user.
 * @returns A promise that resolves to the matching User or `null` if no user was found.
 */
export async function findUserByEmail(email: string): Promise<User | null> {
	return await prisma.user.findUnique({
		where: { email: email }
	});
}

/**
 * This function updates an existing user's basic profile fields
 * using the user's unique ID.
 *
 * @param userId - The unique identifier of the user to update.
 * @param user - The user object containing the new values to persist.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateUserById(userId: string, user: User): Promise<void> {
	await prisma.user.update({
		data: { firstname: user.firstname, email: user.email, username: user.username },
		where: { id: userId }
	});
}

/**
 * This function creates a new user in the database with a username,
 * email address, and a hashed password.
 *
 * @param username - The unique username for the new user.
 * @param email - The email address for the new user.
 * @param hashedPassword - The securely hashed password to store.
 * @returns A promise that resolves to the newly created User record.
 */
export async function createUser(username: string, email: string, hashedPassword: string): Promise<User> {
	return await prisma.user.create({
		data: { username, email, hashedPassword }
	});
}

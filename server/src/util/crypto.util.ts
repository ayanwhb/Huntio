import bcrypt from "bcrypt";

/**
 * This function hashes a string using bcrypt for secure storage,
 * typically used for tokens or passwords.
 *
 * @param str - The string to hash.
 * @returns A promise that resolves to the hashed string.
 */
export function hash(str: string): Promise<string> {
	return bcrypt.hash(str, 10);
}

/**
 * This function compares a plaintext value with a hashed value
 * using bcrypt.
 *
 * It is typically used to verify whether a provided password
 * matches the stored hashed password.
 *
 * @param data - The plaintext value to compare (e.g., user-entered password).
 * @param encrypted - The hashed value to compare against.
 * @returns A promise that resolves to true if the values match, otherwise false.
 */
export async function compare(data: string, encrypted: string): Promise<boolean> {
	return await bcrypt.compare(data, encrypted);
}

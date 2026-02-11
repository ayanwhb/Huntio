import { UUID } from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * This function generates a signed JWT access token with a short
 * expiration time.
 *
 * @param payload - The data to embed inside the JWT.
 * @param secretAccessKey - The secret key used to sign the token.
 * @returns A signed JWT access token string.
 */
export function generateAccessToken(payload: object, secretAccessKey: string): string {
	return jwt.sign(payload, secretAccessKey, { expiresIn: "15m" });
}

/**
 * This function generates a signed JWT refresh token with a longer
 * expiration time.
 *
 * @param payload - The data to embed inside the JWT.
 * @param secretRefreshKey - The secret key used to sign the token.
 * @returns A signed JWT refresh token string.
 */
export function generateRefreshToken(payload: object, secretRefreshKey: string): string {
	return jwt.sign(payload, secretRefreshKey, { expiresIn: "7d" });
}

/**
 * This function creates a JWT payload object containing the subject
 * and JWT ID.
 *
 * @param sub - The subject (usually the user ID).
 * @param jti - The unique JWT identifier.
 * @returns A JWT payload object.
 */
export function createJwtPayload(sub: string, jti: UUID): JwtPayload {
	return { sub, jti };
}

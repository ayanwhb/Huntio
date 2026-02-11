import { Response } from "express";

/**
 * This function sets the refresh token as an HTTP-only cookie on the response
 * so it can be used for future token refresh requests.
 *
 * @param res - The Express response object.
 * @param refreshToken - The refresh token to store in the cookie.
 */
export function setRefreshCookie(res: Response, refreshToken: string): void {
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "lax",
		path: "/auth/",
		maxAge: 7 * 24 * 60 * 60 * 1000
	});
}

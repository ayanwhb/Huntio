/**
 * This function checks whether a given value is a plain object,
 * excluding `null` and arrays.
 *
 * @param value - The value to test.
 * @returns `true` if the value is a non-null object and not an array, otherwise `false`.
 */
export function isObject(value: unknown): boolean {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

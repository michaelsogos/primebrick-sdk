export class LocalAuthConfig {
	secretKey: string;
	/**
	 * Time span expressing when token expires.
	 * <pre>If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").</pre>
	 *
	 * @example Eg: "10h" (10 hours), "7d" (7 days), "5m" (5 minutes), "3s" (3 seconds), "3600000ms" (3.600.000 milliseconds)
	 * @type {string}
	 * @memberof LocalAuthConfig
	 */
	expiresIn: string;
}

export class LocalAuthConfig {
	/**
	 * String representing private crypthography key to sign token
	 *
	 * @type {string}
	 * @memberof LocalAuthConfig
	 */
	secretKey: string;
	/**
	 * Time span expressing when token expires.
	 * <pre>If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").</pre>
	 *
	 * @example Eg: "10h" (10 hours), "7d" (7 days), "5m" (5 minutes), "3s" (3 seconds), "3600000ms" (3.600.000 milliseconds)
	 * @default "15m" (15 minutes)
	 * @type {string}
	 * @memberof LocalAuthConfig
	 */
	tokenExpiresIn: string;
	/**
	 * Time span expressing when session expires. Must be greater than {tokenExpiresIn} value!
	 * <pre>If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").</pre>
	 *
	 * @example Eg: "10h" (10 hours), "7d" (7 days), "5m" (5 minutes), "3s" (3 seconds), "3600000ms" (3.600.000 milliseconds)
	 * @default "1d" (1 day)
	 * @type {string}
	 * @memberof LocalAuthConfig
	 */
	sessionExpiresIn: string;
}

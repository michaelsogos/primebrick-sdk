import { ExecutionContext } from '@nestjs/common';
import { LocalStrategyHelper } from './LocalStrategyHelper';
import { UserProfile } from '../models/UserProfile';
import { SecureString } from '../models/SecureString';

export class AuthManagerHelper {
    static getUserProfile(context: ExecutionContext): UserProfile {
        switch (context.getType()) {
            case 'http':
                return LocalStrategyHelper.getUserProfile(context);
            case 'rpc':
                throw new Error('Not implemented yet!');
            case 'ws':
                throw new Error('Not implemented yet!');
        }
    }

    private static hashPassword(salt: string, iterations: number, password: string): string {
        const crypto = require('crypto');

        var hash = crypto.createHash('sha512').update(salt).update(password);

        var hashed = hash.digest();

        for (var i = 0; i < iterations; i++) {
            hashed = crypto.createHash('sha512').update(hashed).digest();
        }

        return hashed.toString('base64');
    }

    private static generateRandomIterations(min: number, max: number): number {
        if (min < 10000 || min >= max) min = 10000;
        if (max > 50000 || max <= min) max = 50000;
        return Math.round(Math.random() * (max - min) + min);
    }

    /*static buildSecureString(password: string): string{
		const crypto = require("crypto");

		var salt = crypto.randomBytes(128).toString("base64");
		var iterations = this.generateRandomIterations(10000, 50000);
		var hashedPassword = this.hashPassword(salt, iterations, password);
		var secureString = `${salt}$${iterations}$${hashedPassword}`;

		return secureString;
	}*/

    /* 	checkValidPassword(hashedString : string, password): boolean{
		var splittedPwd = hashedString.split("$");
		var userHashedPwd = splittedPwd[2];
		var comparisonPwd = this.hashPassword(splittedPwd[0], Number(splittedPwd[1]), password)
		if (comparisonPwd == userHashedPwd)
			return true;
		else return false;
	} */

    static buildSecureString(stringToSecure: string, salt: string, iterations: number): string {
        const crypto = require('crypto');
        var hashedPassword = this.hashPassword(salt, iterations, stringToSecure);
        var secureString = `${salt}$${iterations}$${hashedPassword}`;

        return secureString;
    }

    static secureStringReader(secureString: string): SecureString {
        var splittedString = secureString.split('$');
        const result = new SecureString();
        result.salt = splittedString[0];
        result.iterations = parseInt(splittedString[1]);
        result.hashedString = splittedString[2];
        return result;
    }
}

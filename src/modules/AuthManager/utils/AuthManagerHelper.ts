import { SecureString } from '../models/SecureString';
import * as crypto from 'crypto';
import { MessagePayload } from '../../../core/models/MessagePayload';

export class AuthManagerHelper {
    static getUserProfileFromRpcRequest(request: MessagePayload<any>) {
        return request.context.userProfile;
    }

    private static hashPassword(salt: string, iterations: number, password: string): string {
        const hash = crypto.createHash('sha512').update(salt).update(password);
        let hashed = hash.digest();

        for (let i = 0; i < iterations; i++) {
            hashed = crypto.createHash('sha512').update(hashed).digest();
        }

        return hashed.toString('base64');
    }

    private static generateRandomIterations(min: number, max: number): number {
        if (min < 10000 || min >= max) min = 10000;
        if (max > 50000 || max <= min) max = 50000;

        return Math.round(Math.random() * (max - min) + min);
    }

    static buildSecureString(stringToSecure: string, salt: string, iterations: number): string {
        const hashedPassword = this.hashPassword(salt, iterations, stringToSecure);
        const secureString = `${salt}$${iterations}$${hashedPassword}`;

        return secureString;
    }

    static secureStringReader(secureString: string): SecureString {
        const splittedString = secureString.split('$');
        const result = new SecureString();
        result.salt = splittedString[0];
        result.iterations = parseInt(splittedString[1]);
        result.hashedString = splittedString[2];

        return result;
    }
}

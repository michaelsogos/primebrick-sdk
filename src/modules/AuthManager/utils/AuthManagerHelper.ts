import { ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { LocalStrategyHelper } from "./LocalStrategyHelper";
import { UserProfile } from "../models/UserProfile";

@Injectable()
export class AuthManagerHelper {
	static getUserProfile(context: ExecutionContext): UserProfile {
		switch (context.getType()) {
			case "http":
				return LocalStrategyHelper.getUserProfile(context);
			case "rpc":
				throw new Error("Not implemented yet!");
			case "ws":
				throw new Error("Not implemented yet!");
		}
	}
	
	 hashPassword(salt : string, iterations: number, password: string): string{
		
		const crypto = require("crypto")

		var hash = crypto.createHash("sha512")
						 .update(salt)
						 .update(password);
		
		var hashed = hash.digest();

		for(var i = 0; i < iterations; i++){
			hashed = crypto.createHash("sha512")
							.update(hashed)
							.digest()
		}

		return hashed.toString("base64"); 

	}

	private generateRandomIterations(min: number, max: number): number{
		return Math.random() * (max - min) + max;
	}

	buildHashedPassword(password: string): string{
		const crypto = require("crypto");

		var salt = crypto.randomBytes(128).toString("base64");
		var iterations = this.generateRandomIterations(10000, 50000);
		var hash = this.hashPassword(salt, iterations, password);
		var hashedPassword = `${salt}${iterations}${hash}`;

		return hashedPassword;
	}

	checkValidPassword(hashedString : string, password): boolean{
		var splittedPwd = hashedString.split("$");
		var userHashedPwd = splittedPwd[2];
		var comparisonPwd = this.hashPassword(splittedPwd[0], Number(splittedPwd[1]), password)
		if (comparisonPwd == userHashedPwd)
			return true;
		else return false;
	}
}

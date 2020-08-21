import { ExecutionContext } from "@nestjs/common";
import { UserProfile } from "../../modules/AuthManager/models/UserProfile";
import { Request } from "express";

export class CommonHelper {
	static getLanguageCode(context: ExecutionContext, userProfile: UserProfile): string {
		switch (context.getType()) {
			case "http":
				return userProfile.languageCode || this.getLanguageCodeFromHttpRequest(context);
			case "rpc":
				throw new Error("Not implemented yet!");
			case "ws":
				throw new Error("Not implemented yet!");
		}
	}

	 static getLanguageCodeFromHttpRequest(context: ExecutionContext): string {
		const request = context.switchToHttp().getRequest() as Request;
		const acceptedLanguages = request.acceptsLanguages();
		let languageCode: string = null;

		if (acceptedLanguages) languageCode = acceptedLanguages[0].split("-")[0];
		if (!languageCode || languageCode == "*") languageCode = "en";

		return languageCode;
	}
}

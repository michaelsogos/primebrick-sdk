import { ExecutionContext } from "@nestjs/common";
import { LocalStrategyHelper } from "./LocalStrategyHelper";
import { UserProfile } from "../models/UserProfile";

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
}

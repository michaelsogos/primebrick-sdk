import { ExecutionContext } from "@nestjs/common";
import { LocalStrategyHelper } from "./LocalStrategyHelper";

export class AuthManagerHelper {
	static getUserProfile(context: ExecutionContext): any {
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

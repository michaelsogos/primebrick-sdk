import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { LocalStrategyHelper } from "./utils/LocalStrategyHelper";

export const UserProfile = createParamDecorator((data: unknown, context: ExecutionContext) => {
	switch (context.getType()) {
		case "http":
			return LocalStrategyHelper.getUserProfile(context);
		case "rpc":
			throw new Error("Not implemented yet!");
		case "ws":
			throw new Error("Not implemented yet!");
	}
});

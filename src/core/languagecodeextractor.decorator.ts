import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { CommonHelper } from "./utils/CommonHelper";

export const LanguageCode = createParamDecorator((data: unknown, context: ExecutionContext) => {
	return CommonHelper.getLanguageCodeFromHttpRequest(context);
});

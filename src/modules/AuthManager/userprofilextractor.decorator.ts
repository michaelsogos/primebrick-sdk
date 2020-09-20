import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthManagerHelper } from './utils/AuthManagerHelper';

export const UserProfile = createParamDecorator((data: unknown, context: ExecutionContext) => {
    return AuthManagerHelper.getUserProfileFromExecutionContext(context);
});

import { UserProfile } from "../../modules/AuthManager/models/UserProfile";

export class SessionContext {
	tenantAlias: string;
	userProfile: UserProfile;
	languageCode: string;
}

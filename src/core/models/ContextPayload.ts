import { UserProfile } from "../../modules/AuthManager/models/UserProfile";

export class ContextPayload {
	tenantAlias: string;
	userProfile: UserProfile;
	languageCode: string;
}

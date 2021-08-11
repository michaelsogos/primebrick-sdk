import { UserProfile } from './UserProfile';

export class SessionContext {
    tenantAlias: string;
    userProfile: UserProfile;
    languageCode: string;
}

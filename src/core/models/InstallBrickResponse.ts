export class InstallBrickResponse {
    viewsRegistration: ViewsRegistrationResult;

    constructor() {
        this.viewsRegistration = new ViewsRegistrationResult();
    }
}

class ViewsRegistrationResult {
    done: string[];
    failed: string[];

    constructor() {
        this.done = [];
        this.failed = [];
    }
}

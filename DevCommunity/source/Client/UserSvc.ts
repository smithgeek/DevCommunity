///ts:import=IUserSvc
import IUserSvc = require('./IUserSvc'); ///ts:import:generated

class UserSvc implements IUserSvc {
    constructor(private localStorageService) {
    }

    public getUser(): string {
        var email = this.localStorageService.get('userEmail');
        if (!email)
            return '';
        return email.email;
    }

    public isLoggedIn(): boolean {
        if (this.localStorageService.get('userEmail'))
            return true;
        else
            return false;
    }

    public logOut(): void {
        this.localStorageService.clearAll();
    }
}
export = UserSvc;
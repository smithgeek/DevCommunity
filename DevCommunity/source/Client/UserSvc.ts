///ts:import=IUserSvc
import IUserSvc = require('./IUserSvc'); ///ts:import:generated
///ts:import=app
import app = require('./app'); ///ts:import:generated

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

    public isAdmin(): boolean {
        if (this.localStorageService.get("admin") == "true") {
            return true;
        }
        else {
            return false;
        }
    }
}

angular.module(app.getModuleName()).service('userSvc', ['localStorageService', UserSvc]);

export = UserSvc;
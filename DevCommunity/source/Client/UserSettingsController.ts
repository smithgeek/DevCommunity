///ts:import=UserSettingsControllerScope
import UserSettingsControllerScope = require('./UserSettingsControllerScope'); ///ts:import:generated
///ts:import=IUserSvc
import IUserSvc = require('./IUserSvc'); ///ts:import:generated
///ts:import=UserSettings
import UserSettings = require('../Common/UserSettings'); ///ts:import:generated

class UserSettingsController {
    constructor(private $scope: UserSettingsControllerScope, private $http: ng.IHttpService, private userSvc: IUserSvc) {
        $('.navbar-nav li.active').removeClass('active');
        $('#NavUserSettings').addClass('active');

        this.$scope.settings = new UserSettings();
        this.$scope.errorMessage = "";
        this.$scope.successMessage = "";

        this.$http.get('/api/restricted/GetUserSettings').success((data) => {
            if (data != "" && data != null)
                this.$scope.settings = <UserSettings>data;
        });
    }

    public isLoggedIn(): boolean {
        return this.userSvc.isLoggedIn();
    }

    public Submit(): void {
        $('.settings-btn').prop('disabled', true);
        this.$http.post('/api/restricted/SetUserSettings', this.$scope.settings).success((data: any) => {
            $('.settings-btn').prop('disabled', false);
            this.$scope.errorMessage = "";
            this.$scope.successMessage = "Settings saved.";
        }).error((data) => {
                $('.settings-btn').prop('disabled', false);
                this.$scope.successMessage = "";
                this.$scope.errorMessage = data.toString();
            });
    }
}
export = UserSettingsController;
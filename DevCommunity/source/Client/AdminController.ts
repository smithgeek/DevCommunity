///ts:import=AdminControllerScope
import AdminControllerScope = require('./AdminControllerScope'); ///ts:import:generated
///ts:import=app
import app = require('./app'); ///ts:import:generated
///ts:import=UserSettings
import UserSettings = require('../Common/UserSettings'); ///ts:import:generated

class AdminController {
    constructor(private $scope: AdminControllerScope, private $http: ng.IHttpService) {
        $('.navbar-nav li.active').removeClass('active');
        $('#NavAdmin').addClass('active');

        this.$scope.emailAddress = "";
        this.$scope.errorMessage = "";
        this.$scope.successMessage = "";
        this.$scope.tweetSuccessMessage = "";
        this.$scope.tweetErrorMessage = "";
        this.$scope.deleteUserSuccessMessage = "";
        this.$scope.deleteUserErrorMessage = "";
        this.$scope.selectedUser = null;
        this.$scope.emailSubject = "Developer Community";
        this.$scope.emailBody = "";
        this.$scope.sendEmailErrorMessage = "";
        this.$scope.sendEmailSuccessMessage = "";

        this.getUsers();
    }

    public AddUser(): void {
        this.$scope.successMessage = "";
        this.$scope.errorMessage = "";
        $('.settings-btn').prop('disabled', true);
        this.$http.post('/api/restricted/AddUser', { user: this.$scope.emailAddress }).success((data: any) => {
            $('.settings-btn').prop('disabled', false);
            this.$scope.successMessage = data.toString();
        }).error((data) => {
                $('.settings-btn').prop('disabled', false);
                this.$scope.errorMessage = data.toString();
            });
    }

    public AddTweet(): void {
        this.$scope.tweetSuccessMessage = "";
        this.$scope.tweetErrorMessage = "";
        $('.settings-btn').prop('disabled', true);
        this.$http.post('/api/restricted/AddTweet', { embedCode: this.$scope.tweetEmbedCode }).success((data: any) => {
            $('.settings-btn').prop('disabled', false);
            this.$scope.tweetSuccessMessage = data.toString();
            this.$scope.tweetEmbedCode = "";
        }).error((data) => {
                $('.settings-btn').prop('disabled', false);
                this.$scope.tweetErrorMessage = data.toString();
            });
    }

    public DeleteUser(): void {
        this.$scope.deleteUserSuccessMessage = "";
        this.$scope.deleteUserErrorMessage = "";
        $('.settings-btn').prop('disabled', true);
        this.$http.post('/api/restricted/DeleteUser', { user: this.$scope.selectedUser[0] })
            .success((data: string) => {
                $('.settings-btn').prop('disabled', false);
                this.$scope.deleteUserSuccessMessage = data;
                this.getUsers();
                this.$scope.selectedUser = null;
            })
            .error((data: string) => {
                $('.settings-btn').prop('disabled', false);
                this.$scope.deleteUserErrorMessage = data;
            });
    }

    public IsUserSelected(): boolean {
        return this.$scope.selectedUser != null;
    }

    public SendEmail(): void {
        this.$scope.sendEmailErrorMessage = "";
        this.$scope.sendEmailSuccessMessage = "";
        $('.settings-btn').prop('disabled', true);
        this.$http.post('/api/restricted/sendAdminEmail', { subject: this.$scope.emailSubject, body: this.$scope.emailBody })
            .success((data: string) => {
                $('.settings-btn').prop('disabled', false);
                this.$scope.sendEmailSuccessMessage = "Sent email";
                this.$scope.emailSubject = "Developer Community";
                this.$scope.emailBody = "";
            })
            .error((data: string) => {
                $('.settings-btn').prop('disabled', false);
                this.$scope.sendEmailErrorMessage = "Failed to send email";
            });
    }

    private getUsers(): void {
        this.$http.get('/api/restricted/GetUsers')
            .success((data: Array<UserSettings>) => {
                this.$scope.users = data;
            })
            .error((data: Array<UserSettings>) => {
                this.$scope.users = [];
            });
    }
}

angular.module(app.getModuleName()).controller('AdminController', ['$scope', '$http', AdminController]);

export = AdminController;
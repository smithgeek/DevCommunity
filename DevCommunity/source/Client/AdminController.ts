///ts:import=AdminControllerScope
import AdminControllerScope = require('./AdminControllerScope'); ///ts:import:generated
///ts:import=app
import app = require('./app'); ///ts:import:generated

class AdminController {
    constructor(private $scope: AdminControllerScope, private $http: ng.IHttpService) {
        $('.navbar-nav li.active').removeClass('active');
        $('#NavAdmin').addClass('active');

        this.$scope.emailAddress = "";
        this.$scope.errorMessage = "";
        this.$scope.successMessage = "";
        this.$scope.tweetSuccessMessage = "";
        this.$scope.tweetErrorMessage = "";
    }

    public Submit(): void {
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
}

angular.module(app.getModuleName()).controller('AdminController', ['$scope', '$http', AdminController]);

export = AdminController;
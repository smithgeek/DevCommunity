///ts:import=app
import app = require('./app'); ///ts:import:generated
///ts:import=IUserSvc
import IUserSvc = require('./IUserSvc'); ///ts:import:generated

class RegisterController {
    constructor(private $scope, private $http: ng.IHttpService, private userSvc: IUserSvc) {
        $('.navbar-nav li.active').removeClass('active');
        if (this.userSvc.isLoggedIn()) {
            this.$scope.email = this.userSvc.getUser();
        }
    }
}

angular.module(app.getModuleName()).controller('RegisterController', ['$scope', '$http', 'userSvc', RegisterController]);

export = RegisterController;


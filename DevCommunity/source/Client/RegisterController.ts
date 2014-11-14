///ts:import=app
import app = require('./app'); ///ts:import:generated
///ts:import=IUserSvc
import IUserSvc = require('./IUserSvc'); ///ts:import:generated
///ts:import=PrizeTransport
import PrizeTransport = require('../Common/PrizeTransport'); ///ts:import:generated
///ts:import=RegisterControllerScope
import RegisterControllerScope = require('./RegisterControllerScope'); ///ts:import:generated

class RegisterController {
    constructor(private $scope: RegisterControllerScope, private $http: ng.IHttpService, private userSvc: IUserSvc) {
        this.$scope.pluralsight = true;
        this.$scope.ebook = true;
        this.$scope.errorMessage = "";
        this.$scope.successMessage = "";

        $('.navbar-nav li.active').removeClass('active');
        if (this.userSvc.isLoggedIn()) {
            this.$scope.email = this.userSvc.getUser();
        }

        this.$http.get('/api/IsPrizeRegistrationOpen').success((data: PrizeTransport.IsRegistrationOpen) => {
            if (data.Open) {
                $('#PrizeRegistration').removeClass('hidePrize');
            }
            else {
                $('#PrizeRegistrationClosed').removeClass('hidePrize');
            }
        }).error(() => {
            $('#PrizeRegistrationClosed').removeClass('hidePrize');
        });
    }

    public Submit(): void {
        this.$scope.errorMessage = "";
        this.$scope.successMessage = "";

        var prizes: Array<string> = [];
        if (this.$scope.pluralsight) {
            prizes.push('pluralsight');
        }
        if (this.$scope.ebook) {
            prizes.push('ebook');
        }
        this.$http.post('/api/RegisterForPrizes',
            <PrizeTransport.Register>{ Email: this.$scope.email, Prizes: prizes })
            .success((data: PrizeTransport.RegisterReply) => {
                this.$scope.successMessage = data.Message;
            }).error((data: PrizeTransport.RegisterReply) => {
                this.$scope.errorMessage = data.Message;
            });
    }
}

angular.module(app.getModuleName()).controller('RegisterController', ['$scope', '$http', 'userSvc', RegisterController]);

export = RegisterController;


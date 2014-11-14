///ts:import=app
import app = require('./app'); ///ts:import:generated
///ts:import=PrizeTransport
import PrizeTransport = require('../Common/PrizeTransport'); ///ts:import:generated
///ts:import=WinnerControllerScope
import WinnerControllerScope = require('./WinnerControllerScope'); ///ts:import:generated

class WinnerController {
    constructor(private $scope: WinnerControllerScope, private $http: ng.IHttpService, socket) {
        this.$scope.hasWinner = false;
        this.$scope.RegistrationOpen = false;

        socket.on('Prize:WinnerSelected', (data: PrizeTransport.WinnerResponse) => {
            this.$scope.Prize = "";
            this.$scope.Person = "";

            this.$scope.hasWinner = true
            this.$scope.Prize = data.Prize.toUpperCase();
            this.$scope.Person = data.Winner.toLowerCase();
        });

        socket.on('Prize:WinnerSaved', () => {
            this.$scope.hasWinner = false;
        });

        socket.on('Prize:RegistrationOpened', () => {
            this.$scope.RegistrationOpen = true;
        });

        socket.on('Prize:RegistrationClosed', () => {
            this.$scope.RegistrationOpen = false;
        });

        this.$http.get('/api/IsPrizeRegistrationOpen').success((data: PrizeTransport.IsRegistrationOpen) => {
            this.$scope.RegistrationOpen = data.Open;
            var url = $("#qrCode").attr("data");
            var qrCode = new QRCode("qrCode", { width: 512, height: 512 });
            qrCode.makeCode(url);
        });
    }

}

angular.module(app.getModuleName()).controller('WinnerController', ['$scope', '$http', 'socket', WinnerController]);

export = WinnerController;


///ts:import=app
import app = require('./app'); ///ts:import:generated
///ts:import=PrizeTransport
import PrizeTransport = require('../Common/PrizeTransport'); ///ts:import:generated
///ts:import=AdminPrizeControllerScope
import AdminPrizeControllerScope = require('./AdminPrizeControllerScope'); ///ts:import:generated

class AdminPrizeController {
    constructor(private $scope: AdminPrizeControllerScope, private $http: ng.IHttpService, socket) {
        this.$scope.registrationOpen = false;
        this.$scope.haveEntries = false;
        this.$scope.hasSelection = false;
        this.$scope.errorMessage = "";
        this.$scope.successMessage = "";
        this.$scope.selectedUser = "";
        this.$scope.selectedPrize = "";
        this.$scope.entries = [];
        this.$scope.pastWinners = [];
        this.$scope.newEntries = 0;

        this.$http.get('/api/IsPrizeRegistrationOpen').success((data: PrizeTransport.IsRegistrationOpen) => {
            this.$scope.registrationOpen = data.Open;
        });
        this.refreshEntries();
        this.refreshPastWinners();
        socket.on('Prize:NewEntry', () => { this.$scope.newEntries++; });

        this.$scope.$on("$destroy", () => {
            socket.close();
        });
    }

    public OpenRegistration(): void {
        this.clearMsg();
        this.$http.post('/api/restricted/OpenRegistration', {})
            .success(() => {
                this.$scope.registrationOpen = true;
                this.refreshEntries();
            }).error(() => {
                this.$scope.errorMessage = "Could not open registration.";
            });
    }

    public CloseRegistration(): void {
        this.clearMsg();
        this.$http.post('/api/restricted/CloseRegistration', {})
            .success(() => {
                this.$scope.registrationOpen = false;
            }).error(() => {
                this.$scope.errorMessage = "Could not close registration.";
            });
    }

    public PickPluralsightWinner(): void {
        this.clearMsg();
        this.clearSelectedWinner();
        this.$http.post('/api/restricted/PickWinner', <PrizeTransport.PickWinner>{Prize: 'pluralsight'})
            .success((data: PrizeTransport.WinnerResponse) => {
                this.$scope.selectedUser = data.Winner;
                this.$scope.selectedPrize = 'pluralsight';
                this.$scope.hasSelection = true;
            }).error((data: string) => {
                this.$scope.errorMessage = data;
            });
    }

    public PickEBookWinner(): void {
        this.clearMsg();
        this.clearSelectedWinner();
        this.$http.post('/api/restricted/PickWinner', <PrizeTransport.PickWinner>{ Prize: 'ebook' })
            .success((data: PrizeTransport.WinnerResponse) => {
                this.$scope.selectedUser = data.Winner;
                this.$scope.selectedPrize = 'ebook';
                this.$scope.hasSelection = true;
            }).error((data: string) => {
                this.$scope.errorMessage = data;
            });
    }

    public SaveWinner(): void {
        this.clearMsg();
        this.$http.post('/api/restricted/SaveWinner', <PrizeTransport.SaveWinner>{ Email: this.$scope.selectedUser, Prize: this.$scope.selectedPrize })
            .success((data: string) => {
                this.$scope.successMessage = data;
                this.refreshEntries();
                this.refreshPastWinners();
            }).error((data: string) => {
                this.$scope.errorMessage = data;
            });
    }

    public ClearEntries(): void {
        this.clearMsg();
        this.$http.post('/api/restricted/ClearPrizeEntries', {})
            .success((data: string) => {
                this.$scope.successMessage = data;
                this.refreshEntries();
            }).error((data: string) => {
                this.$scope.errorMessage = data;
            });
    }

    public RemovePastWinner(email: string): void {
        this.clearMsg();
        this.$http.post('/api/restricted/ClearPastWinner', <PrizeTransport.ClearPastWinner>{ Email: email })
            .success((data: string) => {
                this.$scope.successMessage = data;
                this.refreshPastWinners();
            }).error((data: string) => {
                this.$scope.errorMessage = data;
            });
    }

    private clearMsg(): void {
        this.$scope.errorMessage = "";
        this.$scope.successMessage = "";
    }

    private clearSelectedWinner(): void {
        this.$scope.selectedUser = '';
        this.$scope.selectedPrize = '';
        this.$scope.hasSelection = false;
    }

    private refreshEntries(): void {
        this.$http.get('/api/restricted/GetPrizeEntries').success((data: PrizeTransport.GetEntriesResponse) => {
            this.$scope.entries = data.Entries;
            this.$scope.haveEntries = this.$scope.entries.length > 0;
            this.$scope.newEntries = 0;
        });
    }

    private refreshPastWinners(): void {
        this.$http.get('/api/restricted/GetPastWinners').success((data: PrizeTransport.GetPastWinnersResponse) => {
            this.$scope.pastWinners = data.Winners;
        });
    }

}

angular.module(app.getModuleName()).controller('AdminPrizeController', ['$scope', '$http', 'socket', AdminPrizeController]);

export = AdminPrizeController;


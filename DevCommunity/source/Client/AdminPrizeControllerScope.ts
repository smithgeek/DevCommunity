///ts:import=PrizeTransport
import PrizeTransport = require('../Common/PrizeTransport'); ///ts:import:generated

interface AdminPrizeControllerScope extends ng.IScope {
    registrationOpen: boolean;
    haveEntries: boolean;
    hasSelection: boolean;
    errorMessage: string;
    successMessage: string;

    selectedUser: string;
    selectedPrize: string;

    entries: Array<PrizeTransport.Entry>;
    pastWinners: Array<string>;
}

export = AdminPrizeControllerScope;
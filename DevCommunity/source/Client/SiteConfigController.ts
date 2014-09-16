///ts:import=app
import app = require('./app'); ///ts:import:generated
///ts:import=SiteConfigControllerScope
import SiteConfigControllerScope = require('./SiteConfigControllerScope'); ///ts:import:generated
///ts:import=Site
import Site = require('../Common/Site'); ///ts:import:generated
///ts:import=Browser
import Browser = require('./Impl/Browser'); ///ts:import:generated

class SiteConfigController {
    constructor(private $scope: SiteConfigControllerScope, private $http: ng.IHttpService, private browser: Browser.IDocumentLocation) {
        this.$scope.ErrorMessage = "";
        this.$scope.SuccessMessage = "";
        this.$scope.config = null;
        this.$http.get('/api/restricted/GetSiteConfig').success((data: Site.Config) => {
            this.$scope.config = data;
        });
    }

    public Submit(): void {
        $('.settings-btn').prop('disabled', true);
        this.$http.post('/api/restricted/UpdateSiteConfig', this.$scope.config).success((data) => {
                $('.settings-btn').prop('disabled', false);
                this.$scope.ErrorMessage = "";
                this.$scope.SuccessMessage = "Site config updated.";
                this.browser.reload();
            }).error((data) => {
                $('.settings-btn').prop('disabled', false);
                this.$scope.SuccessMessage = "";
                this.$scope.ErrorMessage = data.toString();
            });
    }
}

angular.module(app.getModuleName()).controller('SiteConfigController', ['$scope', '$http', 'documentLocation', SiteConfigController]);

export = SiteConfigController;
///ts:import=SiteConfigControllerScope
import SiteConfigControllerScope = require('../../Client/SiteConfigControllerScope'); ///ts:import:generated
///ts:import=SiteConfigController
import SiteConfigController = require('../../Client/SiteConfigController'); ///ts:import:generated
///ts:import=Browser
import Browser = require('../../Client/Impl/Browser'); ///ts:import:generated

describe("SiteConfigController", function () {
    var $httpBackend: ng.IHttpBackendService;
    var $http: ng.IHttpService;
    var $scope: SiteConfigControllerScope;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        $scope = _$rootScope_.$new();
        $httpBackend = _$httpBackend_;
        $http = _$http_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function getController(): SiteConfigController {
        $httpBackend.expectGET('/api/restricted/GetSiteConfig').respond(200, { fake: "config" });
        return new SiteConfigController($scope, $http, <Browser.IDocumentLocation>{ reload: function () { } });
    }

    it("DefaultConstructed", function () {
        getController();
        expect($scope.ErrorMessage).to.be("");
        expect($scope.SuccessMessage).to.be("");
        expect($scope.config).to.be(null);
        $httpBackend.flush();
        expect($scope.config).to.not.be(null);
    });

    it("SubmitChangedConfigSuccess", () => {
        $scope.ErrorMessage = "past msg";
        var controller = getController();
        $httpBackend.expectPOST('/api/restricted/UpdateSiteConfig', $scope.config).respond(200);
        controller.Submit();
        $httpBackend.flush();
        expect($scope.SuccessMessage).to.not.be("");
        expect($scope.ErrorMessage).to.be("");
    });

    it("SubmitChangedConfigFail", () => {
        $scope.SuccessMessage = "past msg";
        var controller = getController();
        var err = "Failure: something bad happened";
        $httpBackend.expectPOST('/api/restricted/UpdateSiteConfig', $scope.config).respond(404, err);
        controller.Submit();
        $httpBackend.flush();
        expect($scope.SuccessMessage).to.be("");
        expect($scope.ErrorMessage).to.be(err);
    });

});
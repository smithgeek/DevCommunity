///ts:import=UserSettingsControllerScope
import UserSettingsControllerScope = require('../../Client/UserSettingsControllerScope'); ///ts:import:generated
///ts:import=IUserSvc
import IUserSvc = require('../../Client/IUserSvc'); ///ts:import:generated
///ts:import=UserSettingsController
import UserSettingsController = require('../../Client/UserSettingsController'); ///ts:import:generated
///ts:import=UserSettings
import UserSettings = require('../../Common/UserSettings'); ///ts:import:generated

describe("UserSettingsController", function () {
    var $httpBackend: ng.IHttpBackendService;
    var $http: ng.IHttpService;
    var $scope: UserSettingsControllerScope;
    var userSvc: IUserSvc;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $scope = _$rootScope_.$new();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function getController(): UserSettingsController {
        return new UserSettingsController($scope, $http, userSvc);
    }

    function getDefaultController(): UserSettingsController {
        $httpBackend.expectGET('/api/restricted/GetUserSettings').respond(401);
        var controller = getController();
        $httpBackend.flush();
        return controller;
    }

    it("DefaultConstructed", function () {
        getDefaultController();
        expect($scope.settings).to.eql(new UserSettings());
        expect($scope.errorMessage).to.be("");
        expect($scope.successMessage).to.be("");
    });

    it("IsLoggedIn", function () {
        userSvc = <IUserSvc>{
            isLoggedIn: function () { return true }
        };
        expect(getDefaultController().isLoggedIn()).to.be(true);
    });

    it("IsNotLoggedIn", function () {
        userSvc = <IUserSvc>{
            isLoggedIn: function () { return false }
        };
        expect(getDefaultController().isLoggedIn()).to.be(false);
    });

    it("UpdateSettingsFromServer", function () {
        var settings: UserSettings = new UserSettings();
        settings.email = "not default";
        $httpBackend.expectGET('/api/restricted/GetUserSettings').respond(200, settings);
        getController();
        $httpBackend.flush();
        expect($scope.settings).to.eql(settings);
    });

    it("GetEmptySettingsFromServer", function () {
        var settings: UserSettings = new UserSettings();
        $httpBackend.expectGET('/api/restricted/GetUserSettings').respond(200, "");
        getController();
        $httpBackend.flush();
        expect($scope.settings).to.eql(new UserSettings());
    });

    it("GetNullSettingsFromServer", function () {
        var settings: UserSettings = new UserSettings();
        $httpBackend.expectGET('/api/restricted/GetUserSettings').respond(200, null);
        getController();
        $httpBackend.flush();
        expect($scope.settings).to.eql(new UserSettings());
    });

    it("SettingsUpdated", function () {
        var controller: UserSettingsController = getDefaultController();
        $scope.successMessage = "fail";
        $httpBackend.expectPOST('/api/restricted/SetUserSettings', $scope.settings).respond(200);
        controller.Submit();
        $httpBackend.flush();
        expect($scope.successMessage).to.be("Settings saved.");
        expect($scope.errorMessage).to.be("");
    });

    it("SettingsFailedUpdated", function () {
        var controller: UserSettingsController = getDefaultController();
        $scope.successMessage = "success";
        $httpBackend.expectPOST('/api/restricted/SetUserSettings', $scope.settings).respond(404, "failure");
        controller.Submit();
        $httpBackend.flush();
        expect($scope.errorMessage).to.be("failure");
        expect($scope.successMessage).to.be("");
    });
});
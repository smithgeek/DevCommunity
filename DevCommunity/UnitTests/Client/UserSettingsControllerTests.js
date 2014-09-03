/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../typings/sinon/sinon.d.ts" />
/// <reference path="../../public/assets/js/app.ts" />
/// <reference path="../../public/assets/js/Services.ts" />
describe("UserSettingsController", function () {
    var $httpBackend;
    var $http;
    var $scope;
    var userSvc;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $scope = _$rootScope_.$new();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function getController() {
        return new UserSettingsController($scope, $http, userSvc);
    }

    function getDefaultController() {
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
        userSvc = {
            isLoggedIn: function () {
                return true;
            }
        };
        expect(getDefaultController().isLoggedIn()).to.be(true);
    });

    it("IsNotLoggedIn", function () {
        userSvc = {
            isLoggedIn: function () {
                return false;
            }
        };
        expect(getDefaultController().isLoggedIn()).to.be(false);
    });

    it("UpdateSettingsFromServer", function () {
        var settings = new UserSettings();
        settings.email = "not default";
        $httpBackend.expectGET('/api/restricted/GetUserSettings').respond(200, settings);
        getController();
        $httpBackend.flush();
        expect($scope.settings).to.eql(settings);
    });

    it("GetEmptySettingsFromServer", function () {
        var settings = new UserSettings();
        $httpBackend.expectGET('/api/restricted/GetUserSettings').respond(200, "");
        getController();
        $httpBackend.flush();
        expect($scope.settings).to.eql(new UserSettings());
    });

    it("GetNullSettingsFromServer", function () {
        var settings = new UserSettings();
        $httpBackend.expectGET('/api/restricted/GetUserSettings').respond(200, null);
        getController();
        $httpBackend.flush();
        expect($scope.settings).to.eql(new UserSettings());
    });

    it("SettingsUpdated", function () {
        var controller = getDefaultController();
        $scope.successMessage = "fail";
        $httpBackend.expectPOST('/api/restricted/SetUserSettings', $scope.settings).respond(200);
        controller.Submit();
        $httpBackend.flush();
        expect($scope.successMessage).to.be("Settings saved.");
        expect($scope.errorMessage).to.be("");
    });

    it("SettingsFailedUpdated", function () {
        var controller = getDefaultController();
        $scope.successMessage = "success";
        $httpBackend.expectPOST('/api/restricted/SetUserSettings', $scope.settings).respond(404, "failure");
        controller.Submit();
        $httpBackend.flush();
        expect($scope.errorMessage).to.be("failure");
        expect($scope.successMessage).to.be("");
    });
});
//# sourceMappingURL=UserSettingsControllerTests.js.map

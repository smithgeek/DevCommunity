/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/expect.js/expect.js.d.ts" />
/// <reference path="../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../typings/sinon/sinon.d.ts" />
/// <reference path="../public/assets/js/app.ts" />
describe("AdminController", function () {
    var $httpBackend;
    var $http;
    var $scope;

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
        return new AdminController($scope, $http);
    }

    it("DefaultConstructed", function () {
        getController();
        expect($scope.emailAddress).to.be("");
        expect($scope.errorMessage).to.be("");
        expect($scope.successMessage).to.be("");
    });

    it("CanAddUser", function () {
        var controller = getController();
        var address = "fake_address";
        $scope.emailAddress = address;
        $httpBackend.expectPOST('/api/restricted/AddUser', { user: address }).respond(200, "success");
        controller.Submit();
        $httpBackend.flush();
        expect($scope.successMessage).to.be("success");
        expect($scope.errorMessage).to.be("");
    });

    it("FailAddUser", function () {
        var controller = getController();
        var address = "fake_address";
        $scope.emailAddress = address;
        $httpBackend.expectPOST('/api/restricted/AddUser', { user: address }).respond(401, "fail");
        controller.Submit();
        $httpBackend.flush();
        expect($scope.successMessage).to.be("");
        expect($scope.errorMessage).to.be("fail");
    });
});
//# sourceMappingURL=AdminControllerTests.js.map

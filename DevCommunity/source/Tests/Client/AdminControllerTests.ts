///ts:import=AdminControllerScope
import AdminControllerScope = require('../../Client/AdminControllerScope'); ///ts:import:generated
///ts:import=AdminController
import AdminController = require('../../Client/AdminController'); ///ts:import:generated

describe("AdminController", function () {
    var $httpBackend: ng.IHttpBackendService;
    var $http: ng.IHttpService;
    var $scope: AdminControllerScope;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $scope = _$rootScope_.$new();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function getController(): AdminController {
        $httpBackend.expectGET('/api/restricted/GetUsers').respond(200, []);
        var controller = new AdminController($scope, $http);
        $httpBackend.flush();
        return controller;
    }

    it("DefaultConstructed", function () {
        getController();
        expect($scope.emailAddress).to.be("");
        expect($scope.errorMessage).to.be("");
        expect($scope.successMessage).to.be("");
        expect($scope.tweetSuccessMessage).to.be("");
        expect($scope.tweetErrorMessage).to.be("");
    });

    it("CanAddUser", function () {
        $scope.successMessage = "init";
        $scope.errorMessage = "init";
        var controller: AdminController = getController();
        var address = "fake_address";
        $scope.emailAddress = address;
        $httpBackend.expectPOST('/api/restricted/AddUser', { user: address }).respond(200, "success");
        controller.AddUser();
        $httpBackend.flush();
        expect($scope.successMessage).to.be("success");
        expect($scope.errorMessage).to.be("");
    });

    it("FailAddUser", function () {
        $scope.successMessage = "init";
        $scope.errorMessage = "init";
        var controller: AdminController = getController();
        var address = "fake_address";
        $scope.emailAddress = address;
        $httpBackend.expectPOST('/api/restricted/AddUser', { user: address }).respond(401, "fail");
        controller.AddUser();
        $httpBackend.flush();
        expect($scope.successMessage).to.be("");
        expect($scope.errorMessage).to.be("fail");
    });

    it("CanAddTweet", function () {
        $scope.tweetSuccessMessage = "init";
        $scope.tweetErrorMessage = "init";
        var controller: AdminController = getController();
        var html = "code";
        $scope.tweetEmbedCode = html;
        $httpBackend.expectPOST('/api/restricted/AddTweet', { embedCode: html }).respond(200, "success");
        controller.AddTweet();
        $httpBackend.flush();
        expect($scope.tweetSuccessMessage).to.be("success");
        expect($scope.tweetErrorMessage).to.be("");
    });

    it("FailAddTweet", function () {
        $scope.tweetSuccessMessage = "init";
        $scope.tweetErrorMessage = "init";
        var controller: AdminController = getController();
        var html = "code";
        $scope.tweetEmbedCode = html;
        $httpBackend.expectPOST('/api/restricted/AddTweet', { embedCode: html }).respond(401, "fail");
        controller.AddTweet();
        $httpBackend.flush();
        expect($scope.tweetSuccessMessage).to.be("");
        expect($scope.tweetErrorMessage).to.be("fail");
    });
});
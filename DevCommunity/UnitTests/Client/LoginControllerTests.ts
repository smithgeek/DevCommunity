/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../typings/sinon/sinon.d.ts" />
/// <reference path="../../public/assets/js/app.ts" />

describe("LoginController", function () {
    var $httpBackend: ng.IHttpBackendService;
    var $http: ng.IHttpService;
    var $scope: ILoginControllerScope;
    var location: IDocumentLocation;
    var localStorage;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $scope = _$rootScope_.$new();
        location = <IDocumentLocation> { reload: function () { } };
        localStorage = { remove: function (s: string) { }, set: function (s: string, d: any) { } };
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function getController(): LoginController {
        return new LoginController($scope, $http, localStorage, location);
    }

    it("DefaultConstructed", function () {
        getController();
        expect($scope.user).to.eql({ email: '', verificationCode: '' });
        expect($scope.message).to.be("");
        expect($scope.step).to.be("Email");
    });

    it("SubmitEmailAndGetSuccessResponse", function () {
        var controller = getController();
        $scope.user.email = "user";
        $httpBackend.expectPOST('/identify', $scope.user).respond(200);
        controller.submitEmail();
        $httpBackend.flush();
        expect($scope.step).to.be("Verification");
        expect($scope.message).to.be("");
    });

    it("SubmitEmailAndGetFailResponse", function () {
        var mock = sinon.mock(localStorage);
        mock.expects("remove").once().withExactArgs('userToken');
        mock.expects("remove").once().withExactArgs('userEmail');
        var controller = getController();
        $httpBackend.expectPOST('/identify', $scope.user).respond(404, "fail");
        controller.submitEmail();
        $httpBackend.flush();
        expect($scope.step).to.be("Email");
        expect($scope.message).to.be("fail");
        mock.verify();
    });

    it("SubmitVerificationAndGetSuccessResponse", function () {
        var controller = getController();
        $scope.user.email = "user";

        var mock = sinon.mock(localStorage);
        mock.expects("set").once().withExactArgs('userToken', "1");
        mock.expects("set").once().withExactArgs('userEmail', $scope.user);

        var mockLocation = sinon.mock(location);
        mockLocation.expects("reload").once();

        $httpBackend.expectPOST('/verify', $scope.user).respond(200, { token: "1" } );
        controller.submitVerification();
        $httpBackend.flush();
        expect($scope.step).to.be("Email");
        expect($scope.message).to.be("");
        expect($scope.user).to.eql({ email: '', verificationCode: '' });
        mockLocation.verify();
        mock.verify();
    });

    it("SubmitVerificationAndGetFailResponse", function () {
        var mock = sinon.mock(localStorage);
        mock.expects("remove").once().withExactArgs('userToken');
        mock.expects("remove").once().withExactArgs('userEmail');
        var controller = getController();
        $httpBackend.expectPOST('/verify', $scope.user).respond(404);
        controller.submitVerification();
        $httpBackend.flush();
        expect($scope.message).to.be("Invalid verification code.");
        mock.verify();
    });
});
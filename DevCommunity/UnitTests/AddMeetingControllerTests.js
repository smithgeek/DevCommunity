/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/expect.js/expect.js.d.ts" />
/// <reference path="../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../typings/sinon/sinon.d.ts" />
/// <reference path="../public/assets/js/app.ts" />
/// <reference path="../public/assets/js/Services.ts" />
describe("AddMeetingController", function () {
    var $httpBackend;
    var $http;
    var $scope;
    var meetingSvc;
    var userSvc;
    var defaultMeeting;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        defaultMeeting = {};
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $scope = _$rootScope_.$new();
        meetingSvc = { createMeeting: function () {
                return defaultMeeting;
            } };
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function getController() {
        return new AddMeetingController($scope, $http, meetingSvc, userSvc);
    }

    it("DefaultConstructed", function () {
        getController();
        expect($scope.meeting).to.be(defaultMeeting);
        expect($scope.errorMessage).to.be("");
    });

    it("OnAddEdit", function () {
        getController();
        $scope.$broadcast('addMeeting');
        expect($scope.meeting).to.be(defaultMeeting);
        expect($scope.errorMessage).to.be("");
    });
});
//# sourceMappingURL=AddMeetingControllerTests.js.map

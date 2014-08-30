/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/expect.js/expect.js.d.ts" />
/// <reference path="../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../public/assets/js/Services.ts" />
/// <reference path="../public/assets/js/PastMeetingsController.ts" />
describe("PastMeetingsController", function () {
    var $httpBackend;
    var $http;
    var $routeParams;
    var $scope;
    var controller;
    var meetingSvc;
    var serverCounter;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        serverCounter = 0;
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $routeParams = { id: 3 };
        $scope = _$rootScope_.$new();
        meetingSvc = { createMeeting: function () {
                return null;
            } };
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("CannotGetPastMeetings", function () {
        $httpBackend.expectGET('/api/GetArchivedMeetings').respond(401);
        controller = new PastMeetingsController($scope, $http, meetingSvc);
        $httpBackend.flush();
        expect($scope.meetings).to.empty();
        expect(controller.loggedIn).to.be(false);
    });

    it("NoPastMeetingsExist", function () {
        var meetings = [];
        $httpBackend.expectGET('/api/GetArchivedMeetings').respond(200, meetings);
        controller = new PastMeetingsController($scope, $http, meetingSvc);
        $httpBackend.flush();
        expect($scope.meetings).to.empty();
    });

    it("CanGetPastMeetings", function () {
        var serverMeetings = [new MeetingData(), new MeetingData()];
        $httpBackend.expectGET('/api/GetArchivedMeetings').respond(200, serverMeetings);
        controller = new PastMeetingsController($scope, $http, meetingSvc);
        $httpBackend.flush();
        expect($scope.meetings.length).to.be(serverMeetings.length);
    });
});
//# sourceMappingURL=PastMeetingsControllerTests.js.map

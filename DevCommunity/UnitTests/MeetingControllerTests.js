/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/expect.js/expect.js.d.ts" />
/// <reference path="../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../typings/sinon/sinon.d.ts" />
/// <reference path="../public/assets/js/Services.ts" />
/// <reference path="../public/assets/js/MeetingController.ts" />
describe("MeetingController", function () {
    var $httpBackend;
    var $http;
    var $routeParams;
    var $rootScope;
    var controller;
    var meetingSvc;
    var mockMeetingSvc;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $routeParams = { id: 3 };
        $rootScope = _$rootScope_.$new();
        meetingSvc = { createMeeting: function () {
            } };
        mockMeetingSvc = sinon.mock(meetingSvc);
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("CannotGetMeetings", function () {
        $httpBackend.expectGET('/api/GetMeetingById/3').respond(401);
        controller = new MeetingController($rootScope, $http, $routeParams, meetingSvc);
        $httpBackend.flush();
        expect($rootScope.contentLoaded).to.equal(false);
    });

    it("GetMeetings", function () {
        mockMeetingSvc.expects("createMeeting").once().returns(null);
        $httpBackend.expectGET('/api/GetMeetingById/3').respond(200, new MeetingData());
        controller = new MeetingController($rootScope, $http, $routeParams, meetingSvc);
        $httpBackend.flush();
        expect($rootScope.contentLoaded).to.equal(true);
    });
});
//# sourceMappingURL=MeetingControllerTests.js.map

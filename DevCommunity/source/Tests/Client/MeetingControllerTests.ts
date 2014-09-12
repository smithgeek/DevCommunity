///ts:import=MeetingController
import MeetingController = require('../../Client/MeetingController'); ///ts:import:generated
///ts:import=IMeetingSvc
import IMeetingSvc = require('../../Client/IMeetingSvc'); ///ts:import:generated
///ts:import=MeetingData
import MeetingData = require('../../Common/MeetingData'); ///ts:import:generated

describe("MeetingController", function () {
    var $httpBackend: ng.IHttpBackendService;
    var $http: ng.IHttpService;
    var $routeParams;
    var $rootScope;
    var controller: MeetingController;
    var meetingSvc: IMeetingSvc;
    var mockMeetingSvc: SinonMock;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $routeParams = { id: 3 };
        $rootScope = _$rootScope_.$new();
        meetingSvc = <IMeetingSvc>{ createMeeting: function () {}};
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
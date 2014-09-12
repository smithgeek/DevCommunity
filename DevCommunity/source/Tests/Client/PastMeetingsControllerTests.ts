///ts:import=PastMeetingsController
import PastMeetingsController = require('../../Client/PastMeetingsController'); ///ts:import:generated
///ts:import=IMeetingSvc
import IMeetingSvc = require('../../Client/IMeetingSvc'); ///ts:import:generated
///ts:import=MeetingData
import MeetingData = require('../../Common/MeetingData'); ///ts:import:generated

describe("PastMeetingsController", function () {
    var $httpBackend: ng.IHttpBackendService;
    var $http: ng.IHttpService;
    var $routeParams;
    var $scope;
    var controller: PastMeetingsController;
    var meetingSvc: IMeetingSvc;
    var serverCounter: number;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        serverCounter = 0;
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $routeParams = { id: 3 };
        $scope = _$rootScope_.$new();
        meetingSvc = <IMeetingSvc>{ createMeeting: function () { return null; } };
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
        var meetings: Array<MeetingData> = [];
        $httpBackend.expectGET('/api/GetArchivedMeetings').respond(200, meetings);
        controller = new PastMeetingsController($scope, $http, meetingSvc);
        $httpBackend.flush();
        expect($scope.meetings).to.empty();
    });

    it("CanGetPastMeetings", function () {
        var serverMeetings: Array<MeetingData> = [new MeetingData(), new MeetingData()];
        $httpBackend.expectGET('/api/GetArchivedMeetings').respond(200, serverMeetings);
        controller = new PastMeetingsController($scope, $http, meetingSvc);
        $httpBackend.flush();
        expect($scope.meetings.length).to.be(serverMeetings.length);
    });
});
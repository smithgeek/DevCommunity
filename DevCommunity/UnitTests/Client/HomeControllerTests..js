/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../typings/sinon/sinon.d.ts" />
/// <reference path="../../public/assets/js/HomeController.ts" />
describe("HomeController", function () {
    var $httpBackend;
    var $http;
    var $scope;
    var meetingSvc;
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
        $httpBackend.expectGET('/api/GetSuggestions').respond(401);
        var controller = new HomeController($scope, $http, userSvc, meetingSvc, null);
        $httpBackend.flush();
        return controller;
    }

    it("CannotGetSuggestions", function () {
        var controller = getController();
        expect(controller.loggedIn).to.be(false);
        expect($scope.meetings).to.be.empty();
    });

    it("CanGetSuggestions", function () {
        meetingSvc = {
            createMeeting: function () {
                return null;
            }
        };
        $httpBackend.expectGET('/api/GetSuggestions').respond(200, [new MeetingData(), new MeetingData()]);
        var controller = new HomeController($scope, $http, userSvc, meetingSvc, null);
        $httpBackend.flush();
        expect($scope.meetings.length).to.be(2);
    });

    it("UserAddsMeeting", function () {
        var controller = getController();
        $scope.$broadcast('meetingAdded', null);
        expect($scope.meetings.length).to.be(1);
    });

    it("TryAddTopicWhenNotLoggedIn", function () {
        userSvc = { isLoggedIn: function () {
                return false;
            } };
        meetingSvc = { notifyAddMeeting: function () {
            } };
        var mockMeetingSvc = sinon.mock(meetingSvc);
        mockMeetingSvc.expects("notifyAddMeeting").never();
        var controller = getController();
        controller.AddTopic();
    });

    it("TryAddTopicWhenLoggedIn", function () {
        userSvc = { isLoggedIn: function () {
                return true;
            } };
        meetingSvc = { notifyAddMeeting: function () {
            } };
        var mockMeetingSvc = sinon.mock(meetingSvc);
        mockMeetingSvc.expects("notifyAddMeeting").once();
        var controller = getController();
        controller.AddTopic();
    });

    it("EditMeeting", function () {
        meetingSvc = { notifyEditMeeting: function (meeting) {
            } };
        var mockMeetingSvc = sinon.mock(meetingSvc);
        mockMeetingSvc.expects("notifyEditMeeting").once();
        var controller = getController();
        controller.EditMeeting(null);
    });
});
//# sourceMappingURL=HomeControllerTests..js.map

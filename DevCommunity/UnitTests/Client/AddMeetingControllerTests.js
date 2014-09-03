/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../typings/sinon/sinon.d.ts" />
/// <reference path="../../public/assets/js/app.ts" />
/// <reference path="../../public/assets/js/Services.ts" />
describe("AddMeetingController", function () {
    var $httpBackend;
    var $http;
    var $scope;
    var meetingSvc;
    var userSvc;
    var defaultMeeting;
    var rtb;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        defaultMeeting = { details: "details", SetUser: function (user) {
            }, GetData: function () {
                return null;
            } };
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $scope = _$rootScope_.$new();
        meetingSvc = { createMeeting: function () {
                return defaultMeeting;
            }, notifyMeetingAdded: function (meeting) {
            } };
        rtb = { setId: function (id) {
            }, setText: function (text) {
            }, getText: function () {
                return "text";
            } };
        userSvc = { getUser: function () {
                return "user";
            } };
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function getController() {
        return new AddMeetingController($scope, $http, meetingSvc, userSvc, rtb);
    }

    it("DefaultConstructed", function () {
        var mock = sinon.mock(rtb);
        mock.expects("setId").once().withExactArgs('newIdeaDetails');
        getController();
        expect($scope.meeting).to.be(defaultMeeting);
        expect($scope.errorMessage).to.be("");
        mock.verify();
    });

    it("OnEditMeeting", function () {
        var mock = sinon.mock(rtb);
        mock.expects("setText").once().withExactArgs("details");
        getController();
        $scope.$broadcast('editMeeting', defaultMeeting);
        expect($scope.meeting).to.be(defaultMeeting);
        expect($scope.errorMessage).to.be("");
        mock.verify();
    });

    it("OnAddMeeting", function () {
        getController();
        $scope.$broadcast('addMeeting');
        expect($scope.meeting).to.be(defaultMeeting);
        expect($scope.errorMessage).to.be("");
    });

    function CallAddMeetingSuccess(action) {
        var mockMeeting = sinon.mock(defaultMeeting);
        mockMeeting.expects("SetUser").once();
        var mockRtb = sinon.mock(rtb);
        mockRtb.expects("getText").once().returns("new text");
        var mockMeetingSvc = sinon.mock(meetingSvc);
        if (action == 'Added') {
            mockMeetingSvc.expects("notifyMeetingAdded").once();
        }
        $httpBackend.expectPOST('/api/restricted/AddMeeting', null).respond(200, { action: action });

        getController().AddMeeting();
        $httpBackend.flush();
        expect($scope.meeting.details).to.be("new text");
        expect($scope.errorMessage).to.be("");
        mockMeeting.verify();
        mockRtb.verify();
        mockMeetingSvc.verify();
    }

    it("AddMeetingSuccess", function () {
        CallAddMeetingSuccess('Added');
    });

    it("UpdateMeetingSuccess", function () {
        CallAddMeetingSuccess('Update');
    });

    it("AddMeetingFail", function () {
        var mockMeeting = sinon.mock(defaultMeeting);
        mockMeeting.expects("SetUser").once();
        var mockRtb = sinon.mock(rtb);
        mockRtb.expects("getText").once().returns("new text");
        $httpBackend.expectPOST('/api/restricted/AddMeeting', null).respond(404, "fail");

        getController().AddMeeting();
        $httpBackend.flush();
        expect($scope.errorMessage).to.be("fail");
        mockMeeting.verify();
        mockRtb.verify();
    });
});
//# sourceMappingURL=AddMeetingControllerTests.js.map

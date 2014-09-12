///ts:import=IMeetingControllerScope
import IMeetingControllerScope = require('../../Client/IMeetingControllerScope'); ///ts:import:generated
///ts:import=IMeetingSvc
import IMeetingSvc = require('../../Client/IMeetingSvc'); ///ts:import:generated
///ts:import=IUserSvc
import IUserSvc = require('../../Client/IUserSvc'); ///ts:import:generated
///ts:import=AddMeetingController
import AddMeetingController = require('../../Client/AddMeetingController'); ///ts:import:generated
///ts:import=Browser
import Browser = require('../../Client/Impl/Browser'); ///ts:import:generated


describe("AddMeetingController", function () {
    var $httpBackend: ng.IHttpBackendService;
    var $http: ng.IHttpService;
    var $scope: IMeetingControllerScope;
    var meetingSvc: IMeetingSvc;
    var userSvc: IUserSvc;
    var defaultMeeting;
    var rtb: Browser.IRichTextEditor;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
            defaultMeeting = { details: "details", SetUser: function (user) { }, GetData: function () { return null; } };
            $httpBackend = _$httpBackend_;
            $http = _$http_;
            expect($httpBackend).to.not.be(null);
            $scope = _$rootScope_.$new();
            meetingSvc = <IMeetingSvc>{ createMeeting: function () { return defaultMeeting }, notifyMeetingAdded: function (meeting) { } };
            rtb = <Browser.IRichTextEditor>{ setId: function (id) { }, setText: function (text) { }, getText: function () { return "text"; } };
            userSvc = <IUserSvc>{ getUser: function () { return "user"; } };
    }));

    afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function getController(): AddMeetingController {
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

    function CallAddMeetingSuccess(action: string) {
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
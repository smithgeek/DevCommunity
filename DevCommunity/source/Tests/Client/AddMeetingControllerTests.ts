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
    var rtb: Array<Browser.IRichTextEditor>;
    var rtbFactory: Browser.IRichTextEditorFactory;
    var rtbIndex;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        defaultMeeting = { details: "details", SetUser: function (user) { }, GetData: function () { return null; } };
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        expect($httpBackend).to.not.be(null);
        $scope = _$rootScope_.$new();
        meetingSvc = <IMeetingSvc>{ createMeeting: function () { return defaultMeeting }, notifyMeetingAdded: function (meeting) { } };
        rtb = [];
        for (var i = 0; i < 2; ++i) {
            rtb.push(<Browser.IRichTextEditor>{ setId: function (id) { }, setText: function (text) { }, getText: function () { return ""; } });
        }
        rtbIndex = 0;
        rtbFactory = <Browser.IRichTextEditorFactory>{ create: function (id): Browser.IRichTextEditor { return rtb[rtbIndex++]; } };
        userSvc = <IUserSvc>{ getUser: function () { return "user"; } };
    }));

    afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function getController(): AddMeetingController {
        return new AddMeetingController($scope, $http, meetingSvc, userSvc, rtbFactory);
    }

    it("DefaultConstructed", function () {
        var mock = sinon.mock(rtbFactory);
        mock.expects("create").once().withArgs('newIdeaDetails');
        getController();
        expect($scope.meeting).to.be(defaultMeeting);
        expect($scope.errorMessage).to.be("");
        expect($scope.sendEmail).to.be(false);
        expect($scope.schedMeetingMessage).to.be("");
        mock.verify();
    });

    it("OnEditMeeting", function () {
        var mock = sinon.mock(rtb[0]);
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

    function CallAddMeetingSuccess(action: string, expectSendEmail: boolean, expectedMessage: string = "", controller: AddMeetingController = getController()) {
        var mockMeeting = sinon.mock(defaultMeeting);
        mockMeeting.expects("SetUser").once();
        var mockRtb = sinon.mock(rtb[0]);
        mockRtb.expects("getText").once().returns("new text");
        var mockMeetingSvc = sinon.mock(meetingSvc);
        if (action == 'Added') {
            mockMeetingSvc.expects("notifyMeetingAdded").once();
        }
        $httpBackend.expectPOST('/api/restricted/AddMeeting', { meeting: null, sendEmail: expectSendEmail, message: expectedMessage }).respond(200, { action: action });

        controller.AddMeeting();
        $httpBackend.flush();
        expect($scope.meeting.details).to.be("new text");
        expect($scope.errorMessage).to.be("");
        mockMeeting.verify();
        mockRtb.verify();
        mockMeetingSvc.verify();
    }

    it("AddMeetingSuccess", function () {
        CallAddMeetingSuccess('Added', false);
    });

    it("AddMeetingSuccessAndSendEmail", function () {
        var controller = getController();
        $scope.sendEmail = true;
        CallAddMeetingSuccess('Added', true, "", controller);
    });

    it("AddMeetingAndSendEmailWithMessage", function () {
        var controller = getController();
        $scope.sendEmail = true;
        $scope.schedMeetingMessage = "sample message";
        CallAddMeetingSuccess('Added', true, "sample message", controller);
    });

    it("UpdateMeetingSuccess", function () {
        CallAddMeetingSuccess('Update', false);
    });

    it("AddMeetingFail", function () {
        var mockMeeting = sinon.mock(defaultMeeting);
        mockMeeting.expects("SetUser").once();
        var mockRtb = sinon.mock(rtb[0]);
        mockRtb.expects("getText").once().returns("new text");
        $httpBackend.expectPOST('/api/restricted/AddMeeting', { meeting: null, sendEmail: false, message: "" }).respond(404, "fail");

        getController().AddMeeting();
        $httpBackend.flush();
        expect($scope.errorMessage).to.be("fail");
        mockMeeting.verify();
        mockRtb.verify();
    });
});
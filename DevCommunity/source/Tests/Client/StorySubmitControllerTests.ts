///ts:import=IStorySubmitControllerScope
import IStorySubmitControllerScope = require('../../Client/IStorySubmitControllerScope'); ///ts:import:generated
///ts:import=IStorySvc
import IStorySvc = require('../../Client/IStorySvc'); ///ts:import:generated
///ts:import=IUserSvc
import IUserSvc = require('../../Client/IUserSvc'); ///ts:import:generated
///ts:import=StorySubmitController
import StorySubmitController = require('../../Client/StorySubmitController'); ///ts:import:generated
///ts:import=Browser
import Browser = require('../../Client/Impl/Browser'); ///ts:import:generated

describe("StorySubmitController", function () {
    var $httpBackend: ng.IHttpBackendService;
    var $http: ng.IHttpService;
    var $scope: IStorySubmitControllerScope;
    var storySvc: IStorySvc;
    var userSvc: IUserSvc;
    var rtb: Browser.IRichTextEditor;
    var defaultStory;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        defaultStory = { description: "details"};
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $scope = _$rootScope_.$new();
        storySvc = <IStorySvc>{ notifyStoryAdded: function (story) { } };
        rtb = <Browser.IRichTextEditor>{ setId: function (id) { }, setText: function (text) { }, getText: function () { return "text"; }, initEditor: function () { } };
        userSvc = <IUserSvc>{ getUser: function () { return "user"; } };
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function getController(): StorySubmitController {
        return new StorySubmitController($scope, storySvc, $http, userSvc, rtb);
    }

    it("DefaultConstructed", function () {
        var mockRtb = sinon.mock(rtb);
        mockRtb.expects("setId").once().withExactArgs("storyDetails");
        getController();
        expect($scope.story).to.not.be(null);
        expect($scope.errorMessage).to.be("");
    });

    it("OnEditStory", function () {
        var mock = sinon.mock(rtb);
        mock.expects("setText").once().withExactArgs("details");
        getController();
        $scope.$broadcast('editStory', defaultStory);
        expect($scope.story).to.be(defaultStory);
        expect($scope.errorMessage).to.be("");
        mock.verify();
    });

    it("OnAddStory", function () {
        getController();
        var mock = sinon.mock(rtb);
        mock.expects("setText").once().withExactArgs("");
        $scope.$broadcast('addStory');
        expect($scope.story).to.eql({});
        expect($scope.errorMessage).to.be("");
    });

    function CallSubmitSuccess(action: string) {
        var mockRtb = sinon.mock(rtb);
        mockRtb.expects("getText").once().returns("new text");
        var mockStorySvc = sinon.mock(storySvc);
        if (action == 'Added') {
            mockStorySvc.expects("notifyStoryAdded").once();
        }
        $httpBackend.expectPOST('/api/restricted/AddStory', { submittor: "user", description: "new text" }).respond(200, { action: action });

        getController().Submit();
        $httpBackend.flush();
        expect($scope.errorMessage).to.be("");
        mockRtb.verify();
        mockStorySvc.verify();
    }

    it("AddMeetingSuccess", function () {
        CallSubmitSuccess('Added');
    });

    it("UpdateMeetingSuccess", function () {
        CallSubmitSuccess('Update');
    });

    it("AddMeetingFail", function () {
        var mockRtb = sinon.mock(rtb);
        mockRtb.expects("getText").once().returns("new text");
        $httpBackend.expectPOST('/api/restricted/AddStory', { submittor: "user", description: "new text" }).respond(404, "fail");

        getController().Submit();
        $httpBackend.flush();
        expect($scope.errorMessage).to.be("fail");
        mockRtb.verify();
    });
});
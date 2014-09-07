/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../typings/sinon/sinon.d.ts" />
/// <reference path="../../server/public/assets/js/StoryController.ts" />

describe("StoryController", function () {
    var $httpBackend: ng.IHttpBackendService;
    var $http: ng.IHttpService;
    var $scope: StoryControllerScope;
    var storySvc: IStorySvc;
    var userSvc: IUserSvc;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $scope = _$rootScope_.$new();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function getController(): StoryController {
        $httpBackend.expectGET('/api/GetStories').respond(401);
        var controller: StoryController = new StoryController($scope, $http, userSvc, storySvc);
        $httpBackend.flush();
        return controller;
    }

    it("CannotGetStories", function () {
        var controller: StoryController = getController();
        expect($scope.stories).to.be.empty();
    });

    it("CanGetStories", function () {
        $httpBackend.expectGET('/api/GetStories').respond(200, [new Story(), new Story()]);
        var controller: StoryController = new StoryController($scope, $http, userSvc, storySvc);
        $httpBackend.flush();
        expect($scope.stories.length).to.be(2);
    });

    it("UserAddsStory", function () {
        var controller: StoryController = getController();
        $scope.$broadcast('storyAdded', null);
        expect($scope.stories.length).to.be(1);
    });

    it("TrySubmitStoryWhenNotLoggedIn", function () {
        userSvc = <IUserSvc>{ isLoggedIn: function () { return false; } };
        storySvc = <IStorySvc>{ notifyAddStory: function () { } };
        var mockStorySvc = sinon.mock(storySvc);
        mockStorySvc.expects("notifyAddStory").never();
        var controller: StoryController = getController();
        controller.SubmitStory();
    });

    it("TrySubmitStoryWhenLoggedIn", function () {
        userSvc = <IUserSvc>{ isLoggedIn: function () { return true; } };
        storySvc = <IStorySvc>{ notifyAddStory: function () { } };
        var mockStorySvc = sinon.mock(storySvc);
        mockStorySvc.expects("notifyAddStory").once();
        var controller: StoryController = getController();
        controller.SubmitStory();
    });

    it("EditStory", function () {
        storySvc = <IStorySvc>{ notifyEditStory: function (story) { } };
        var mockStorySvc = sinon.mock(storySvc);
        mockStorySvc.expects("notifyEditStory").once();
        var controller: StoryController = getController();
        controller.EditStory(null);
    });

    it("IsUserSubmittedStory", function () {
        var user = "fake_user";
        userSvc = <IUserSvc>{ getUser: function () { return user; } };
        var controller: StoryController = getController();
        var story: Story = new Story();
        story.submittor = user;
        expect(controller.isUserSubmittor(story)).to.be(true);
    });

    it("IsNotUserSubmittedStory", function () {
        var user = "fake_user";
        userSvc = <IUserSvc>{ getUser: function () { return "other"; } };
        var controller: StoryController = getController();
        var story: Story = new Story();
        story.submittor = user;
        expect(controller.isUserSubmittor(story)).to.be(false);
    });

    it("IsNotUserSubmittedStoryIfSubmittorIsEmpty", function () {
        var user = "fake_user";
        userSvc = <IUserSvc>{ getUser: function () { return "other"; } };
        var controller: StoryController = getController();
        var story: Story = new Story();
        story.submittor = "";
        expect(controller.isUserSubmittor(story)).to.be(false);
    });

    it("GetHumanTime", function () {
        var controller: StoryController = getController();
        var story: Story = new Story();
        story.timestamp = 1409420114;
        expect(controller.getHumanTime(story)).to.be("1/17/1970");
    });
});
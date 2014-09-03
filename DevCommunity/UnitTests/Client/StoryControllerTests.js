/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../typings/sinon/sinon.d.ts" />
/// <reference path="../../public/assets/js/StoryController.ts" />
describe("StoryController", function () {
    var $httpBackend;
    var $http;
    var $scope;
    var storySvc;
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
        $httpBackend.expectGET('/api/GetStories').respond(401);
        var controller = new StoryController($scope, $http, userSvc, storySvc);
        $httpBackend.flush();
        return controller;
    }

    it("CannotGetStories", function () {
        var controller = getController();
        expect($scope.stories).to.be.empty();
    });

    it("CanGetStories", function () {
        $httpBackend.expectGET('/api/GetStories').respond(200, [new Story(), new Story()]);
        var controller = new StoryController($scope, $http, userSvc, storySvc);
        $httpBackend.flush();
        expect($scope.stories.length).to.be(2);
    });

    it("UserAddsStory", function () {
        var controller = getController();
        $scope.$broadcast('storyAdded', null);
        expect($scope.stories.length).to.be(1);
    });

    it("TrySubmitStoryWhenNotLoggedIn", function () {
        userSvc = { isLoggedIn: function () {
                return false;
            } };
        storySvc = { notifyAddStory: function () {
            } };
        var mockStorySvc = sinon.mock(storySvc);
        mockStorySvc.expects("notifyAddStory").never();
        var controller = getController();
        controller.SubmitStory();
    });

    it("TrySubmitStoryWhenLoggedIn", function () {
        userSvc = { isLoggedIn: function () {
                return true;
            } };
        storySvc = { notifyAddStory: function () {
            } };
        var mockStorySvc = sinon.mock(storySvc);
        mockStorySvc.expects("notifyAddStory").once();
        var controller = getController();
        controller.SubmitStory();
    });

    it("EditStory", function () {
        storySvc = { notifyEditStory: function (story) {
            } };
        var mockStorySvc = sinon.mock(storySvc);
        mockStorySvc.expects("notifyEditStory").once();
        var controller = getController();
        controller.EditStory(null);
    });

    it("IsUserSubmittedStory", function () {
        var user = "fake_user";
        userSvc = { getUser: function () {
                return user;
            } };
        var controller = getController();
        var story = new Story();
        story.submittor = user;
        expect(controller.isUserSubmittor(story)).to.be(true);
    });

    it("IsNotUserSubmittedStory", function () {
        var user = "fake_user";
        userSvc = { getUser: function () {
                return "other";
            } };
        var controller = getController();
        var story = new Story();
        story.submittor = user;
        expect(controller.isUserSubmittor(story)).to.be(false);
    });

    it("IsNotUserSubmittedStoryIfSubmittorIsEmpty", function () {
        var user = "fake_user";
        userSvc = { getUser: function () {
                return "other";
            } };
        var controller = getController();
        var story = new Story();
        story.submittor = "";
        expect(controller.isUserSubmittor(story)).to.be(false);
    });

    it("GetHumanTime", function () {
        var controller = getController();
        var story = new Story();
        story.timestamp = 1409420114;
        expect(controller.getHumanTime(story)).to.be("1/17/1970");
    });
});
//# sourceMappingURL=StoryControllerTests.js.map

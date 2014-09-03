/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../typings/sinon/sinon.d.ts" />
/// <reference path="../../public/assets/js/Services.ts" />
var defaultUserEmail = 'me@someplace.com';

function getUserSvc(storage) {
    return new UserSvc(storage);
}

function getUserSvcWithoutKey() {
    return getUserSvc({ get: function (key) {
            return null;
        } });
}

function getUserSvcWithKey() {
    return getUserSvc({ get: function (key) {
            return { email: defaultUserEmail };
        } });
}

describe("UserService", function () {
    it("EmailNotInLocalStorage", function () {
        expect(getUserSvcWithoutKey().getUser()).to.be.empty();
    });

    it("EmailInLocalStorage", function () {
        expect(getUserSvcWithKey().getUser()).to.equal('me@someplace.com');
    });

    it("UserLoggedIn", function () {
        expect(getUserSvcWithKey().isLoggedIn()).to.equal(true);
    });

    it("UserNotLoggedIn", function () {
        expect(getUserSvcWithoutKey().isLoggedIn()).to.equal(false);
    });

    it("UserLogsOut", function () {
        var count = 0;
        var localStorage = {
            clearAll: function () {
                count++;
            }
        };
        getUserSvc(localStorage).logOut();
        expect(count).to.equal(1);
    });
});

describe("Meeting", function () {
    var $httpBackend;
    var $http;

    beforeEach(inject(function (_$httpBackend_, _$http_) {
        $httpBackend = _$httpBackend_;
        $http = _$http_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("EmptyMeeting", function () {
        var meeting = new MeetingData();
        expect(meeting.votes).to.eql([]);
        expect(meeting.vote_count).to.equal(0);
        expect(meeting._id).to.equal("");
        expect(meeting.email).to.equal("");
        expect(meeting.description).to.equal("");
        expect(meeting.details).to.equal("");
        expect(meeting.date).to.not.be.ok;
    });

    it("MeetingConstructed", function () {
        var meeting = new MeetingData(['a', 'b'], 'id', 2, 'email', 'description', 'details', new Date(1));
        expect(meeting.votes).to.eql(['a', 'b']);
        expect(meeting.vote_count).to.equal(2);
        expect(meeting._id).to.equal('id');
        expect(meeting.email).to.equal("email");
        expect(meeting.description).to.equal("description");
        expect(meeting.details).to.equal("details");
        expect(meeting.date).to.eql(new Date(1));
    });

    function getMeeting(userService) {
        var svc = userService && userService || getUserSvcWithKey();
        return new Meeting(svc, $http, new MeetingData());
    }

    it("SetMeetingUser", function () {
        var meeting = getMeeting();
        meeting.SetUser('me');
        expect(meeting.email).to.equal('me');
    });

    it("UserHasNotVoted", function () {
        expect(getMeeting().HasUserVoted()).to.equal(false);
    });

    it("UserHasVoted", function () {
        var meeting = getMeeting();
        meeting.votes.push(defaultUserEmail);
        expect(meeting.HasUserVoted()).to.equal(true);
    });

    it("UserIsNotAuthor", function () {
        expect(getMeeting().isUserAuthor()).to.equal(false);
    });

    it("UserIsAuthor", function () {
        var meeting = getMeeting();
        meeting.SetUser(defaultUserEmail);
        expect(meeting.isUserAuthor()).to.equal(true);
    });

    it("CanVote", function () {
        $httpBackend.expectPOST('/api/restricted/Vote', meeting).respond(200, meeting);
        var meeting = getMeeting();
        meeting.Vote();
        $httpBackend.flush();
        expect(meeting.votes).to.eql([defaultUserEmail]);
        expect(meeting.vote_count).to.equal(1);
    });

    it("CannotVote", function () {
        var serviceApi = getUserSvcWithKey();
        var mock = sinon.mock(serviceApi);
        mock.expects("logOut").once();

        $httpBackend.expectPOST('/api/restricted/Vote').respond(401);
        var meeting = getMeeting(serviceApi);
        meeting.Vote();
        $httpBackend.flush();
        expect(meeting.vote_count).to.equal(0);

        mock.verify();
    });

    it("CanRemoveVote", function () {
        $httpBackend.expectPOST('/api/restricted/Vote', meeting).respond(200, meeting);
        var meeting = getMeeting();
        meeting.votes.push(defaultUserEmail);
        meeting.vote_count = 1;
        meeting.RemoveVote();
        $httpBackend.flush();
        expect(meeting.votes).to.eql([]);
        expect(meeting.vote_count).to.equal(0);
    });

    it("CannoRemovetVote", function () {
        var serviceApi = getUserSvcWithKey();
        var mock = sinon.mock(serviceApi);
        mock.expects("logOut").once();

        $httpBackend.expectPOST('/api/restricted/Vote').respond(401);
        var meeting = getMeeting(serviceApi);
        meeting.votes.push(defaultUserEmail);
        meeting.vote_count = 1;
        meeting.RemoveVote();
        $httpBackend.flush();
        expect(meeting.votes).to.eql([defaultUserEmail]);
        expect(meeting.vote_count).to.equal(1);

        mock.verify();
    });

    it("CanGetMeetingData", function () {
        var meeting = getMeeting();
        meeting.details = 'some details';
        var data = meeting.GetData();
        expect(data.details).to.be.equal(meeting.details);
        meeting.details = 'new details';
        expect(data.details).to.not.be.equal(meeting.details);
    });
});

describe("MeetingSvc", function () {
    var mockUserService;
    var $httpBackend;
    var $http;
    var $rootscope;
    var meetingSvc;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $rootscope = _$rootScope_;
        var serviceApi = getUserSvcWithKey();
        mockUserService = sinon.mock(serviceApi);
        meetingSvc = new MeetingSvc(mockUserService, $http, $rootscope);
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function getMeeting(userService) {
        var svc = userService && userService || getUserSvcWithKey();
        var meeting = new Meeting(svc, $http, new MeetingData());
        meeting._id = '33';
        return meeting;
    }

    it("CanNotifyMeetingAdded", function () {
        var meeting = getMeeting();
        var count = 0;
        $rootscope.$on(("meetingAdded"), function (e, m) {
            count++;
            expect(m._id).to.equal('33');
        });

        meetingSvc.notifyMeetingAdded(meeting);
        expect(count).to.be(1);
    });

    it("CanNotifyMeetingAddedWithNoData", function () {
        var meeting = getMeeting();
        var count = 0;
        $rootscope.$on(("meetingAdded"), function (e, m) {
            count++;
            expect(m).to.be.ok;
        });

        meetingSvc.notifyMeetingAdded(null);
        expect(count).to.be(1);
    });

    it("CanNotifyAddMeeting", function () {
        var meeting = getMeeting();
        var count = 0;
        $rootscope.$on(("addMeeting"), function () {
            count++;
        });

        meetingSvc.notifyAddMeeting();
        expect(count).to.be(1);
    });

    it("CanNotifyEditMeeting", function () {
        var meeting = getMeeting();
        var count = 0;
        $rootscope.$on(("editMeeting"), function (e, m) {
            count++;
            expect(m._id).to.equal('33');
        });

        meetingSvc.notifyEditMeeting(meeting);
        expect(count).to.be(1);
    });
});

describe("StorySvc", function () {
    var $rootscope;
    var storySvc;

    beforeEach(inject(function (_$rootScope_) {
        $rootscope = _$rootScope_;
        storySvc = new StorySvc($rootscope);
    }));

    it("CanNotifyStoryAdded", function () {
        var story = new Story();
        story._id = '33';
        var count = 0;
        $rootscope.$on(("storyAdded"), function (e, s) {
            count++;
            expect(s._id).to.equal('33');
        });

        storySvc.notifyStoryAdded(story);
        expect(count).to.be(1);
    });

    it("CanNotifyAddStory", function () {
        var count = 0;
        $rootscope.$on(("addStory"), function (e, s) {
            count++;
        });

        storySvc.notifyAddStory();
        expect(count).to.be(1);
    });

    it("CanNotifyEditStory", function () {
        var story = new Story();
        story._id = '33';
        var count = 0;
        $rootscope.$on(("editStory"), function (e, s) {
            count++;
            expect(s._id).to.equal('33');
        });

        storySvc.notifyEditStory(story);
        expect(count).to.be(1);
    });
});
//# sourceMappingURL=ServiceTests.js.map

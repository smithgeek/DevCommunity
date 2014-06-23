/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/expect.js/expect.js.d.ts" />
/// <reference path="../public/assets/js/Services.ts" />

var defaultUserEmail = 'me@someplace.com';

function getUserSvc(storage) {
    return new UserSvc(storage);
}

function getUserSvcWithoutKey() {
    return getUserSvc({ get: function (key) { return null; } });
}

function getUserSvcWithKey() {
    return getUserSvc({ get: function (key) { return { email: defaultUserEmail }; } });
}

describe("UserService", function () {
    it("EmailNotInLocalStorage", function () {
        expect(getUserSvcWithoutKey().getUser()).to.be.empty();
    });

    it("EmailInLocalStorage", function () {
        expect(getUserSvcWithKey().getUser()).to.equal('me@someplace.com');
    });

    it("UserLoggedIn", function () {
        expect(getUserSvcWithKey().isLoggedIn()).to.equal( true);
    });

    it("UserNotLoggedIn", function () {
        expect(getUserSvcWithoutKey().isLoggedIn()).to.equal( false);
    });

    it("UserLogsOut", function () {
        var count = 0;
        var localStorage = {
            clearAll: function () {
                count++;
            }
        };
        getUserSvc(localStorage).logOut()
        expect(count).to.equal( 1);
    });
});

describe("UserService", function () {
    it("EmptyMeeting", function () {
        var meeting: MeetingData = new MeetingData();
        expect(meeting.votes).to.eql( []);
        expect(meeting.vote_count).to.equal( 0);
        expect(meeting._id).to.equal( "");
        expect(meeting.email).to.equal( "");
        expect(meeting.description).to.equal( "");
        expect(meeting.details).to.equal( "");
    });

    it("MeetingConstructed", function () {
        var meeting: MeetingData = new MeetingData(['a', 'b'], 'id', 2, 'email', 'description', 'details');
        expect(meeting.votes).to.eql( ['a', 'b']);
        expect(meeting.vote_count).to.equal( 2);
        expect(meeting._id).to.equal( 'id');
        expect(meeting.email).to.equal( "email");
        expect(meeting.description).to.equal( "description");
        expect(meeting.details).to.equal( "details");
    });

    function getMeeting(): Meeting {
        var http;
        return new Meeting(getUserSvcWithKey(), http, new MeetingData());
    }

    it("SetMeetingUser", function () {
        var meeting = getMeeting();
        meeting.SetUser('me');
        expect(meeting.email).to.equal( 'me');
    });

    it("UserHasNotVoted", function () {
        expect(getMeeting().HasUserVoted()).to.equal( false);
    });

    it("UserHasVoted", function () {
        var meeting = getMeeting();
        meeting.votes.push(defaultUserEmail);
        expect(meeting.HasUserVoted()).to.equal( true);
    });

    it("UserIsNotAuthor", function () {
        expect(getMeeting().isUserAuthor()).to.equal( false);
    });

    it("UserIsAuthor", function () {
        var meeting = getMeeting();
        meeting.SetUser(defaultUserEmail);
        expect(meeting.isUserAuthor()).to.equal( true);
    });
});
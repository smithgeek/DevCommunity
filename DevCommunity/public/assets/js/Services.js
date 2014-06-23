/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/bootstrap/bootstrap.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UserSvc = (function () {
    function UserSvc(localStorageService) {
        this.localStorageService = localStorageService;
    }
    UserSvc.prototype.getUser = function () {
        var email = this.localStorageService.get('userEmail');
        if (!email)
            return '';
        return email.email;
    };

    UserSvc.prototype.isLoggedIn = function () {
        if (this.localStorageService.get('userEmail'))
            return true;
        else
            return false;
    };

    UserSvc.prototype.logOut = function () {
        this.localStorageService.clearAll();
    };
    return UserSvc;
})();

var MeetingData = (function () {
    function MeetingData(votes, _id, vote_count, email, description, details) {
        this.votes = votes && votes || [];
        this._id = _id && _id || '';
        this.vote_count = vote_count && vote_count || 0;
        this.email = email && email || '';
        this.description = description && description || '';
        this.details = details && details || '';
    }
    return MeetingData;
})();

var Meeting = (function (_super) {
    __extends(Meeting, _super);
    function Meeting(userSvc, $http, data) {
        _super.call(this, data.votes, data._id, data.vote_count, data.email, data.description, data.details);
        this.userSvc = userSvc;
        this.$http = $http;
    }
    Meeting.prototype.SetUser = function (email) {
        this.email = email;
    };

    Meeting.prototype.HasUserVoted = function () {
        return -1 != $.inArray(this.userSvc.getUser(), this.votes);
    };

    Meeting.prototype.isUserAuthor = function () {
        return this.userSvc.getUser() == this.email;
    };

    Meeting.prototype.Vote = function () {
        var _this = this;
        $('.vote-btn-' + this._id).prop('disabled', true);
        var copiedMeeting = angular.copy(this);
        copiedMeeting.votes.push(this.userSvc.getUser());
        copiedMeeting.vote_count++;
        this.$http.post('/api/restricted/Vote', copiedMeeting).success(function (data) {
            _this.votes = copiedMeeting.votes;
            _this.vote_count = copiedMeeting.vote_count;
            $('.vote-btn-' + _this._id).prop('disabled', false);
        }).error(function (data) {
            $('#LoginModal').modal('show');
            $('.vote-btn-' + _this._id).prop('disabled', false);
        });
    };

    Meeting.prototype.RemoveVote = function () {
        var _this = this;
        $('.vote-btn-' + this._id).prop('disabled', true);
        var copiedMeeting = angular.copy(this);
        copiedMeeting.votes.splice($.inArray(this.userSvc.getUser(), copiedMeeting.votes), 1);
        copiedMeeting.vote_count--;
        this.$http.post('/api/restricted/Vote', copiedMeeting).success(function (data) {
            _this.votes = copiedMeeting.votes;
            _this.vote_count = copiedMeeting.vote_count;
            $('.vote-btn-' + _this._id).prop('disabled', false);
        }).error(function (data) {
            $('#LoginModal').modal('show');
            $('.vote-btn-' + _this._id).prop('disabled', false);
        });
    };

    Meeting.prototype.GetData = function () {
        return new MeetingData(this.votes, this._id, this.vote_count, this.email, this.description, this.details);
    };
    return Meeting;
})(MeetingData);

var MeetingSvc = (function () {
    function MeetingSvc(userSvc, $http, $rootScope) {
        this.userSvc = userSvc;
        this.$http = $http;
        this.$rootScope = $rootScope;
    }
    MeetingSvc.prototype.notifyMeetingAdded = function (meeting) {
        this.$rootScope.$broadcast('meetingAdded', this.createMeeting(meeting));
    };

    MeetingSvc.prototype.createMeeting = function (data) {
        return new Meeting(this.userSvc, this.$http, data && data || new MeetingData());
    };

    MeetingSvc.prototype.notifyEditMeeting = function (meeting) {
        this.$rootScope.$broadcast('editMeeting', meeting);
    };

    MeetingSvc.prototype.notifyAddMeeting = function () {
        this.$rootScope.$broadcast('addMeeting');
    };
    return MeetingSvc;
})();

var StorySvc = (function () {
    function StorySvc($rootScope) {
        this.$rootScope = $rootScope;
    }
    StorySvc.prototype.notifyStoryAdded = function (story) {
        this.$rootScope.$broadcast('storyAdded', story);
    };

    StorySvc.prototype.notifyAddStory = function () {
        this.$rootScope.$broadcast('addStory');
    };

    StorySvc.prototype.notifyEditStory = function (story) {
        this.$rootScope.$broadcast('editStory', story);
    };
    return StorySvc;
})();
//# sourceMappingURL=Services.js.map

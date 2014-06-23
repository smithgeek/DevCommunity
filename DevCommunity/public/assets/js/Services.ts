/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/bootstrap/bootstrap.d.ts" />

class UserSvc {
    constructor(private localStorageService) {
    }

    public getUser(): string {
        var email = this.localStorageService.get('userEmail');
        if (!email)
            return '';
        return email.email;
    }

    public isLoggedIn(): boolean {
        if (this.localStorageService.get('userEmail'))
            return true;
        else
            return false;
    }

    public logOut(): void {
        this.localStorageService.clearAll();
    }
}

class MeetingData {
    constructor(votes?: Array<string>, _id?: string, vote_count?: number, email?: string, description?: string, details?: string) {
        this.votes = votes && votes || [];
        this._id = _id && _id || '';
        this.vote_count = vote_count && vote_count || 0;
        this.email = email && email || '';
        this.description = description && description || '';
        this.details = details && details || '';
    }

    votes: Array<string>;
    _id: string;
    vote_count: number;
    email: string;
    description: string;
    details: string;
}

class Meeting extends MeetingData {
    constructor(private userSvc: UserSvc, private $http: ng.IHttpService, data: MeetingData) {
        super(data.votes, data._id, data.vote_count, data.email, data.description, data.details);
    }

    public SetUser(email: string): void {
        this.email = email;
    }

    public HasUserVoted(): boolean {
        return -1 != $.inArray(this.userSvc.getUser(), this.votes);
    }

    public isUserAuthor(): boolean {
        return this.userSvc.getUser() == this.email;
    }

    public Vote(): void {
        $('.vote-btn-' + this._id).prop('disabled', true);
        var copiedMeeting: Meeting = angular.copy(this);
        copiedMeeting.votes.push(this.userSvc.getUser());
        copiedMeeting.vote_count++;
        this.$http.post('/api/restricted/Vote', copiedMeeting).success((data) => {
            this.votes = copiedMeeting.votes;
            this.vote_count = copiedMeeting.vote_count;
            $('.vote-btn-' + this._id).prop('disabled', false);
        }).error((data) => {
                $('#LoginModal').modal('show');
                $('.vote-btn-' + this._id).prop('disabled', false);
            });
    }

    public RemoveVote(): void {
        $('.vote-btn-' + this._id).prop('disabled', true);
        var copiedMeeting = angular.copy(this);
        copiedMeeting.votes.splice($.inArray(this.userSvc.getUser(), copiedMeeting.votes), 1);
        copiedMeeting.vote_count--;
        this.$http.post('/api/restricted/Vote', copiedMeeting).success((data) => {
            this.votes = copiedMeeting.votes;
            this.vote_count = copiedMeeting.vote_count;
            $('.vote-btn-' + this._id).prop('disabled', false);
        }).error((data) => {
                $('#LoginModal').modal('show');
                $('.vote-btn-' + this._id).prop('disabled', false);
            });
    }

    public GetData(): MeetingData {
        return new MeetingData(this.votes, this._id, this.vote_count, this.email, this.description, this.details);
    }
}

class MeetingSvc {
    constructor(private userSvc: UserSvc, private $http, private $rootScope) {
    }

    public notifyMeetingAdded(meeting: MeetingData): void {
        this.$rootScope.$broadcast('meetingAdded', this.createMeeting(meeting));
    }

    public createMeeting(data?: MeetingData): Meeting {
        return new Meeting(this.userSvc, this.$http, data && data || new MeetingData());
    }

    public notifyEditMeeting(meeting: Meeting): void {
        this.$rootScope.$broadcast('editMeeting', meeting);
    }

    public notifyAddMeeting(): void {
        this.$rootScope.$broadcast('addMeeting');
    }
}

class StorySvc {
    constructor(private $rootScope) {
    }

    public notifyStoryAdded(story: Story): void {
        this.$rootScope.$broadcast('storyAdded', story);
    }

    public notifyAddStory(): void {
        this.$rootScope.$broadcast('addStory');
    }

    public notifyEditStory(story: Story): void {
        this.$rootScope.$broadcast('editStory', story);
    }
}
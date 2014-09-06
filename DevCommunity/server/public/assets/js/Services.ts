/// <reference path="../../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../../typings/bootstrap/bootstrap.d.ts" />

interface IUserSvc {
    getUser(): string;

    isLoggedIn(): boolean;

    logOut(): void;
}

class UserSvc implements IUserSvc {
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
    constructor(votes?: Array<string>, _id?: string, vote_count?: number, email?: string,
        description?: string, details?: string, date?: Date) {
        this.votes = votes && votes || [];
        this._id = _id && _id || '';
        this.vote_count = vote_count && vote_count || 0;
        this.email = email && email || '';
        this.description = description && description || '';
        this.details = details && details || '';
        this.date = date && date || null;
    }

    votes: Array<string>;
    _id: string;
    vote_count: number;
    email: string;
    description: string;
    details: string;
    date: Date;
}

class Meeting extends MeetingData {
    constructor(private userSvc: UserSvc, private $http: ng.IHttpService, data: MeetingData) {
        super(data.votes, data._id, data.vote_count, data.email, data.description, data.details, data.date);
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
            this.userSvc.logOut();
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
            this.userSvc.logOut();
            $('#LoginModal').modal('show');
            $('.vote-btn-' + this._id).prop('disabled', false);
        });
    }

    public GetData(): MeetingData {
        return new MeetingData(this.votes, this._id, this.vote_count, this.email, this.description, this.details, this.date);
    }
}

interface IMeetingSvc{
    notifyMeetingAdded(meeting: MeetingData): void;

    createMeeting(data?: MeetingData): Meeting;

    notifyEditMeeting(meeting: Meeting): void;

    notifyAddMeeting(): void;
}

class MeetingSvc implements IMeetingSvc {
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

interface IStorySvc {
    notifyStoryAdded(story: Story): void;

    notifyAddStory(): void;

    notifyEditStory(story: Story): void;
}

class StorySvc implements IStorySvc {
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
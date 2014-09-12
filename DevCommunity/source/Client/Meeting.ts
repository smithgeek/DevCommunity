///ts:import=MeetingData
import MeetingData = require('../Common/MeetingData'); ///ts:import:generated
///ts:import=UserSvc
import UserSvc = require('./UserSvc'); ///ts:import:generated

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
export = Meeting;
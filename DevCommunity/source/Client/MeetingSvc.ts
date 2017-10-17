///ts:import=IMeetingSvc
import IMeetingSvc = require('./IMeetingSvc'); ///ts:import:generated
///ts:import=Meeting
import Meeting = require('./Meeting'); ///ts:import:generated
///ts:import=UserSvc
import UserSvc = require('./UserSvc'); ///ts:import:generated
///ts:import=MeetingData
import MeetingData = require('../Common/MeetingData'); ///ts:import:generated
///ts:import=app
import app = require('./app'); ///ts:import:generated

class MeetingSvc implements IMeetingSvc {
    constructor(private userSvc: UserSvc, private $http, private $rootScope) {
    }

    public notifyMeetingAdded(meeting: Meeting): void {
        this.$rootScope.$broadcast('meetingAdded', this.createMeeting(meeting));
    }

    public notifyMeetingDeleted(meeting: MeetingData): void{
        this.$rootScope.$broadcast('meetingDeleted', meeting);
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

angular.module(app.getModuleName()).service('meetingSvc', ['userSvc', '$http', '$rootScope', MeetingSvc]);

export = MeetingSvc;
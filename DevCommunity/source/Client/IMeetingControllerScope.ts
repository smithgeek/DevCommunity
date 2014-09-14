///ts:import=Meeting
import Meeting = require('./Meeting'); ///ts:import:generated

interface IMeetingControllerScope extends ng.IScope {
    meeting: Meeting;
    errorMessage: string;
    sendEmail: boolean;
    schedMeetingMessage: string;
}

export = IMeetingControllerScope;
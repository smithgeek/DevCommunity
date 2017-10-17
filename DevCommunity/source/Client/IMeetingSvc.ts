///ts:import=Meeting
import Meeting = require('./Meeting'); ///ts:import:generated
///ts:import=MeetingData
import MeetingData = require('../Common/MeetingData'); ///ts:import:generated

interface IMeetingSvc {
    notifyMeetingAdded(meeting: Meeting): void;

    notifyMeetingDeleted(meeting: MeetingData): void;

    createMeeting(data?: MeetingData): Meeting;

    notifyEditMeeting(meeting: Meeting): void;

    notifyAddMeeting(): void;
}
export = IMeetingSvc;
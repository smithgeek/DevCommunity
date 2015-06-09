///ts:import=MeetingData
import MeetingData = require('./MeetingData'); ///ts:import:generated
///ts:import=Story
import Story = require('./Story'); ///ts:import:generated

export interface Get {
    meetings: Array<MeetingData>;
    stories: Array<Story>;
    lastMeeting: MeetingData;
    server: string;
    date: string;
    file_name: string;
}

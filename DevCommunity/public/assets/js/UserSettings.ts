class UserSettings {
    constructor() {
        this.email = "";
        this.NewMeetingEmailNotification = false;
        this.NewStoryEmailNotification = false;
        this._id = "";
    }

    email: string;
    NewMeetingEmailNotification: boolean;
    NewStoryEmailNotification: boolean;
    _id: string;
}
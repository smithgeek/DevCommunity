///ts:import=UserSettings
import UserSettings = require('../../Common/UserSettings'); ///ts:import:generated

import assert = require('assert');

describe("UserSettings", function () {
    it("ConstructedWithDefaults", function () {
        var settings: UserSettings = new UserSettings();
        assert.equal("", settings.email, "email");
        assert.equal("", settings._id, "_id");
        assert.equal(true, settings.NewMeetingEmailNotification, "NewMeetingEmail");
        assert.equal(true, settings.NewStoryEmailNotification, "NewStoryEmail");
        assert.equal(true, settings.NewMeetingScheduledNotification, "New Meeting Scheduled");
    });
});
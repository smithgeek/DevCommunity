///ts:import=RestrictedApi
import RestrictedApi = require('../../Server/RestrictedApi'); ///ts:import:generated
///ts:import=UserSettingsRepository
import UserSettingsRepository = require('../../Server/UserSettingsRepository'); ///ts:import:generated
///ts:import=Database
import Database = require('../../Server/Database'); ///ts:import:generated
///ts:import=DevCommunityEmailer
import DevCommunityEmailer = require('../../Server/DevCommunityEmailer'); ///ts:import:generated
///ts:import=Logger
import Logger = require('../../Server/Logger'); ///ts:import:generated
///ts:import=Twitter
import Twitter = require('../../Server/Twitter'); ///ts:import:generated
///ts:import=UserSettings
import UserSettings = require('../../Common/UserSettings'); ///ts:import:generated
///ts:import=CommentRepository
import CommentRepository = require('../../Server/CommentRepository'); ///ts:import:generated

import assert = require('assert');

describe("RestrictedApiTests", () => {
    var api: RestrictedApi;
    var userSettingsRepo: UserSettingsRepository;
    var storyDb: Database;
    var randomTweetsDb: Database;
    var meetingIdeasDb: Database;
    var emailer: DevCommunityEmailer;
    var logger: Logger;
    var twitter: Twitter;
    var commentRepo: CommentRepository

    beforeEach(() => {
        userSettingsRepo = <UserSettingsRepository>{};
        emailer = <DevCommunityEmailer>{};
        api = new RestrictedApi(randomTweetsDb, twitter, userSettingsRepo, storyDb, meetingIdeasDb, emailer, logger, commentRepo);
    });

    it("SendMeetingScheduledToSubscribedUsers", (done) => {
        var message, meeting, response;

        userSettingsRepo.getMeetingScheduledSubscribers = (callback) => callback([new UserSettings('email')]);
        emailer.sendMeetingScheduledEmail = (msg, mtg, usrs) => {
            assert.equal(msg, message);
            assert.deepEqual(mtg, meeting);
            done();
        };
        
        api.emailUsersMeetingScheduled({ getEmail: () => { return ""; }, isAdmin: () => { return true; } }, message, meeting);
    });
});
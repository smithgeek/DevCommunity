///ts:import=UserSettingsRepository
import UserSettingsRepository = require('../../Server/UserSettingsRepository'); ///ts:import:generated
///ts:import=Database
import Database = require('../../Server/Database'); ///ts:import:generated
///ts:import=Logger
import Logger = require('../../Server/Logger'); ///ts:import:generated
///ts:import=NeDb
import NeDb = require('../../Server/NeDb'); ///ts:import:generated
///ts:import=UserSettings
import UserSettings = require('../../Common/UserSettings'); ///ts:import:generated

var sinon: SinonStatic = require('sinon');

import assert = require('assert');

describe("UserSettingsRepo", () => {
    var repo: UserSettingsRepository;
    var db: Database;
    var logger: Logger;

    beforeEach(() => {
        db = new NeDb('');
        logger = { log: function (s) { }, error: function (s) { }, verbose: function (s) { } };
        repo = new UserSettingsRepository(db, logger);
    });

    it("GetUsersWhoWantMeetingScheduledEmails", (done) => {
        db.insert(new UserSettings("email1", true, true, true), () => { });
        db.insert(new UserSettings("email2", true, true, false), () => { });
        repo.getMeetingScheduledSubscribers((users: Array<UserSettings>) => {
            assert.equal(users.length, 1);
            assert.equal(users[0].email, "email1");
            done();
        });
    });

    it("GetUsersWithNoPreferenceAndWantNewMeetingSubmittedEmails", (done) => {
        db.insert({ email: "email1", NewMeetingEmailNotification: true }, () => { });
        db.insert({ email: "email2", NewMeetingEmailNotification: false }, () => { });
        repo.getMeetingScheduledSubscribers((users: Array<UserSettings>) => {
            assert.equal(users.length, 1);
            assert.equal(users[0].email, "email1");
            done();
        });
    });

    it("AddUser", (done) => {
        var spy = sinon.spy(db, "insert");
        var user = new UserSettings();
        repo.addUser(user, (success) => {
            assert(success);
            assert(spy.calledOnce);
            assert.deepEqual(spy.getCall(0).args[0], user);
            done();
        });
    });

    it("GetUserSettings", (done) => {
        var settings: UserSettings = new UserSettings("email");
        db.insert(settings, () => { });
        repo.getUserSettings("email", (success: boolean, user: UserSettings) => {
            assert(success);
            assert.deepEqual(user, settings);
            done();
        });
    });

    it("FailToGetSettingsForInvalidUser", (done) => {
        repo.getUserSettings("email", (success: boolean, user: UserSettings) => {
            assert(!success);
            assert.equal(user, null);
            done();
        });
    });

});

///ts:import=Database
import Database = require('./Database'); ///ts:import:generated
///ts:import=Twitter
import Twitter = require('./Twitter'); ///ts:import:generated
///ts:import=UserSettingsRepository
import UserSettingsRepository = require('./UserSettingsRepository'); ///ts:import:generated
///ts:import=DevCommunityEmailer
import DevCommunityEmailer = require('./DevCommunityEmailer'); ///ts:import:generated
///ts:import=Visitor
import Visitor = require('./Visitor'); ///ts:import:generated
///ts:import=Logger
import Logger = require('./Logger'); ///ts:import:generated
///ts:import=UserSettings
import UserSettings = require('../Common/UserSettings'); ///ts:import:generated
///ts:import=Story
import Story = require('../Common/Story'); ///ts:import:generated
///ts:import=MeetingData
import MeetingData = require('../Common/MeetingData'); ///ts:import:generated
///ts:import=Site
import Site = require('../Common/Site'); ///ts:import:generated
///ts:import=RestartWriter
import RestartWriter = require('./RestartWriter'); ///ts:import:generated

import express = require('express');
import util = require('util');
import fs = require('fs');
var jade = require('jade');

class RestrictedApi {

    constructor(private randomTweetsDb: Database, private twitter: Twitter, private userSettingsRepo: UserSettingsRepository, private storyDb: Database,
        private meetingIdeasDb: Database, private emailer: DevCommunityEmailer, private logger: Logger) {
    }

    public addTweet(visitor: Visitor, twitterCode: string, res: express.Response): void {
        if (visitor.isAdmin()) {
            var embedCode: string = twitterCode.replace(/"/g, "'");

            this.randomTweetsDb.insert({ html: embedCode }, (err, newDoc) => {
                if (err != null) {
                    res.send(404, "Could not add tweet.");
                }
                else {
                    res.send(200, "Added tweet. " + newDoc._id);
                    this.twitter.tweetAdded();
                }
            });
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to add a tweet.");
        }
    }

    public addUser(visitor: Visitor, newUser: string, res: express.Response): void {
        if (visitor.isAdmin()) {
            this.userSettingsRepo.addUser(new UserSettings(newUser), (succes) => {
                if (succes)
                    res.send(404, "Could not add user " + newUser);
                else
                    res.send(200, "Added user " + newUser);
            });
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to add a user.");
        }
    }

    public setUserSettings(visitor: Visitor, settings: UserSettings, res: express.Response ): void {
        settings.email = visitor.getEmail();
        this.userSettingsRepo.updateUserSettings(settings.email, settings, (success) => {
            if (success)
                res.send(404, "Could not update");
            else
                res.send(200, { action: "Updated", settings: settings });
        });
    }

    public getUserSettings(visitor: Visitor, res: express.Response): void {
        this.userSettingsRepo.getUserSettings(visitor.getEmail(), (success: boolean, settings: UserSettings) => {
            if (success)
                res.send(200, settings);
            else
                res.send(404, "");
        });
    }

    public addStory(visitor: Visitor, story: Story, res: express.Response): void {
        story.submittor = visitor.getEmail();
        story.timestamp = Date.now();
        if (story._id == null || story._id == "") {
            this.storyDb.insert(story, (err, newDoc) => {
                if (err != null)
                    res.send(404, "Failure");
                else {
                    res.send(200, { action: "Added", story: newDoc });
                    this.emailer.sendNewStoryEmails(newDoc);
                }
            });
        }
        else {
            this.storyDb.update({ Query: { _id: story._id, submittor: visitor.getEmail() }, Update: { $set: { description: story.description, title: story.title, url: story.url } }, Options: {} }, (err, numReplaced) => {
                if (err != null || numReplaced < 1) {
                    res.send(404, "Could not update");
                }
                else
                    res.send(200, { action: "Updated", story: story });
            });
        }
    }

    public vote(visitor: Visitor, meetingId: number, res: express.Response): void {
        this.meetingIdeasDb.find({ Condition: { _id: meetingId } }, (err, meetings: MeetingData[]) => {
            if (err == null) {
                var meeting: MeetingData = meetings[0];
                if (-1 == meeting.votes.indexOf(visitor.getEmail())) {
                    meeting.vote_count++;
                    meeting.votes.push(visitor.getEmail());
                    this.logger.log('user ' + visitor.getEmail() + ' voted for ' + meeting.description);
                }
                else {
                    meeting.vote_count--;
                    meeting.votes.splice(meeting.votes.indexOf(visitor.getEmail()), 1);
                    this.logger.log('user ' + visitor.getEmail() + ' removed vote for ' + meeting.description);
                }
                this.meetingIdeasDb.update({ Query: { _id: meetingId }, Update: meeting, Options: {} }, function (err, newDoc) {
                    if (err != null)
                        res.send(404, "Failure");
                    else
                        res.send(200, "Success");
                });
            }
            else {
                res.send(404, "Failure");
            }
        });
    }

    public addMeeting(visitor: Visitor, meeting: MeetingData, res: express.Response): void {
        meeting.email = visitor.getEmail();
        if (meeting._id == "") {
            this.meetingIdeasDb.insert(meeting, (err, newDoc: MeetingData) => {
                if (err != null)
                    res.send(404, "Failure");
                else {
                    res.send(200, { action: "Added", meeting: newDoc });
                    if (newDoc.date == null) {
                        this.emailer.sendNewMeetingTopicEmails(newDoc);
                    }
                }
            });
        }
        else {
            var condition = { _id: meeting._id };
            if (!visitor.isAdmin()) {
                condition = { _id: meeting._id, email: visitor.getEmail() };
            }
            this.meetingIdeasDb.update({ Query: condition, Update: { $set: { description: meeting.description, details: meeting.details, date: meeting.date } }, Options: {} }, (err, numReplaced) => {
                if (err != null)
                    res.send(404, "Could not update");
                else
                    if (numReplaced > 0)
                        res.send(200, { action: "Updated", meeting: meeting });
                    else
                        res.send(404, "Could not update");
            });
        }
    }

    public emailUsersMeetingScheduled(message: string, meeting: MeetingData): void {
        this.userSettingsRepo.getMeetingScheduledSubscribers((users) => {
            this.emailer.sendMeetingScheduledEmail(message, meeting, users);
        });
    }

    public getSiteConfig(visitor: Visitor, config: Site.Config, res: express.Response): void {
        if (visitor.isAdmin()) {
            res.send(200, config);
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator get the site configuration.");
        }
    }

    public updateSiteConfig(visitor: Visitor, config: Site.Config, configPath: string, res: express.Response): void {
        if (visitor.isAdmin()) {
            config.server.isServerConfigured = true;
            fs.writeFile(configPath, JSON.stringify(config), (err) => {
                if (err == null) {
                    res.send(200, "Config Updated");
                    RestartWriter.writeRestartFile("restart requested");
                }
                else {
                    res.send(404, "Failure: " + err.message);
                }
            });
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator get the site configuration.");
        }
    }

    public getCarousel(visitor: Visitor, res: express.Response): void {
        if (visitor.isAdmin()) {
            fs.readFile('site/views/partials/HomeCarousel.jade', (err, buffer) => {
                res.send(200, buffer.toString());
            });
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to get the carousel.");
        }
    }

    public renderJade(visitor: Visitor, jadeText: string, res: express.Response): void {
        if (visitor.isAdmin()) {
            fs.readFile('site/views/partials/HomeCarousel.jade', (err, buffer) => {
                res.send(200, jade.render(jadeText));
            });
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to render some jade.");
        }
    }

    public saveHomeCarousel(visitor: Visitor, jadeText: string, res: express.Response): void {
        if (visitor.isAdmin()) {
            fs.writeFile('site/views/partials/HomeCarousel.jade', jadeText, {}, (err) => {
                if (err == null) {
                    res.send(200, "Carousel saved");
                }
                else {
                    res.send(400, "Error: " + err.message);
                }
            });
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to get the carousel.");
        }
    }
}
export = RestrictedApi;
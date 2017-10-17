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
///ts:import=CommentTransports
import CommentTransports = require('../Common/CommentTransports'); ///ts:import:generated
///ts:import=CommentRepository
import CommentRepository = require('./CommentRepository'); ///ts:import:generated
///ts:import=PrizeManager
import PrizeManager = require('./PrizeManager'); ///ts:import:generated
///ts:import=PrizeTransport
import PrizeTransport = require('../Common/PrizeTransport'); ///ts:import:generated
///ts:import=NewsletterTransport
import NewsletterTransport = require('../Common/NewsletterTransport'); ///ts:import:generated

import express = require('express');
import util = require('util');
import fs = require('fs');
var jade = require('jade');
var ogs = require('open-graph-scraper');

class RestrictedApi {

    constructor(private randomTweetsDb: Database, private twitter: Twitter, private userSettingsRepo: UserSettingsRepository, private storyDb: Database,
        private meetingIdeasDb: Database, private emailer: DevCommunityEmailer, private logger: Logger,
        private commentRepository: CommentRepository, private prizeManager: PrizeManager) {
    }

    public postComment(visitor: Visitor, data: CommentTransports.Post, res: express.Response): void {
        this.commentRepository.postComment(visitor, data, (success) => {
            if (success) {
                res.send(200, "Success");
            }
            else {
                res.send(404, "Failure");
            }
        });
    }

    public postCommentReply(visitor: Visitor, data: CommentTransports.PostReply, res: express.Response) {
        this.commentRepository.postCommentReply(visitor, data, (success) => {
            if (success) {
                res.send(200, "Success");
            }
            else {
                res.send(404, "Failure");
            }
        });
    }

    public editComment(visitor: Visitor, data: CommentTransports.Post, res: express.Response) {
        this.commentRepository.editComment(visitor, data, (success) => {
            if (success) {
                res.send(200, "Success");
            }
            else {
                res.send(404, "Failure");
            }
        });
    }

    public changeSubscription(visitor: Visitor, data: CommentTransports.Subscription, res: express.Response) {
        this.commentRepository.updateSubscription(visitor, data);
        res.send(200);
    }

    public visitComment(visitor: Visitor, data: CommentTransports.VisitComment, res: express.Response) {
        this.commentRepository.visitComment(visitor, data, (subscribed) => {
            res.send(200, subscribed);
        });
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
                res.send(200, { action: "Updated", settings: settings });
            else
                res.send(404, "Could not update");
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

    public getOpenGraphData(url: string, res: express.Response){
        ogs({url: decodeURIComponent(url)}, function(err, result){
            console.log(err);console.log(result);
            if(err)
                res.send(404, "Failure");
            else
                res.send(200, result);
        });
    }

    public rsvp(going: boolean, visitor: Visitor, meetingId: number, res: express.Response): void {
        this.meetingIdeasDb.find({ Condition: { _id: meetingId } }, (err, meetings: MeetingData[]) => {
            if (err == null) {
                var meeting: MeetingData = meetings[0];
                if (meeting.rsvp == null) meeting.rsvp = [];
                var userRsvpIndex = meeting.rsvp.indexOf(visitor.getEmail());
                var update: boolean = false;
                if (going && -1 == userRsvpIndex) {
                    meeting.rsvp.push(visitor.getEmail());
                    this.logger.log('user ' + visitor.getEmail() + ' is going to ' + meeting.description);
                    update = true;
                }
                else if(!going && -1 != userRsvpIndex)
                {
                    meeting.rsvp.splice(userRsvpIndex, 1);
                    this.logger.log('user ' + visitor.getEmail() + ' is not going to ' + meeting.description);
                    update = true;
                }
                if(update){
                    this.meetingIdeasDb.update({ Query: { _id: meetingId }, Update: meeting, Options: {} }, function (err, newDoc) {
                        if (err != null)
                            res.send(404, "Failure");
                        else
                            res.send(200, "Success");
                    });
                }
            }
            else {
                res.send(404, "Failure");
            }
        });
    }

    public deleteMeeting(visitor: Visitor, meeting: MeetingData, res: express.Response): void{
        this.meetingIdeasDb.find({ Condition: { _id: meeting._id } }, (err, meetings: MeetingData[]) => {
            if(err != null || meetings.length !== 1){
                res.send(400, "Could not find meeting to delete.")
            }
            else{
                if(meetings[0].email === visitor.getEmail() || visitor.isAdmin()){
                    if(visitor.isAdmin() || meetings[0].vote_count == 0){
                        this.meetingIdeasDb.remove({Condition: {_id: meeting._id}, Options: {}}, (err, count) => {
                            if(err === null){
                                res.send(200, "Meeting deleted.")
                            }
                            else{
                                console.error(err);
                                res.send(400, "Failure deleting meeting");
                            }
                        });
                    }
                    else{
                        res.send(403, "Only an admin can delete a meeting that has votes.");
                    }
                }
                else{
                    res.send(403, "You can't delete this meeting, stop it!");
                }
            }
        });
    }

    public addMeeting(visitor: Visitor, meeting: MeetingData, res: express.Response): void {
        if (meeting._id == "") {
            meeting.email = visitor.getEmail();
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
            var condition: any = { _id: meeting._id };
            var updatedValue: any = { description: meeting.description, details: meeting.details, date: meeting.date };
            if (!visitor.isAdmin()) {
                meeting.email = visitor.getEmail();
                condition = { _id: meeting._id, email: visitor.getEmail() };
                updatedValue = { description: meeting.description, details: meeting.details };
                this.meetingIdeasDb.find({ Condition: { _id: meeting._id } }, (err, meetings: MeetingData[]) => {
                    if(err != null || meetings.length !== 1) {
                        res.send(400, "Could not find meeting");
                    }
                    else if(meeting.vote_count > 0){
                        res.send(403, "Only an admin can edit a meeting once it has received votes.");
                    }
                    else{
                        this.updateMeeting(condition, updatedValue, meeting, res);
                    }
                });
            }
            else{
                this.updateMeeting(condition, updatedValue, meeting, res);
            }
        }
    }

    private updateMeeting(condition: any, updatedValue: any, meeting: MeetingData, res: express.Response){
        this.meetingIdeasDb.update({ Query: condition, Update: { $set: updatedValue }, Options: {} }, (err, numReplaced) => {
            if (err != null)
                res.send(404, "Could not update");
            else
                if (numReplaced > 0)
                    res.send(200, { action: "Updated", meeting: meeting });
                else
                    res.send(404, "Could not update");
        });
    }

    public emailUsersMeetingScheduled(visitor: Visitor, message: string, meeting: MeetingData): void {
        if (visitor.isAdmin()) {
            this.userSettingsRepo.getMeetingScheduledSubscribers((users) => {
                this.emailer.sendMeetingScheduledEmail(message, meeting, users);
            });
        }
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

    public renderNewsletter(visitor: Visitor, config: Site.Config, req: NewsletterTransport.Get, res: express.Response): void {
        if (visitor.isAdmin()) {
            fs.readFile('site/views/partials/NewsLetter_template.jade', (err, buffer) => {
                req.server = config.server.domain;
                var html = jade.render(buffer, req);
                fs.writeFile('site/public/assets/newsletter/' + req.file_name + '.html', html);
                res.send(200, html);
            });
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to render a newsletter.");
        }
    }

    public sendNewsletter(visitor: Visitor, req: NewsletterTransport.Get, res: express.Response): void {
        if (visitor.isAdmin()) {
            fs.readFile('site/public/assets/newsletter/' + req.file_name + '.html', (err, buffer) => {
                this.userSettingsRepo.getNewsletterSubscribers((users: Array<UserSettings>) => {
                    this.emailer.sendNewsletter(buffer.toString(), users);
                    res.send(200);
                });
            });
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to send a newsletter.");
        }
    }

    public getUsers(visitor: Visitor, res: express.Response): void {
        if (visitor.isAdmin()) {
            this.userSettingsRepo.getUsers((users: Array<UserSettings>) => {
                res.send(200, users);
            });
        }
        else {
            res.send(401, []);
        }
    }

    public deleteUser(visitor: Visitor, user: UserSettings, res: express.Response): void {
        if (visitor.isAdmin()) {
            this.userSettingsRepo.deleteUser(user, (success: boolean) => {
                if (success) {
                    res.send(200, "Success");
                }
                else {
                    res.send(404, "Failure");
                }
            });
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to delete users.");
        }
    }

    public sendAdminEmail(visitor: Visitor, subject: string, body: string, res: express.Response): void {
        if (visitor.isAdmin()) {
            this.userSettingsRepo.getAdminEmailSubscribers((users) => {
                this.emailer.sendAdminEmail(subject, body, users);
                res.send(200, "Success");
            });
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to send an email.");
        }
    }

    public openPrizeRegistration(visitor: Visitor, res: express.Response, io): void {
        if (visitor.isAdmin()) {
            this.prizeManager.openRegistration();
            res.send(200, "Registration Opened.");
            io.emit("Prize:RegistrationOpened");
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to do that.");
        }
    }

    public closePrizeRegistration(visitor: Visitor, res: express.Response, io): void {
        if (visitor.isAdmin()) {
            this.prizeManager.closeRegistration();
            res.send(200, "Registration closed.");
            io.emit("Prize:RegistrationClosed");
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to do that.");
        }
    }

    public pickWinner(visitor: Visitor, prize: string, res: express.Response, io): void {
        if (visitor.isAdmin()) {
            var winner = this.prizeManager.pickWinner(prize);
            res.send(200, winner);
            io.emit('Prize:WinnerSelected', winner);
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to do that.");
        }
    }

    public saveWinner(visitor: Visitor, email: string, prize: string, res: express.Response, io): void {
        if (visitor.isAdmin()) {
            this.prizeManager.saveWinner(email, prize);
            res.send(200, "Winner saved.");
            io.emit('Prize:WinnerSaved');
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to do that.");
        }
    }

    public clearPastWinner(visitor: Visitor, email: string, res: express.Response): void {
        if (visitor.isAdmin()) {
            this.prizeManager.clearPast(email);
            res.send(200, "Past winner cleared.");
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to do that.");
        }
    }

    public getPrizeEntries(visitor: Visitor, res: express.Response): void {
        if (visitor.isAdmin()) {
            res.send(200, <PrizeTransport.GetEntriesResponse>{ Entries: this.prizeManager.getEntries() });
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to do that.");
        }
    }

    public getPastWinners(visitor: Visitor, res: express.Response): void {
        if (visitor.isAdmin()) {
            res.send(200, <PrizeTransport.GetPastWinnersResponse>{ Winners: this.prizeManager.getPastWinners() });
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to do that.");
        }
    }

    public clearPrizeEntries(visitor: Visitor, res: express.Response): void {
        if (visitor.isAdmin()) {
            this.prizeManager.clearEntries();
            res.send(200, "Cleared entries");
        }
        else {
            res.send(401, "Who do you think you are?  You have to be an administrator to do that.");
        }
    }
}
export = RestrictedApi;
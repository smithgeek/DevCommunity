///ts:import=Twitter
import Twitter = require('./Twitter'); ///ts:import:generated
///ts:import=Database
import Database = require('./Database'); ///ts:import:generated
///ts:import=Visitor
import Visitor = require('./Visitor'); ///ts:import:generated
///ts:import=Story
import Story = require('../Common/Story'); ///ts:import:generated
///ts:import=MeetingData
import MeetingData = require('../Common/MeetingData'); ///ts:import:generated
///ts:import=Logger
import Logger = require('./Logger'); ///ts:import:generated
///ts:import=CommentTransports
import CommentTransports = require('../Common/CommentTransports'); ///ts:import:generated
///ts:import=CommentRepository
import CommentRepository = require('./CommentRepository'); ///ts:import:generated

import express = require('express');

class PublicApi {
    constructor(private twitter: Twitter, private storyDb: Database, private meetingIdeasDb: Database, private logger: Logger,
        private commentRepository: CommentRepository) {
    }

    public getComments(visitor: Visitor, data: CommentTransports.Get, res: express.Response) {
        this.commentRepository.getComments(data, (success, comments) => {
            if (success) {
                res.send(200, comments);
            }
            else {
                res.send(404, null);
            }
        });
    }

    public getRandomTweet(res: express.Response): void{
        this.twitter.getRandomTweet(function (html) {
            if (html == '') {
                res.send(401, '');
            }
            else {
                res.send(200, html);
            }
        });
    }

    public getStories(visitor: Visitor, res: express.Response): void {
        this.storyDb.find({ Condition: {}, Sort: { timestamp: -1 } }, (err, stories: Array<Story>) => {
            if (err == null) {
                var sendStories: Array<Story> = new Array<Story>();
                for (var i = 0; i < stories.length; ++i) {
                    sendStories.push(this.anonymizeStory(stories[i], visitor.getEmail()));
                }
                res.send(200, sendStories);
            }
            else {
                res.send(404, err);
            }
        });
    }

    public redirectUrl(url: string, res: express.Response): string {
        var redirect: string = url;
        if (redirect.substr(0, 4) != 'http') {
            redirect = 'http://' + redirect;
        }
        res.redirect(redirect);
        return redirect;
    }

    public getStoryById(id: number, visitor: Visitor, res: express.Response): void {
        this.storyDb.find({ Condition: { _id: id } }, (err, stories) => {
            if (err == null) {
                res.send(200, this.anonymizeStory(stories[0], visitor.getEmail()));
            }
            else {
                res.send(404, err);
            }
        });
    }

    public getMeetingById(id: number, visitor: Visitor, res: express.Response): void {
        this.meetingIdeasDb.find({ Condition: { _id: id } }, (err, meeting) => {
            if (err == null) {
                res.send(200, this.anonymizeMeeting(meeting[0], visitor.getEmail()));
            }
            else {
                res.send(404, err);
            }
        });
    }

    public getArhivedMeetings(visitor: Visitor, res: express.Response): void {
        this.getMeetings({ $and: [{ date: { $exists: true } }, { $not: { date: null } }] }, {}, visitor, res);
    }

    public getMeetingSuggestions(visitor: Visitor, res: express.Response): void {
        this.getMeetings({ $or: [{ date: { $exists: false } }, { date: null }] }, {}, visitor, res);
    }

    private getMeetings(condition, sort, visitor: Visitor, res: express.Response) {
        this.meetingIdeasDb.find({ Condition: condition, Sort: sort }, (err, suggestions: MeetingData[]) => {
            if (err == null) {
                suggestions.forEach((value: MeetingData, index: number, array: MeetingData[]) => {
                    this.anonymizeMeeting(value, visitor.getEmail());
                });
                res.send(200, suggestions);
            }
            else {
                res.send(404, err);
            }
        });
    }

    private anonymizeStory(story: Story, user: string): Story {
        if (story.submittor != user) {
            story.submittor = "";
        }
        return story;
    }

    private anonymizeMeeting(meeting: MeetingData, user: string): MeetingData {
        if (meeting.email != user) {
            meeting.email = "";
        }
        meeting.votes = meeting.votes.filter((value: string, index: number, array: string[]): boolean => {
            return value == user;
        });
        return meeting;
    }
}
export = PublicApi;

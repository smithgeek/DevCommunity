import Visitor = require('./Visitor');
import DB = require('./Database');
import HttpResponse = require('./HttpResponse');
import Twitter = require('./Twitter');
import DevCommunityEmailer = require('./DevCommunityEmailer');
import Logger = require('./Logger');

class RestrictedApi {

    constructor(private randomTweetsDb: DB.Database, private twitter: Twitter, private userSettingsDb: DB.Database, private storyDb: DB.Database, private meetingIdeasDb: DB.Database, private emailer: DevCommunityEmailer, private logger: Logger) {
    }

    public addTweet(visitor: Visitor, twitterCode: string, res: HttpResponse): void {
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
            res.send(404, "Who do you think you are?  You have to be an administrator to add a tweet.");
        }
    }

    public addUser(visitor: Visitor, newUser: string, res: HttpResponse): void {
        if (visitor.isAdmin()) {
            var settings = { email: newUser, NewMeetingEmailNotification: true, NewStoryEmailNotification: true };
            this.userSettingsDb.insert(settings, (err, newDoc) => {
                if (err != null)
                    res.send(404, "Could not add user " + newUser);
                else
                    res.send(200, "Added user " + newUser);
            });
        }
        else {
            res.send(404, "Who do you think you are?  You have to be an administrator to add a user.");
        }
    }

    public setUserSettings(visitor: Visitor, settings: UserSettings, res: HttpResponse ): void {
        settings.email = visitor.getEmail();
        this.userSettingsDb.update({
            Query: { email: settings.email },
            Update: {
                $set: {
                    NewMeetingEmailNotification: settings.NewMeetingEmailNotification,
                    NewStoryEmailNotification: settings.NewStoryEmailNotification
                }
            },
            Options: { upsert: true }
        }, (err, numReplaced) => {
            if (err != null || numReplaced < 1)
                res.send(404, "Could not update");
            else
                res.send(200, { action: "Updated", settings: settings });
        });
    }

    public getUserSettings(visitor: Visitor, res: HttpResponse): void {
        this.userSettingsDb.find({ Condition: { email: visitor.getEmail() } }, function (err, settings) {
            if (err == null)
                res.send(200, settings[0]);
            else
                res.send(404, err);
        });
    }

    public addStory(visitor: Visitor, story: Story, res: HttpResponse): void {
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
                if (err != null || numReplaced < 1)
                    res.send(404, "Could not update");
                else
                    res.send(200, { action: "Updated", story: story });
            });
        }
    }

    public vote(visitor: Visitor, meetingId: number, res: HttpResponse): void {
        this.meetingIdeasDb.find({ Condition: { _id: meetingId } }, (err, meetings: Meeting[]) => {
            if (err == null) {
                var meeting: Meeting = meetings[0];
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

    public addMeeting(visitor: Visitor, meeting: Meeting, res: HttpResponse): void {
        meeting.email = visitor.getEmail();
        if (meeting._id == "") {
            this.meetingIdeasDb.insert(meeting, (err, newDoc: Meeting) => {
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
}

export = RestrictedApi;

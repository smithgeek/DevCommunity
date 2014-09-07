import HttpResponse = require('./HttpResponse');
import Twitter = require('./Twitter');
import DB = require('./Database');
import Visitor = require('./Visitor');

class PublicApi {
    constructor(private twitter: Twitter, private storyDb: DB.Database, private meetingIdeasDb: DB.Database) {
    }
     
    public getRandomTweet(res: HttpResponse): void{
        this.twitter.getRandomTweet(function (html) {
            if (html == '') {
                res.send(401, '');
            }
            else {
                res.send(200, html);
            }
        });
    }

    public getStories(visitor: Visitor, res: HttpResponse): void {
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

    public redirectUrl(url: string, res: HttpResponse): string {
        var redirect: string = url;
        if (redirect.substr(0, 4) != 'http') {
            redirect = 'http://' + redirect;
        }
        res.redirect(redirect);
        return redirect;
    }

    public getStoryById(id: number, visitor: Visitor, res: HttpResponse): void {
        this.storyDb.find({ Condition: { _id: id } }, (err, stories) => {
            if (err == null) {
                res.send(200, this.anonymizeStory(stories[0], visitor.getEmail()));
            }
            else {
                res.send(404, err);
            }
        });
    }

    public getMeetingById(id: number, visitor: Visitor, res: HttpResponse): void {
        this.meetingIdeasDb.find({ Condition: { _id: id } }, (err, meeting) => {
            if (err == null) {
                res.send(200, this.anonymizeMeeting(meeting[0], visitor.getEmail()));
            }
            else {
                res.send(404, err);
            }
        });
    }

    public getArhivedMeetings(visitor: Visitor, res: HttpResponse): void {
        this.meetingIdeasDb.find({ Condition: { $and: [{ date: { $exists: true } }, { $not: { date: null } }] }, Sort: { date: -1 } }, (err, suggestions: Meeting[]) => {
            if (err == null) {
                suggestions.forEach((value: Meeting, index: number, array: Meeting[]) => {
                    this.anonymizeMeeting(value, visitor.getEmail());
                });
                res.send(200, suggestions);
            }
            else {
                res.send(404, err);
            }
        });
    }

    public getMeetingSuggestions(visitor: Visitor, res: HttpResponse): void {
        this.meetingIdeasDb.find({ Condition: { $or: [{ date: { $exists: false } }, { date: null }] }, Sort: { vote_count: -1 } }, (err, suggestions: Meeting[]) => {
            if (err == null) {
                suggestions.forEach((value: Meeting, index: number, array: Meeting[]) => {
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

    private anonymizeMeeting(meeting: Meeting, user: string): Meeting {
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
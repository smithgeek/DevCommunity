///ts:import=Database
import Database = require('./Database'); ///ts:import:generated
///ts:import=DevCommunityEmailer
import DevCommunityEmailer = require('./DevCommunityEmailer'); ///ts:import:generated
///ts:import=Logger
import Logger = require('./Logger'); ///ts:import:generated
///ts:import=CommentData
import CommentData = require('../Common/CommentData'); ///ts:import:generated
///ts:import=CommentGroup
import CommentGroup = require('../Common/CommentGroup'); ///ts:import:generated
///ts:import=CommentSubscriber
import CommentSubscriber = require('../Common/CommentSubscriber'); ///ts:import:generated
///ts:import=CommentTransports
import CommentTransports = require('../Common/CommentTransports'); ///ts:import:generated
///ts:import=Visitor
import Visitor = require('./Visitor'); ///ts:import:generated

class CommentRepository{
    constructor(private db: Database, private logger: Logger, private emailer: DevCommunityEmailer) {
    }

    public getComments(input: CommentTransports.Get, callback: (success: boolean, comments: CommentGroup) => void): void {
        this.findGroup(input.GroupId, (success, group) => {
            if (success) {
                callback(success, group);
            }
            else {
                this.addNewCommentGroup(input.GroupId, null, (success) => {
                    callback(true, { comments: [], groupId: input.GroupId, subscribers: [], visitors: [] });
                });
            }
        });
    }

    public postComment(visitor: Visitor, input: CommentTransports.Post, callback: (success: boolean) => void): void {
        if (visitor.getEmail() != input.NewComment.author && input.NewComment.author != "Guest") {
            this.logger.error("Invalid user. Expected " + input.NewComment.author + ", got " + visitor.getEmail());
            callback(false);
            return;
        }

        this.findGroup(input.GroupId, (success, group) => {
            if (success) {
                input.NewComment.time = new Date(Date.now());
                this.addNewComment(group, input.NewComment, callback);
                this.emailNewComment(group, input.NewComment, visitor);
            }
            else {
                this.addNewCommentGroup(input.GroupId, input.NewComment, callback);
            }
        });
    }

    public editComment(visitor: Visitor, input: CommentTransports.Post, callback: (success: boolean) => void): void {
        this.findComment(input.GroupId, input.NewComment.id, (success, comment, group) => {
            if (success) {
                if (visitor.getEmail() == comment.author || visitor.isAdmin()) {
                    var newComment = input.NewComment;
                    comment.data = newComment.data;
                    comment.time = new Date(Date.now());
                    this.updateCommentGroup(group, callback);
                }
                else {
                    this.logger.error("Invalid user. Expected " + input.NewComment.author + ", got " + visitor.getEmail());
                    callback(false);
                }
            }
            else {
                this.logger.error("Could not find comment " + input.NewComment.id);
                callback(false);
            }
        });
    }

    public postCommentReply(visitor: Visitor, input: CommentTransports.PostReply, callback: (success: boolean) => void): void {
        if (visitor.getEmail() != input.NewComment.author && input.NewComment.author != "Guest") {
            this.logger.error("Invalid user. Expected " + input.NewComment.author + ", got " + visitor.getEmail());
            callback(false);
            return;
        }

        this.findComment(input.GroupId, input.ParentId, (success, comment, group) => {
            if (success) {
                input.NewComment.time = new Date(Date.now());
                comment.replies.push(input.NewComment);
                this.emailNewComment(group, input.NewComment, visitor);
                this.updateCommentGroup(group, callback);
            }
            else {
                this.logger.error("Could not find comment " + input.NewComment.id);
                callback(false);
            }
        });
    }

    public visitComment(visitor: Visitor, input: CommentTransports.VisitComment, callback: (subscribed: boolean) => void): void {
        this.findGroup(input.GroupId, (success, group) => {
            var subscribed = false;
            if (success) {
                var email = visitor.getEmail();
                var hasVisited = group.visitors.indexOf(email) != -1;
                if (hasVisited) {
                    var subscriber = CommentTransports.findSubscriber(group, email);
                    if (subscriber) {
                        if (subscriber.newCommentSinceLastVisit) {
                            subscriber.newCommentSinceLastVisit = false;
                            this.updateCommentGroup(group, () => { });
                        }
                        subscribed = true;
                    }
                }
                else {
                    group.visitors.push(email);
                    group.subscribers.push({ newCommentSinceLastVisit: false, visitor: email });
                    this.updateCommentGroup(group, () => { });
                    subscribed = true;
                }
            }
            callback(subscribed);
        });
    }

    public updateSubscription(visitor: Visitor, data: CommentTransports.Subscription): void {
        this.findGroup(data.GroupId, (success, group) => {
            var index = -1;
            var email = visitor.getEmail();
            for (var i = 0; i < group.subscribers.length; ++i) {
                if (group.subscribers[i].visitor == email) {
                    index = i;
                    break;
                }
            }
            if (index != -1 && !data.Subscribe) {
                group.subscribers.splice(index, 1);
                this.updateCommentGroup(group, () => { });
            }
            else if (index == -1 && data.Subscribe) {
                group.subscribers.push({ newCommentSinceLastVisit: false, visitor: email });
                this.updateCommentGroup(group, () => { });
            }
        });
    }

    private findGroup(groupId: string, callback: (success: boolean, group: CommentGroup) => void): void {
        this.db.find({
            Condition: { groupId: groupId }
        }, (err, results: Array<CommentGroup>) => {
                if (err == null && results.length == 1) {
                    callback(true, results[0]);
                }
                else {
                    callback(false, null);
                }
            });
    }

    private findComment(groupId: string, commentId: string, callback: (success: boolean, comment: CommentData, group: CommentGroup) => void): void {
        this.findGroup(groupId, (success, group) => {
            if (success) {
                this.findNestedComment(group.comments, commentId, (comment: CommentData) => {
                    callback(comment != null, comment, group);
                });
            }
            else {
                callback(false, null, null);
            }
        });
    }

    private findNestedComment(comments: Array<CommentData>, id: string, callback: (comment: CommentData) => void): CommentData {
        if (comments.length == 0) {
            callback(null);
            return;
        }

        var breakLoop = false;
        comments.forEach((comment) => {
            if (breakLoop) return;
            if (comment.id == id) {
                callback(comment);
                breakLoop = true;
                return;
            }
            else {
                var nestedComment = this.findNestedComment(comment.replies, id, callback);
                if (nestedComment) {
                breakLoop = true;
                    callback(nestedComment);
                    return;
                }
            }
            return null;
        });
    }

    private addNewComment(group: CommentGroup, comment: CommentData, callback: (boolean) => void): void {
        group.comments.push(comment);
        this.updateCommentGroup(group, callback);
    }

    private updateCommentGroup(group: CommentGroup, callback: (boolean) => void): void {
        this.db.update({
            Query: { groupId: group.groupId },
            Update: {
                groupId: group.groupId,
                subscribers: group.subscribers,
                comments: group.comments,
                visitors: group.visitors
            },
            Options: { upsert: false }
        }, (err, numReplaced) => {
                if (err != null || numReplaced != 1) {
                    callback(false);
                }
                else {
                    callback(true);
                }
            });
    }

    private addNewCommentGroup(groupId: string, comment: CommentData, callback: (boolean) => void): void {
        var group: CommentGroup = {
            groupId: groupId,
            subscribers: [],
            comments: [],
            visitors: []
        };
        if (comment != null) {
            group.comments.push(comment);
        }
        this.db.insert(group, (err, numInserted) => {
            if (err != null) {
                this.logger.log(err);
                callback(false);
            }
            else {
                callback(true);
            }
        });
    }

    private emailNewComment(group: CommentGroup, comment: CommentData, visitor: Visitor): void {
        var emailTo = [];
        for (var i = 0; i < group.subscribers.length; ++i) {
            if (!group.subscribers[i].newCommentSinceLastVisit && group.subscribers[i].visitor != comment.author) {
                emailTo.push(group.subscribers[i].visitor);
                group.subscribers[i].newCommentSinceLastVisit = true;
            }
        }
        if (emailTo.length > 0) {
            this.updateCommentGroup(group, () => { });
            var url = group.groupId.replace("-", "/");
            this.emailer.sendCommentEmail(emailTo, url, comment.data, comment.author);
        }
    }
}
export = CommentRepository;

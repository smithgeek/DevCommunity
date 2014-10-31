///ts:import=Database
import Database = require('./Database'); ///ts:import:generated
///ts:import=Logger
import Logger = require('./Logger'); ///ts:import:generated
///ts:import=CommentData
import CommentData = require('../Common/CommentData'); ///ts:import:generated
///ts:import=CommentGroup
import CommentGroup = require('../Common/CommentGroup'); ///ts:import:generated
///ts:import=CommentTransports
import CommentTransports = require('../Common/CommentTransports'); ///ts:import:generated
///ts:import=Visitor
import Visitor = require('./Visitor'); ///ts:import:generated

class CommentRepository{
    constructor(private db: Database, private logger: Logger) {
    }

    public getComments(input: CommentTransports.Get, callback: (success: boolean, comments: CommentGroup) => void): void {
        this.findGroup(input.GroupId, (success, group) => {
            if (success) {
                callback(success, group);
            }
            else {
                callback(true, { comments: [], groupId: input.GroupId, subscribers: [] });
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
            }
            else {
                this.addNewCommentGroup(input.GroupId, input.NewComment, callback);
            }

        });
    }

    public editComment(visitor: Visitor, input: CommentTransports.Post, callback: (success: boolean) => void): void {
        this.findComment(input.GroupId, input.NewComment.id, (success, comment, group) => {
            if (success) {
                if (visitor.getEmail() == comment.author) {
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
                this.updateCommentGroup(group, callback);
            }
            else {
                this.logger.error("Could not find comment " + input.NewComment.id);
                callback(false);
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
                comments: group.comments
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
            comments: []
        };
        group.comments.push(comment);
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
}
export = CommentRepository;

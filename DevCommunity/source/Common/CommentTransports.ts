///ts:import=CommentData
import CommentData = require('./CommentData'); ///ts:import:generated
///ts:import=CommentSubscriber
import CommentSubscriber = require('./CommentSubscriber'); ///ts:import:generated
///ts:import=CommentGroup
import CommentGroup = require('./CommentGroup'); ///ts:import:generated

export interface Get {
    GroupId: string;
}

export interface Post {
    GroupId: string;
    NewComment: CommentData;
}

export interface PostReply extends Post {
    ParentId: string;
}

export interface Subscription {
    GroupId: string;
    Subscribe: boolean;
}

export interface VisitComment {
    GroupId: string;
}

export function findSubscriber(group: CommentGroup, email: string): CommentSubscriber{
    for (var i = 0; i < group.subscribers.length; ++i) {
        if (group.subscribers[i].visitor == email) {
            return group.subscribers[i];
        }
    }
    return null;
}

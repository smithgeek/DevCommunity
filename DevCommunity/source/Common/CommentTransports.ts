///ts:import=CommentData
import CommentData = require('./CommentData'); ///ts:import:generated

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
}
///ts:import=CommentData
import CommentData = require('./CommentData'); ///ts:import:generated
///ts:import=CommentSubscriber
import CommentSubscriber = require('./CommentSubscriber'); ///ts:import:generated

interface CommentGroup {
    groupId: string;
    subscribers: Array<CommentSubscriber>;
    visitors: Array<string>;
    comments: Array<CommentData>;
}
export = CommentGroup;
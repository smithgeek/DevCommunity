///ts:import=CommentData
import CommentData = require('./CommentData'); ///ts:import:generated

interface CommentGroup {
    groupId: string;
    subscribers: Array<string>;
    comments: Array<CommentData>
}
export = CommentGroup;
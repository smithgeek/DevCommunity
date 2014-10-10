///ts:import=CommentData
import CommentData = require('./CommentData'); ///ts:import:generated

interface CommentGroup {
    dataId: string;
    subscribers: Array<string>;
    comments: Array<CommentData>
}
export = CommentGroup;
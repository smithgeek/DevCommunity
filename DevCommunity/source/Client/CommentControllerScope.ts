///ts:import=CommentGroup
import CommentGroup = require('../Common/CommentGroup'); ///ts:import:generated

interface CommentControllerScope extends ng.IScope {
    isSubscribed: boolean;
    commentGroup: CommentGroup;
    commentId: string;
    isAnonymous: boolean;
    author: string;
}

export = CommentControllerScope;
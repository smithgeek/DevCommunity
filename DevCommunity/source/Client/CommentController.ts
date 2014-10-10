///ts:import=app
import app = require('./app'); ///ts:import:generated
///ts:import=IUserSvc
import IUserSvc = require('./IUserSvc'); ///ts:import:generated
///ts:import=CommentControllerScope
import CommentControllerScope = require('./CommentControllerScope'); ///ts:import:generated
///ts:import=CommentData
import CommentData = require('../Common/CommentData'); ///ts:import:generated

class CommentController {
    constructor(private $scope: CommentControllerScope, private $http, private userSvc: IUserSvc) {
        this.$scope.isSubscribed = true;
        this.$scope.commentGroup = { dataId: '', subscribers: [], comments: null };
        this.$scope.isAnonymous = false;
        this.updateAuthor();
        this.$scope.$watch('commentId', (value) => {
            if (value) {
                //$http.get('/api/GetComments/' + $scope.commentId).success((data: CommentGroup) => {
                //});
                var c: CommentData = {
                    time: new Date(Date.now()),
                    author: "brent",
                    replies: [],
                    votesUp: [],
                    votesDown: [],
                    data: "some comment stuff",
                    id: "1",
                    hierarchy: 0
                };
                var d: CommentData = {
                    time: new Date(Date.now()),
                    author: "brent",
                    replies: [],
                    votesUp: [],
                    votesDown: [],
                    data: "some more comment stuff",
                    id: "2",
                    hierarchy: 1
                };
                var e: CommentData = {
                    time: new Date(Date.now()),
                    author: "brent",
                    replies: [],
                    votesUp: [],
                    votesDown: [],
                    data: "even more comment stuff",
                    id: "3",
                    hierarchy: 0
                };
                c.replies.push(d);
                this.$scope.commentGroup = { dataId: this.$scope.commentId, subscribers: [], comments: [c, e] };
            }
        });
    }
    
    public toggleSubscribe(): void {
        this.$scope.isSubscribed = !this.$scope.isSubscribed;
    }

    public updateAuthor(): void {
        if (this.$scope.isAnonymous) {
            this.$scope.author = "Anonymous";
        }
        else {
            this.$scope.author = this.userSvc.getUser();
        }
    }
}

angular.module(app.getModuleName()).controller('CommentController', ['$scope', '$http', 'userSvc', CommentController]);

export = CommentController;


///ts:import=app
import app = require('./app');

class CommentController {
    constructor(private $scope, private $http) {
        this.$scope.isSubscribed = true;
        this.$scope.commentGroup = { dataId: '', subscribers: [], comments: null };
        this.$scope.$watch('commentId', function (value) {
            if (value) {
                //$http.get('/api/GetComments/' + $scope.commentId).success((data: CommentGroup) => {
                //});
                var c = {
                    time: new Date(Date.now()),
                    author: "brent",
                    replies: [],
                    votesUp: [],
                    votesDown: [],
                    data: "some comment stuff",
                    id: "1",
                    hierarchy: 0
                };
                var d = {
                    time: new Date(Date.now()),
                    author: "brent",
                    replies: [],
                    votesUp: [],
                    votesDown: [],
                    data: "some more comment stuff",
                    id: "2",
                    hierarchy: 1
                };
                var e = {
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
                this.$scope.commentGroup = { dataId: $scope.commentId, subscribers: [], comments: [c, e] };
            }
        });
    }
    
    public toggleSubscribe() {
        this.$scope.isSubscribed = !this.$scope.isSubscribed;
    }
}

angular.module(app.getModuleName()).controller('CommentController', ['$scope', '$http', CommentController]);

exports = CommentController;


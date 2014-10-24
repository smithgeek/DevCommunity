///ts:import=app
import app = require('./app'); ///ts:import:generated
///ts:import=IUserSvc
import IUserSvc = require('./IUserSvc'); ///ts:import:generated
///ts:import=CommentControllerScope
import CommentControllerScope = require('./CommentControllerScope'); ///ts:import:generated
///ts:import=CommentData
import CommentData = require('../Common/CommentData'); ///ts:import:generated
///ts:import=CommentGroup
import CommentGroup = require('../Common/CommentGroup'); ///ts:import:generated
///ts:import=CommentTransports
import CommentTransports = require('../Common/CommentTransports'); ///ts:import:generated

class CommentController {
    constructor(private $scope: CommentControllerScope, private $http: ng.IHttpService, private userSvc: IUserSvc) {
        this.$scope.isSubscribed = true;
        this.$scope.author = this.userSvc.getUser();
        this.$scope.$on('postComment', (event, d: CommentData) => this.postComment(d));
        this.$scope.$on('postReply', (event, d: CommentData, parentId: string) => this.postReply(d, parentId));
        this.$scope.$on('editComment', (event, d: CommentData) => this.editComment(d));
        this.$scope.$watch('commentId', (value) => {
            if (value) {
                $http.get('/api/GetComments/' + $scope.commentId)
                    .success((data: CommentGroup) => {
                        this.$scope.commentGroup = data;
                    });
            }
        });
    }
    
    public toggleSubscribe(): void {
        this.$scope.isSubscribed = !this.$scope.isSubscribed;
    }

    public isLoggedIn(): boolean {
        return this.userSvc.isLoggedIn();
    }

    public postComment(data: CommentData): void {
        this.$scope.commentGroup.comments.push(data);
        this.$http.post('/api/restricted/PostComment', <CommentTransports.Post>{
            GroupId: this.$scope.commentGroup.groupId,
            NewComment: data
        });
    }

    public postReply(data: CommentData, parentId: string): void {
        this.$http.post('/api/restricted/PostComment', <CommentTransports.PostReply>{
            GroupId: this.$scope.commentGroup.groupId,
            NewComment: data,
            ParentId: parentId
        });
    }

    public editComment(data: CommentData): void {
        this.$http.post('/api/restricted/PostComment', <CommentTransports.Post>{
            GroupId: this.$scope.commentGroup.groupId,
            NewComment: data
        });
    }
}

angular.module(app.getModuleName()).controller('CommentController', ['$scope', '$http', 'userSvc', CommentController]);

export = CommentController;


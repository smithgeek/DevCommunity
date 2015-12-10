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
        this.$scope.isSubscribed = false;
        this.$scope.author = this.userSvc.getUser();
        this.$scope.$on('postComment', (event, d: CommentData) => this.postComment(d));
        this.$scope.$on('postReply', (event, d: CommentData, parentId: string) => this.postReply(d, parentId));
        this.$scope.$on('editComment', (event, d: CommentData) => this.editComment(d));
        this.$scope.$watch('commentId', (value) => {
            if (value) {
                this.getComments();
            }
        });
    }

    public toggleSubscribe(): void {
        this.$scope.isSubscribed = !this.$scope.isSubscribed;
        this.$http.post('/api/restricted/ChangeSubscription', <CommentTransports.Subscription>{
            GroupId: this.$scope.commentGroup.groupId,
            Subscribe: this.$scope.isSubscribed
        });
    }

    public isLoggedIn(): boolean {
        return this.userSvc.isLoggedIn();
    }

    public isAdmin(): boolean {
        return this.userSvc.isAdmin();
    }

    public postComment(data: CommentData): void {
        var needsRefresh = this.$scope.commentGroup.comments.length == 0;
        this.$scope.commentGroup.comments.push(data);
        this.$http.post('/api/restricted/PostComment', <CommentTransports.Post>{
            GroupId: this.$scope.commentGroup.groupId,
            NewComment: data
        }).success(() => {
            if (needsRefresh) {
                this.getComments();
            }
        });
    }

    public postReply(data: CommentData, parentId: string): void {
        this.$http.post('/api/restricted/PostCommentReply', <CommentTransports.PostReply>{
            GroupId: this.$scope.commentGroup.groupId,
            NewComment: data,
            ParentId: parentId
        });
    }

    public editComment(data: CommentData): void {
        this.$http.post('/api/restricted/EditComment', <CommentTransports.Post>{
            GroupId: this.$scope.commentGroup.groupId,
            NewComment: data
        });
    }

    private getComments(): void {
        this.$http.get('/api/GetComments/' + this.$scope.commentId)
            .success((data: CommentGroup) => {
                this.$scope.commentGroup = data;
                if (CommentTransports.findSubscriber(data, this.userSvc.getUser())) {
                    this.$scope.isSubscribed = true;
                }
                else {
                    if (data.visitors.indexOf(this.userSvc.getUser()) == -1) {
                        this.$scope.isSubscribed = true;
                    }
                    else {
                        this.$scope.isSubscribed = false;
                    }
                }
                this.$http.post('/api/restricted/VisitComment', <CommentTransports.VisitComment>{
                    GroupId: this.$scope.commentGroup.groupId
                });
            });
    }
}

angular.module(app.getModuleName()).controller('CommentController', ['$scope', '$http', 'userSvc', CommentController]);

export = CommentController;

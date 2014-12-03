///ts:import=app
var app = require('../app');

(function () {
    var appModule = angular.module(app.getModuleName());

    appModule.directive('myComments', function () {
        return {
            restrict: 'E',
            templateUrl: '/partials/CommentSystem.html',
            controller: [
                '$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
                    $attrs.$observe('commentId', function (value) {
                        if (value && value[value.length - 1] != '-') {
                            $scope.commentId = value;
                        }
                    });
                }]
        };
    });

    appModule.directive('myComment', [
        '$compile', '$timeout', function ($compile, timer) {
            return {
                restrict: 'E',
                templateUrl: 'partials/Comment.html',
                transclude: true,
                link: function (scope, element, attrs) {
                    element.append($compile('<my-comment ng-repeat="comment in comment.replies" />')(scope));
                    var timeagoify = function () {
                        $("time.timeago").timeago();
                    };
                    timer(timeagoify, 0);
                }
            };
        }]);

    appModule.directive('myCommentForm', [
        '$compile', '$timeout', function ($compile, timer) {
            return {
                restrict: 'E',
                templateUrl: 'partials/CommentForm.html',
                replace: 'true',
                scope: {
                    placeholder: '@placeholder',
                    user: '=user',
                    button: '@button',
                    comment: '=comment',
                    mode: '@mode'
                },
                controller: [
                    '$scope', '$rootScope', function ($scope, $rootScope) {
                        var parentComment = $scope.comment;
                        $scope.preview = false;
                        if (parentComment && $scope.mode == 'edit') {
                            $scope.data = parentComment.data;
                        } else {
                            $scope.data = "";
                        }
                        $scope.SelectedAuthor = $scope.user;

                        $scope.hash = function (input) {
                            var hash = 0, i, chr, len;
                            if (input.length == 0)
                                return hash;
                            for (i = 0, len = input.length; i < len; i++) {
                                chr = input.charCodeAt(i);
                                hash = ((hash << 5) - hash) + chr;
                                hash |= 0;
                            }
                            return hash;
                        };

                        $scope.togglePreview = function () {
                            $scope.preview = !$scope.preview;
                        };

                        $scope.setAuthor = function (author) {
                            $scope.SelectedAuthor = author;
                        };

                        $scope.post = function () {
                            var now = Date.now();
                            var data = {
                                time: new Date(now),
                                author: $scope.SelectedAuthor,
                                data: $scope.data,
                                hierarchy: 0,
                                id: $scope.hash($scope.user).toString() + now.toString(),
                                replies: [],
                                votesDown: [],
                                votesUp: []
                            };
                            if ($scope.mode == 'edit') {
                                parentComment.data = data.data;
                                parentComment.time = data.time;
                                parentComment.author = data.author;
                                $rootScope.$broadcast('editComment', parentComment);
                                $("#comment-edit-" + parentComment.id).toggleClass("hideCommentForm");
                                $("#comment-readonly-" + parentComment.id).toggleClass("hideCommentForm");
                            } else {
                                if (parentComment) {
                                    data.hierarchy = parentComment.hierarchy + 1;
                                    parentComment.replies.push(data);
                                    $rootScope.$broadcast('postReply', data, parentComment.id);
                                    $("#comment-reply-" + parentComment.id).toggleClass("hideCommentForm");
                                } else {
                                    $rootScope.$broadcast('postComment', data);
                                }
                                $scope.data = "";
                            }
                        };
                    }]
            };
        }]);

    appModule.directive('myCommentEdit', [function () {
            return {
                restrict: 'E',
                replace: 'true',
                controller: [
                    '$scope', '$attrs', function ($scope, $attrs) {
                        $scope.toggleShowEdit = function () {
                            $("#comment-edit-" + $attrs.commentId).toggleClass("hideCommentForm");
                            $("#comment-readonly-" + $attrs.commentId).toggleClass("hideCommentForm");
                        };
                    }],
                template: '<button class="link-button link-button-hoverable" ng-click="toggleShowEdit()">Edit</button>'
            };
        }]);

    appModule.directive('myCommentReply', [function () {
            return {
                restrict: 'E',
                replace: 'true',
                controller: [
                    '$scope', '$attrs', function ($scope, $attrs) {
                        $scope.toggleShowReply = function () {
                            $("#comment-reply-" + $attrs.commentId).toggleClass("hideCommentForm");
                        };
                    }],
                template: '<button class="link-button link-button-hoverable" ng-click="toggleShowReply()">Reply</button>'
            };
        }]);
})();
//# sourceMappingURL=MyCommentsDirective.js.map
//# sourceMappingURL=MyCommentsDirective.js.map

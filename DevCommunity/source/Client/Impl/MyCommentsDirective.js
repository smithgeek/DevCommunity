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
                    data: '@data'
                }
            };
        }]);

    appModule.directive('myCommentActionButtons', [function () {
            return {
                restrict: 'E',
                replace: 'true',
                controller: [
                    '$scope', '$attrs', function ($scope, $attrs) {
                        $scope.toggleShowReply = function () {
                            $("#comment-reply-" + $attrs.commentId).toggleClass("hideCommentForm");
                        };
                        $scope.toggleShowEdit = function () {
                            $("#comment-edit-" + $attrs.commentId).toggleClass("hideCommentForm");
                            $("#comment-readonly-" + $attrs.commentId).toggleClass("hideCommentForm");
                        };
                    }],
                template: '<div class="less-important"><ul class="horizontal-list"><li><button class="link-button link-button-hoverable" ng-click="toggleShowEdit()">Edit</button></li><li><button class="link-button link-button-hoverable" ng-click="toggleShowReply()">Reply</button></li></ul></div>'
            };
        }]);
})();
//# sourceMappingURL=MyCommentsDirective.js.map
//# sourceMappingURL=MyCommentsDirective.js.map

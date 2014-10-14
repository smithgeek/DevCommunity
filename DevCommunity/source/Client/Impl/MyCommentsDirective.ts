///ts:import=app
import app = require('../app'); ///ts:import:generated

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
                    button: '@button'
                }
            };
        }]);
})();
//# sourceMappingURL=MyCommentsDirective.js.map

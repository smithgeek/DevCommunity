///ts:import=app
import app = require('../app'); ///ts:import:generated

(function () {
    var appModule = angular.module(app.getModuleName());

    appModule.directive('ngReallyClick', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', function () {
                    var message = attrs.ngReallyMessage;
                    if (message && confirm(message)) {
                        scope.$apply(attrs.ngReallyClick);
                    }
                });
            }
        };
    }]);
})();
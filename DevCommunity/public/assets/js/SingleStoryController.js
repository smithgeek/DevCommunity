/// <reference path="../../../typings/angularjs/angular.d.ts" />
var SingleStoryController = (function () {
    function SingleStoryController($scope, $http, $routeParams) {
        $('.navbar-nav li.active').removeClass('active');
        $scope.contentLoaded = false;

        $http.get('/api/GetStoryById/' + $routeParams.id).success(function (data) {
            $scope.story = data;
            $('.hidden').removeClass('hidden');
            $scope.contentLoaded = true;
        });
    }
    return SingleStoryController;
})();
//# sourceMappingURL=SingleStoryController.js.map

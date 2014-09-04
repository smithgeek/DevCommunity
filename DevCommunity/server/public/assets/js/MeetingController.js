/// <reference path="../../../typings/angularjs/angular.d.ts" />
var MeetingController = (function () {
    function MeetingController($scope, $http, $routeParams, meetingSvc) {
        $('.navbar-nav li.active').removeClass('active');
        $scope.contentLoaded = false;

        $http.get('/api/GetMeetingById/' + $routeParams.id).success(function (data) {
            $scope.meeting = meetingSvc.createMeeting(data);
            $('.hidden').removeClass('hidden');
            $scope.contentLoaded = true;
        });
    }
    return MeetingController;
})();
//# sourceMappingURL=MeetingController.js.map

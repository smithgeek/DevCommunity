/// <reference path="../../../typings/angularjs/angular.d.ts" />

class MeetingController {

    constructor($scope, $http: ng.IHttpService, $routeParams, meetingSvc) {
        $('.navbar-nav li.active').removeClass('active');

        $http.get('/api/GetMeetingById/' + $routeParams.id).success((data: MeetingData) => {
            $scope.meeting = meetingSvc.createMeeting(data);
            $('.hidden').removeClass('hidden');
        });
    }
}

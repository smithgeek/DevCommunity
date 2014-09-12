///ts:import=MeetingData
import MeetingData = require('../Common/MeetingData'); ///ts:import:generated

class MeetingController {

    constructor($scope, $http: ng.IHttpService, $routeParams, meetingSvc) {
        $('.navbar-nav li.active').removeClass('active');
        $scope.contentLoaded = false;

        $http.get('/api/GetMeetingById/' + $routeParams.id).success((data: MeetingData) => {
            $scope.meeting = meetingSvc.createMeeting(data);
            $('.hidden').removeClass('hidden');
            $scope.contentLoaded = true;
        });
    }
}
export = MeetingController;
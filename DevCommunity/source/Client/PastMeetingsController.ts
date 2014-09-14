///ts:import=IMeetingSvc
import IMeetingSvc = require('./IMeetingSvc'); ///ts:import:generated
///ts:import=MeetingData
import MeetingData = require('../Common/MeetingData'); ///ts:import:generated
///ts:import=app
import app = require('./app'); ///ts:import:generated

class PastMeetingsController {
    loggedIn: boolean;

    constructor($scope, $http: ng.IHttpService, private meetingSvc: IMeetingSvc) {
        $('.navbar-nav li.active').removeClass('active');
        $('#NavPastMeetings').addClass('active');

        this.loggedIn = false;
        $scope.meetings = [];


        $http.get('/api/GetArchivedMeetings').success((data: Array<MeetingData>) => {
            for (var i = 0; i < data.length; ++i) {
                $scope.meetings.push(meetingSvc.createMeeting(data[i]));
            }
            
            setTimeout(()=> {
                $('.panel-body').readmore({
                    maxHeight: 60,
                    moreLink: '<a href="#" class="readmore-link">More</a>',
                    lessLink: '<a href="#" class="readmore-link">Close</a>',
                    speed: 500
                });
            }, 1);
        });
    }
}

angular.module(app.getModuleName()).controller('PastMeetingsController', ['$scope', '$http', 'meetingSvc', PastMeetingsController]);

export = PastMeetingsController;
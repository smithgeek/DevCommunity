///ts:import=MeetingData
import MeetingData = require('../Common/MeetingData'); ///ts:import:generated
///ts:import=app
import app = require('./app'); ///ts:import:generated
///ts:import=IUserSvc
import IUserSvc = require('./IUserSvc'); ///ts:import:generated

class MeetingController {

    constructor(private $scope, private $http: ng.IHttpService, $routeParams, meetingSvc, private userSvc: IUserSvc) {
        $('.navbar-nav li.active').removeClass('active');
        $scope.contentLoaded = false;
        $scope.going = false;
        $scope.meetingInFuture = false;
        $scope.loggedIn = userSvc.isLoggedIn();
        $scope.peopleGoing = "";

        $http.get('/api/GetMeetingById/' + $routeParams.id).success((data: MeetingData) => {
            $scope.meeting = meetingSvc.createMeeting(data);
            $('.hidden').removeClass('hidden');
            var dateString: any = data.date;
            $scope.meetingInFuture = Date.now() < Date.parse(dateString);
            $scope.going = $scope.meeting.rsvp.indexOf(userSvc.getUser()) != -1;
            $scope.contentLoaded = true;
            this.updatePeopleGoing();
        });
    }

    public checkChanged(): void {
        var user = this.userSvc.getUser();
        if (this.$scope.going) { this.$scope.meeting.rsvp.push(user); }
        else {
            this.$scope.meeting.rsvp.splice(this.$scope.meeting.rsvp.indexOf(user), 1);
        }
        this.updatePeopleGoing();
        this.$http.post('/api/restricted/Rsvp', { going: this.$scope.going, _id: this.$scope.meeting._id })
            .error((data) => {
                console.log(data);
            });
    }

    private updatePeopleGoing(): void {
        if (this.$scope.meeting.rsvp.length == 1)
            this.$scope.peopleGoing = "1 person said they were going.";
        else
            this.$scope.peopleGoing = this.$scope.meeting.rsvp.length + " people said they were going.";
    }
}

angular.module(app.getModuleName()).controller('MeetingController', ['$scope', '$http', '$routeParams', 'meetingSvc', 'userSvc', MeetingController]);

export = MeetingController;
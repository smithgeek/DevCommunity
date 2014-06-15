/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/bootstrap/bootstrap.d.ts" />
/// <reference path="../../../typings/readmore/readmore.d.ts" />
/// <reference path="Services.ts" />

class HomeController {
    loggedIn: boolean;

    constructor($scope, $http: ng.IHttpService, private userSvc: UserSvc, meetingSvc: MeetingSvc, localStorageService) {
        $('.navbar-nav li.active').removeClass('active');
        $('#NavHome').addClass('active');

        this.loggedIn = false;
        $scope.meetings = [];
        $scope.$on('meetingAdded', function (event, meeting) {
            $scope.meetings.push(meeting);
        });

        $http.get('/api/GetSuggestions').success((data: Array<MeetingData>) => {
            for (var i = 0; i < data.length; ++i) {
                $scope.meetings.push(meetingSvc.createMeeting(data[i]));
            }

            setTimeout(function () {
                $('.panel-body').readmore({
                    maxHeight: 60,
                    moreLink: '<a href="#" class="readmore-link">More</a>',
                    lessLink: '<a href="#" class="readmore-link">Close</a>',
                    speed: 500
                });
            }, 1);

            $scope.$on('meetingAdded', function (event, meeting) {

            });
        });
    }

    public AddTopic(): void {
        if (this.userSvc.isLoggedIn())
            $('#AddTopicModal').modal('show');
        else
            $('#LoginModal').modal('show');
    }
}

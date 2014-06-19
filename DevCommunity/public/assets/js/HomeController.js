/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/bootstrap/bootstrap.d.ts" />
/// <reference path="../../../typings/readmore/readmore.d.ts" />
/// <reference path="Services.ts" />
var HomeController = (function () {
    function HomeController($scope, $http, userSvc, meetingSvc, localStorageService) {
        this.userSvc = userSvc;
        $('.navbar-nav li.active').removeClass('active');
        $('#NavHome').addClass('active');

        this.loggedIn = false;
        $scope.meetings = [];
        $scope.$on('meetingAdded', function (event, meeting) {
            $scope.meetings.push(meeting);
        });

        $http.get('/api/GetSuggestions').success(function (data) {
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
                $(document).ready(function () {
                    $('#info-carousel').carousel({ interval: 10000 });
                });
            }, 1);

            $scope.$on('meetingAdded', function (event, meeting) {
            });
        });
    }
    HomeController.prototype.AddTopic = function () {
        if (this.userSvc.isLoggedIn())
            $('#AddTopicModal').modal('show');
        else
            $('#LoginModal').modal('show');
    };
    return HomeController;
})();
//# sourceMappingURL=HomeController.js.map

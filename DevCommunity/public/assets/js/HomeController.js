/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/bootstrap/bootstrap.d.ts" />
/// <reference path="../../../typings/readmore/readmore.d.ts" />
/// <reference path="../../../typings/ckeditor/ckeditor.d.ts" />
/// <reference path="Services.ts" />
var HomeController = (function () {
    function HomeController($scope, $http, userSvc, meetingSvc, localStorageService) {
        var _this = this;
        this.userSvc = userSvc;
        this.meetingSvc = meetingSvc;
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
                    _this.NormalizeCarouselHeights();
                    $('#newIdeaDetails').ckeditor();
                });
            }, 1);
        });
        $('.datepicker').datepicker({ todayHighlight: true, autoclose: true });
        $('.datepicker').removeClass('datepicker');
    }
    HomeController.prototype.AddTopic = function () {
        if (this.userSvc.isLoggedIn()) {
            this.meetingSvc.notifyAddMeeting();
        } else
            $('#LoginModal').modal('show');
    };

    HomeController.prototype.EditMeeting = function (meeting) {
        this.meetingSvc.notifyEditMeeting(meeting);
    };

    HomeController.prototype.NormalizeCarouselHeights = function () {
        var items = $('#info-carousel .item'), heights = [], tallest;

        if (items.length) {
            function normalizeHeights() {
                items.each(function () {
                    heights.push($(this).height());
                });
                tallest = Math.max.apply(null, heights) + 5; //cache largest value
                items.each(function () {
                    $(this).css('min-height', tallest + 'px');
                });
            }
            ;
            normalizeHeights();

            $(window).on('resize orientationchange', function () {
                tallest = 0, heights.length = 0; //reset vars
                items.each(function () {
                    $(this).css('min-height', '0'); //reset min-height
                });
                normalizeHeights(); //run it again
            });
        }
    };
    return HomeController;
})();
//# sourceMappingURL=HomeController.js.map

$('.nav a').on('click', function(){
    if($(".navbar-toggle").css('display') != 'none'){
        $(".navbar-toggle").trigger( "click" );
    }
});

(function () {
    var app = angular.module('devCommunity', ['LocalStorageModule', 'ngRoute']);

    app.controller('HomeController', function($scope, $http){
        $('.navbar-nav li.active').removeClass('active');
        $('#NavHome').addClass('active');

        var controller = this;
        controller.loggedIn = false;
        $scope.meetings = [];
        $scope.user = "";

        $http.get('/api/GetSuggestions').success( function (data) {
            for( var i = 0; i < data.length; ++i ){
                var meeting = data[i];
                meeting.HasUserVoted = function () {
                    return -1 != $.inArray($scope.user, this.votes);
                };
                meeting.Vote = function () {
                    $('.vote-btn-' + meeting._id).prop('disabled', true);
                    var copiedMeeting = angular.copy(this);
                    copiedMeeting.votes.push($scope.user);
                    copiedMeeting.vote_count++;
                    var mtg = this;
                    $http.post('/api/Vote', copiedMeeting).success(function (data) {
                        mtg.votes = copiedMeeting.votes;
                        mtg.vote_count = copiedMeeting.vote_count;
                        $('.vote-btn-' + meeting._id).prop('disabled', false);
                    }).error(function (data) {
                        alert('error ' + data);
                        $('.vote-btn-' + meeting._id).prop('disabled', false);
                    });
                }
                meeting.RemoveVote = function () {
                    $('.vote-btn-' + meeting._id).prop('disabled', true);
                    var copiedMeeting = angular.copy(this);
                    copiedMeeting.votes.splice($.inArray($scope.user, copiedMeeting.votes), 1);
                    copiedMeeting.vote_count--;
                    var mtg = this;
                    $http.post('/api/Vote', copiedMeeting).success(function (data) {
                        mtg.votes = copiedMeeting.votes;
                        mtg.vote_count = copiedMeeting.vote_count;
                        $('.vote-btn-' + meeting._id).prop('disabled', false);
                    }).error(function (data) {
                        alert('error ' + data);
                        $('.vote-btn-' + meeting._id).prop('disabled', false);
                    });
                }
                $scope.meetings.push(meeting);
            }

            setTimeout(function () {
                $('.panel-body').readmore({
                    maxHeight: 60,
                    moreLink: '<a href="#" class="readmore-link">More</a>',
                    lessLink: '<a href="#" class="readmore-link">Close</a>',
                    speed: 500
                });
	        }, 1);
        });

    });

    app.controller('AddMeetingController', function($scope, $http){
        var controller = this;
        controller.meeting = { email: '', description: '', details: '' };

        this.AddMeeting = function() {
            controller.meeting.votes = [];
            controller.meeting.vote_count = 0;
            $http.post('/api/AddMeeting', controller.meeting).success(function(data) {
                $('#AddTopicModal').modal('hide');
            }).error(function(data) {
                alert('error ' + data);
            });
        };
    });

    app.controller('PastMeetingsController', function($scope){
        $('.navbar-nav li.active').removeClass('active');
        $('#NavPastMeetings').addClass('active');
    });

    app.controller('BrainstormingController', function($scope){
        $('.navbar-nav li.active').removeClass('active');
        $('#NavBrainstorming').addClass('active');
    });

    app.controller('AboutController', function($scope){
        $('.navbar-nav li.active').removeClass('active');
        $('#NavAbout').addClass('active');
    });

    app.controller('ContactController', function($scope){
        $('.navbar-nav li.active').removeClass('active');
        $('#NavContact').addClass('active');
    });

    app.config(['$routeProvider', 'localStorageServiceProvider', '$locationProvider',
        function ($routeProvider, localStorageServiceProvider, $locationProvider) {
            localStorageServiceProvider.setPrefix('PndDevCommunity');
            $routeProvider.when("/about", {
                templateUrl: 'partials/about',
                controller: 'AboutController'
                }).
            when("/", {
                templateUrl: 'partials/home',
                controller: 'HomeController'
                }).
            when("/contact", {
                templateUrl: 'partials/contact',
                controller: 'ContactController'
                }).
            when("/pastMeetings", {
                templateUrl: 'partials/pastMeetings',
                controller: 'PastMeetingsController'
                }).
            when("/brainstorming", {
                templateUrl: 'partials/brainstorming',
                controller: 'BrainstormingController'
                }).
            otherwise({
                redirectTo: '/'
                });
            //$locationProvider.html5Mode(true);
        }
    ]);

})();
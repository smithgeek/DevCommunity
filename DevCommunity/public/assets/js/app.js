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
        controller.meetings = [];
        controller.user = "";

        $http.get('/api/GetSuggestions').success( function (data) {
            for( var i = 0; i < data.length; ++i ){
                var userVoted = -1 != $.inArray(controller.user, data[i].votes);
                controller.meetings.push({ data: data[i], user_voted: userVoted });
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

        this.Vote = function(meeting) {
            $('#vote-up-' + meeting._id).prop('disabled', true);
            $('#vote-remove-' + meeting._id).prop('disabled', true);
            var copiedMeeting = meeting;
            copiedMeeting.votes.push(controller.user);
            copiedMeeting.vote_count++;
            $http.post('/api/Vote', copiedMeeting).success(function(data) {
                meeting = copiedMeeting;
                meeting.user_voted = true;
                $('#vote-up-' + meeting._id).prop('disabled', false);
                $('#vote-remove-' + meeting._id).prop('disabled', false);
            }).error(function(data) {
                alert('error ' + data);
                $('#vote-up-' + meeting._id).prop('disabled', false);
                $('#vote-remove-' + meeting._id).prop('disabled', false);
            });
        };
    });

    app.controller('AddMeetingController', function($scope, $http){
        var controller = this;
        controller.meeting = { email: '', description: '', details: '' };

        this.AddMeeting = function() {
            controller.meeting.data.votes = [];
            controller.meeting.data.vote_count = 0;
            $http.post('/api/AddMeeting', controller.meeting.data).success(function(data) {
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
$('.nav a').on('click', function(){
    if($(".navbar-toggle").css('display') != 'none'){
        $(".navbar-toggle").trigger( "click" );
    }
});

(function () {
    var app = angular.module('devCommunity', ['LocalStorageModule', 'ngRoute', 'ngSanitize']);

    app.config(['$routeProvider', 'localStorageServiceProvider', '$locationProvider', '$httpProvider',
        function ($routeProvider, localStorageServiceProvider, $locationProvider, $httpProvider) {
            $httpProvider.interceptors.push('authInterceptor');
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
        }
    ]);


    app.service('userSvc', function(localStorageService) {
        this.getUser = function() {
            var email = localStorageService.get('userEmail');
            if(!email)
                email = '';
            return email;
        }
    });

    app.service('meetingSvc', ['userSvc', '$http', '$rootScope', function(userSvc, $http, $rootScope) {
        this.notifyMeetingAdded = function(meeting){
            $rootScope.$broadcast('meetingAdded', this.prepareMeeting(meeting));
        };

        this.prepareMeeting = function(meeting){
            meeting.HasUserVoted = function () {
                return -1 != $.inArray(userSvc.getUser(), this.votes);
            };
            meeting.Vote = function () {
                $('.vote-btn-' + meeting._id).prop('disabled', true);
                var copiedMeeting = angular.copy(this);
                copiedMeeting.votes.push(userSvc.getUser());
                copiedMeeting.vote_count++;
                var mtg = this;
                $http.post('/api/restricted/Vote', copiedMeeting).success(function (data) {
                    mtg.votes = copiedMeeting.votes;
                    mtg.vote_count = copiedMeeting.vote_count;
                    $('.vote-btn-' + meeting._id).prop('disabled', false);
                }).error(function (data) {
                    //alert(data.error.name);
                    $('.vote-btn-' + meeting._id).prop('disabled', false);
                });
            }
            meeting.RemoveVote = function () {
                $('.vote-btn-' + meeting._id).prop('disabled', true);
                var copiedMeeting = angular.copy(this);
                copiedMeeting.votes.splice($.inArray(userSvc.getUser(), copiedMeeting.votes), 1);
                copiedMeeting.vote_count--;
                var mtg = this;
                $http.post('/api/restricted/Vote', copiedMeeting).success(function (data) {
                    mtg.votes = copiedMeeting.votes;
                    mtg.vote_count = copiedMeeting.vote_count;
                    $('.vote-btn-' + meeting._id).prop('disabled', false);
                }).error(function (data) {
                    alert(data.error.name);
                    $('.vote-btn-' + meeting._id).prop('disabled', false);
                });
            }
            return meeting;
        };
    }]);

    app.controller('HomeController', ['$scope', '$http', 'userSvc', 'meetingSvc', 'localStorageService', function($scope, $http, userSvc, meetingSvc, localStorageService){
        $('.navbar-nav li.active').removeClass('active');
        $('#NavHome').addClass('active');

        var controller = this;
        controller.loggedIn = false;
        $scope.meetings = [];
        $scope.user = userSvc.getUser();
        $scope.$on('meetingAdded', function(event, meeting) {
            $scope.meetings.push(meeting);
        });

        $http.get('/api/GetSuggestions').success( function (data) {
            for( var i = 0; i < data.length; ++i ){
                $scope.meetings.push(meetingSvc.prepareMeeting(data[i]));
            }

            setTimeout(function () {
                $('.panel-body').readmore({
                    maxHeight: 60,
                    moreLink: '<a href="#" class="readmore-link">More</a>',
                    lessLink: '<a href="#" class="readmore-link">Close</a>',
                    speed: 500
                });
	        }, 1);

            $scope.$on('meetingAdded', function(event, meeting){

            });
        });

    }]);

    app.controller('AddMeetingController', ['$scope', '$http', 'meetingSvc', function($scope, $http, meetingSvc){
        $scope.meeting = { email: '', description: '', details: '' };

        $scope.AddMeeting = function() {
            $('.add-modal-button').prop('disabled', true);
            $scope.meeting.votes = [];
            $scope.meeting.vote_count = 0;
            $http.post('/api/restricted/AddMeeting', $scope.meeting).success(function(data) {
                $('#AddTopicModal').modal('hide');
                $('.add-modal-button').prop('disabled', false);
                meetingSvc.notifyMeetingAdded($scope.meeting);
                $scope.meeting = { email: '', description: '', details: '' };
            }).error(function(data) {
                alert(data.error.name);
                $('.add-modal-button').prop('disabled', false);
            });
        };
    }]);

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

    app.controller('NavBarController', function($scope, localStorageService){
        $scope.logOut = function() {
            localStorageService.clearAll();
        };
    });

    app.controller('LoginController', function($scope, $http, localStorageService) {
        $scope.user = { email: '' };
        $scope.submit = function() {
            $http.post('/authenticate', $scope.user)
            .success(function (data, status, headers, config) {
                localStorageService.set('userToken', data.token);
                localStorageService.set('userEmail', $scope.user);
                $('#LoginModal').modal('hide');
            })
            .error(function(data, status, headers, config) {
                localStorageService.remove('userToken');
                localStorageService.remove('userEmail');
                alert('Problem logging in.');
            });
        };
    });
    
    app.factory('authInterceptor', ['$q', 'localStorageService', function ($q, localStorageService) {
      return {
        request: function (config) {
          config.headers = config.headers || {};
          if (localStorageService.get('userToken')) {
            config.headers.Authorization = 'Bearer ' + localStorageService.get('userToken');
          }
          return config;
        },
        response: function (response) {
          if (response.status === 401) {
            // handle the case where the user is not authenticated
          }
          return response || $q.when(response);
        },
        responseError: function(rejection) {
            $('#LoginModal').modal('show');
            return $q.reject(rejection);
        }
      };
    }]);
})();
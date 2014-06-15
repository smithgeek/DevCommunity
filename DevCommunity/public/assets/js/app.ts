/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angularjs/angular-route.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/bootstrap/bootstrap.d.ts" />
/// <reference path="../../../typings/readmore/readmore.d.ts" />
/// <reference path="Services.ts" />
/// <reference path="HomeController.ts" />

$('.nav a').on('click', function () {
    if ($(".navbar-toggle").css('display') != 'none') {
        $(".navbar-toggle").trigger("click");
    }
});

interface IMeetingControllerScope extends ng.IScope {
    meeting: Meeting;
}

class AddMeetingController {
    constructor(private $scope: IMeetingControllerScope, private $http: ng.IHttpService, private meetingSvc: MeetingSvc, private userSvc: UserSvc) {
        $scope.meeting = meetingSvc.createMeeting();
    }

    public AddMeeting(): void {
        $('.add-modal-button').prop('disabled', true);
        this.$scope.meeting.SetUser(this.userSvc.getUser());
        var mtgData: MeetingData = this.$scope.meeting.GetData();
        this.$http.post('/api/restricted/AddMeeting', mtgData).success( (data) => {
            $('#AddTopicModal').modal('hide');
            $('.add-modal-button').prop('disabled', false);
            this.meetingSvc.notifyMeetingAdded(this.$scope.meeting);
        }).error( (data) => {
            $('.add-modal-button').prop('disabled', false);
        });
    }
}

interface IUserVerifier{
    email: string;
    verificationCode: string;
}

interface ILoginControllerScope extends ng.IScope {
    user: IUserVerifier;
    message: string;
    step: string;
}

class LoginController {
    constructor(private $scope: ILoginControllerScope, private $http, private localStorageService) {
        $scope.user = { email: '', verificationCode: '' };
        $scope.message = '';
        $scope.step = 'Email';
    }

    public submitEmail(): void {
        this.$scope.user.email = this.$scope.user.email.toLowerCase();
        this.$http.post('/identify', this.$scope.user)
            .success( (data, status, headers, config) => {
                this.$scope.step = 'Verification';
            })
            .error( (data, status, headers, config) => {
                this.localStorageService.remove('userToken');
                this.localStorageService.remove('userEmail');
                this.$scope.message = "Error communicating with server.";
            });
    }

    public submitVerification(): void {
        this.$http.post('/verify', this.$scope.user)
            .success( (data, status, headers, config) => {
                this.localStorageService.set('userToken', data.token);
                this.localStorageService.set('userEmail', this.$scope.user);
                this.close();
            })
            .error( (data, status, headers, config) => {
                this.localStorageService.remove('userToken');
                this.localStorageService.remove('userEmail');
                this.$scope.message = "Invalid verification code.";
            });
    }

    public close (): void {
        $('#LoginModal').modal('hide');
        this.$scope.user = { email: '', verificationCode: '' };
        this.$scope.message = '';
        this.$scope.step = 'Email';
    }
}


class RouteConfig {
    constructor($routeProvider: ng.route.IRouteProvider, localStorageServiceProvider, $locationProvider: ng.ILocationProvider, $httpProvider: ng.IHttpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
        localStorageServiceProvider.setPrefix('PndDevCommunity');
        $routeProvider.when("/about", {
            templateUrl: 'partials/about',
            controller: 'AboutController'
        }).when("/", {
                templateUrl: 'partials/home',
                controller: 'HomeController'
            }).
            when("/contact", {
                templateUrl: 'partials/contact',
                controller: 'ContactController'
            }).
            when('/pastMeetings', {
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
}

(function () {
    var app = angular.module('devCommunity', ['LocalStorageModule', 'ngRoute', 'ngSanitize']);

    app.config(['$routeProvider', 'localStorageServiceProvider', '$locationProvider', '$httpProvider', RouteConfig]);

    app.service('userSvc', ['localStorageService', UserSvc]);

    app.service('meetingSvc', ['userSvc', '$http', '$rootScope', MeetingSvc]);

    app.controller('HomeController', ['$scope', '$http', 'userSvc', 'meetingSvc', 'localStorageService', HomeController]);

    app.controller('AddMeetingController', ['$scope', '$http', 'meetingSvc', 'userSvc', AddMeetingController]);

    app.controller('PastMeetingsController', function ($scope) {
        $('.navbar-nav li.active').removeClass('active');
        $('#NavPastMeetings').addClass('active');
    });

    app.controller('BrainstormingController', function ($scope) {
        $('.navbar-nav li.active').removeClass('active');
        $('#NavBrainstorming').addClass('active');
    });

    app.controller('AboutController', function ($scope) {
        $('.navbar-nav li.active').removeClass('active');
        $('#NavAbout').addClass('active');
    });

    app.controller('ContactController', function ($scope) {
        $('.navbar-nav li.active').removeClass('active');
        $('#NavContact').addClass('active');
    });

    app.controller('NavBarController', function ($scope, userSvc) {
        $scope.logOut = function () {
            userSvc.logOut();
        };

        $scope.isLoggedIn = function () {
            return userSvc.isLoggedIn();
        };

        setTimeout( () => {$('.login-nav').removeClass('login-nav') }, 1);
        
    });

    app.controller('LoginController', ['$scope', '$http', 'localStorageService', LoginController]);

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
            responseError: function (rejection) {
                return $q.reject(rejection);
            }
        };
    }]);
})();
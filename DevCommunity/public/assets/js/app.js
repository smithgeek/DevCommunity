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

var AddMeetingController = (function () {
    function AddMeetingController($scope, $http, meetingSvc, userSvc) {
        this.$scope = $scope;
        this.$http = $http;
        this.meetingSvc = meetingSvc;
        this.userSvc = userSvc;
        $scope.meeting = meetingSvc.createMeeting();
    }
    AddMeetingController.prototype.AddMeeting = function () {
        var _this = this;
        $('.add-modal-button').prop('disabled', true);
        this.$scope.meeting.SetUser(this.userSvc.getUser());
        var mtgData = this.$scope.meeting.GetData();
        this.$http.post('/api/restricted/AddMeeting', mtgData).success(function (data) {
            $('#AddTopicModal').modal('hide');
            $('.add-modal-button').prop('disabled', false);
            _this.meetingSvc.notifyMeetingAdded(_this.$scope.meeting);
        }).error(function (data) {
            $('.add-modal-button').prop('disabled', false);
        });
    };
    return AddMeetingController;
})();

var LoginController = (function () {
    function LoginController($scope, $http, localStorageService) {
        this.$scope = $scope;
        this.$http = $http;
        this.localStorageService = localStorageService;
        $scope.user = { email: '', verificationCode: '' };
        $scope.message = '';
        $scope.step = 'Email';
    }
    LoginController.prototype.submitEmail = function () {
        var _this = this;
        this.$scope.user.email = this.$scope.user.email.toLowerCase();
        this.$http.post('/identify', this.$scope.user).success(function (data, status, headers, config) {
            _this.$scope.step = 'Verification';
        }).error(function (data, status, headers, config) {
            _this.localStorageService.remove('userToken');
            _this.localStorageService.remove('userEmail');
            _this.$scope.message = "Error communicating with server.";
        });
    };

    LoginController.prototype.submitVerification = function () {
        var _this = this;
        this.$http.post('/verify', this.$scope.user).success(function (data, status, headers, config) {
            _this.localStorageService.set('userToken', data.token);
            _this.localStorageService.set('userEmail', _this.$scope.user);
            _this.close();
        }).error(function (data, status, headers, config) {
            _this.localStorageService.remove('userToken');
            _this.localStorageService.remove('userEmail');
            _this.$scope.message = "Invalid verification code.";
        });
    };

    LoginController.prototype.close = function () {
        $('#LoginModal').modal('hide');
        this.$scope.user = { email: '', verificationCode: '' };
        this.$scope.message = '';
        this.$scope.step = 'Email';
    };
    return LoginController;
})();

var RouteConfig = (function () {
    function RouteConfig($routeProvider, localStorageServiceProvider, $locationProvider, $httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
        localStorageServiceProvider.setPrefix('PndDevCommunity');
        $routeProvider.when("/about", {
            templateUrl: 'partials/about',
            controller: 'AboutController'
        }).when("/", {
            templateUrl: 'partials/home',
            controller: 'HomeController'
        }).when("/contact", {
            templateUrl: 'partials/contact',
            controller: 'ContactController'
        }).when('/pastMeetings', {
            templateUrl: 'partials/pastMeetings',
            controller: 'PastMeetingsController'
        }).when("/brainstorming", {
            templateUrl: 'partials/brainstorming',
            controller: 'BrainstormingController'
        }).otherwise({
            redirectTo: '/'
        });
    }
    return RouteConfig;
})();

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

        setTimeout(function () {
            $('.login-nav').removeClass('login-nav');
        }, 1);
    });

    app.controller('LoginController', ['$scope', '$http', 'localStorageService', LoginController]);

    app.factory('authInterceptor', [
        '$q', 'localStorageService', function ($q, localStorageService) {
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
//# sourceMappingURL=app.js.map

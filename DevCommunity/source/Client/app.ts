///ts:import=SiteConfig
import SiteConfig = require('./SiteConfig'); ///ts:import:generated
///ts:import=IUserSvc
import IUserSvc = require('./IUserSvc'); ///ts:import:generated

$('.nav a').on('click', function () {
    if ($(".navbar-toggle").css('display') != 'none') {
        $(".navbar-toggle").trigger("click");
    }
});

class TweetController {
    constructor(private $http, private $rootScope) {
        this.getNewTweet();
    }

    public getNewTweet(): void {
        this.$http.get('/api/GetRandomTweet').success((html) => {
            $('#tweetHolder').html(html);
            this.$rootScope.$broadcast('tweetUpdated');
        });
    }
}

export class RouteConfig {
    constructor($routeProvider: ng.route.IRouteProvider) {
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
        when("/stories", {
            templateUrl: 'partials/stories',
            controller: 'StoryController'
        }).
        when("/UserSettings", {
            templateUrl: 'partials/UserSettings',
            controller: 'UserSettingsController'
        }).
        when("/meeting/:id", {
            templateUrl: 'partials/meeting/',
            controller: 'MeetingController'
        }).
        when("/story/:id", {
            templateUrl: 'partials/story/',
            controller: 'SingleStoryController'
        }).
        when("/admin", {
            templateUrl: 'partials/admin',
            controller: 'AdminController'
        }).
        when("/partials/CommentSystem.html", {
            templateUrl: 'partials/CommentSystem.html'
        }).
        when("/partials/Comment.html", {
            templateUrl: 'partials/Comment.html'
        }).
        when("/register", {
            templateUrl: 'partials/Register'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
}

export function getModuleName(): string {
    return 'devCommunity';
}

(function () {
    var app = angular.module(getModuleName(), ['LocalStorageModule', 'ngRoute', 'ngSanitize']);

    app.config(['localStorageServiceProvider', '$locationProvider', '$httpProvider', SiteConfig]);
    app.config(['$routeProvider', RouteConfig]);

    app.controller('TweetController', ['$http', '$rootScope', TweetController]);

    app.controller('AboutController', function ($scope) {
        $('.navbar-nav li.active').removeClass('active');
        $('#NavAbout').addClass('active');
    });

    app.controller('ContactController', function ($scope) {
        $('.navbar-nav li.active').removeClass('active');
        $('#NavContact').addClass('active');
    });

    app.controller('NavBarController', function ($scope, userSvc: IUserSvc) {
        $scope.logOut = function () {
            userSvc.logOut();
        };

        $scope.isLoggedIn = function () {
            return userSvc.isLoggedIn();
        };

        $scope.isAdmin = function () {
            return userSvc.isAdmin();
        };

        setTimeout( () => {$('.login-nav').removeClass('login-nav') }, 1);
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
            responseError: function (rejection) {
                return $q.reject(rejection);
            }
        };
    }]);
})();
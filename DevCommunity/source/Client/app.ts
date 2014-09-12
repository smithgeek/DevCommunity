///ts:import=Meeting
import Meeting = require('./Meeting'); ///ts:import:generated
///ts:import=IMeetingSvc
import IMeetingSvc = require('./IMeetingSvc'); ///ts:import:generated
///ts:import=IUserSvc
import IUserSvc = require('./IUserSvc'); ///ts:import:generated
///ts:import=MeetingData
import MeetingData = require('../Common/MeetingData'); ///ts:import:generated
///ts:import=Story
import Story = require('../Common/Story'); ///ts:import:generated
///ts:import=IStorySvc
import IStorySvc = require('./IStorySvc'); ///ts:import:generated
///ts:import=UserSettings
import UserSettings = require('../Common/UserSettings'); ///ts:import:generated
///ts:import=UserSvc
import UserSvc = require('./UserSvc'); ///ts:import:generated
///ts:import=MeetingSvc
import MeetingSvc = require('./MeetingSvc'); ///ts:import:generated
///ts:import=StorySvc
import StorySvc = require('./StorySvc'); ///ts:import:generated
///ts:import=HomeController
import HomeController = require('./HomeController'); ///ts:import:generated
///ts:import=StoryController
import StoryController = require('./StoryController'); ///ts:import:generated
///ts:import=MeetingController
import MeetingController = require('./MeetingController'); ///ts:import:generated
///ts:import=SingleStoryController
import SingleStoryController = require('./SingleStoryController'); ///ts:import:generated
///ts:import=PastMeetingsController
import PastMeetingsController = require('./PastMeetingsController'); ///ts:import:generated
///ts:import=AddMeetingController
import AddMeetingController = require('./AddMeetingController'); ///ts:import:generated
///ts:import=AdminController
import AdminController = require('./AdminController'); ///ts:import:generated
///ts:import=LoginController
import LoginController = require('./LoginController'); ///ts:import:generated
///ts:import=SiteConfig
import SiteConfig = require('./SiteConfig'); ///ts:import:generated
///ts:import=Browser
import Browser = require('./Impl/Browser'); ///ts:import:generated
///ts:import=StorySubmitController
import StorySubmitController = require('./StorySubmitController'); ///ts:import:generated
///ts:import=UserSettingsController
import UserSettingsController = require('./UserSettingsController'); ///ts:import:generated

$('.nav a').on('click', function () {
    if ($(".navbar-toggle").css('display') != 'none') {
        $(".navbar-toggle").trigger("click");
    }
});

class TweetController {
    constructor(private $http) {
    }

    public getNewTweet(): void {
        this.$http.get('/api/GetRandomTweet').success((html) => {
            $('#tweetHolder').html(html);
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

    app.service('userSvc', ['localStorageService', UserSvc]);

    app.service('richTextService', [Browser.CKEditorRichText]);

    app.service('meetingSvc', ['userSvc', '$http', '$rootScope', MeetingSvc]);

    app.service('storySvc', ['$rootScope', StorySvc]);

    app.service('documentLocation', [Browser.DocumentLocation]);

    app.controller('HomeController', ['$scope', '$http', 'userSvc', 'meetingSvc', 'localStorageService', 'richTextService', HomeController]);

    app.controller('StoryController', ['$scope', '$http', 'userSvc', 'storySvc', StoryController]);

    app.controller('AddMeetingController', ['$scope', '$http', 'meetingSvc', 'userSvc', 'richTextService', AddMeetingController]);

    app.controller('StorySubmitController', ['$scope', 'storySvc', '$http', 'userSvc', 'richTextService', StorySubmitController]);

    app.controller('UserSettingsController', ['$scope', '$http', 'userSvc', UserSettingsController]);

    app.controller('MeetingController', ['$scope', '$http', '$routeParams', 'meetingSvc', MeetingController]);

    app.controller('SingleStoryController', ['$scope', '$http', '$routeParams', SingleStoryController]);

    app.controller('AdminController', ['$scope', '$http', AdminController]);

    app.controller('PastMeetingsController', ['$scope', '$http', 'meetingSvc', PastMeetingsController]);

    app.controller('TweetController', ['$http', TweetController]);

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

    app.controller('LoginController', ['$scope', '$http', 'localStorageService', 'documentLocation', LoginController]);

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
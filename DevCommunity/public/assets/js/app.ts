/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angularjs/angular-route.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/bootstrap/bootstrap.d.ts" />
/// <reference path="../../../typings/readmore/readmore.d.ts" />
/// <reference path="Services.ts" />
/// <reference path="MeetingController.ts" />
/// <reference path="HomeController.ts" />
/// <reference path="StoryController.ts" />
/// <reference path="SingleStoryController.ts" />

$('.nav a').on('click', function () {
    if ($(".navbar-toggle").css('display') != 'none') {
        $(".navbar-toggle").trigger("click");
    }
});

interface IMeetingControllerScope extends ng.IScope {
    meeting: Meeting;
    errorMessage: string;
}

class AddMeetingController {
    constructor(private $scope: IMeetingControllerScope, private $http: ng.IHttpService, private meetingSvc: IMeetingSvc, private userSvc: IUserSvc) {
        $scope.meeting = meetingSvc.createMeeting();
        $scope.errorMessage = "";
        $scope.$on('editMeeting', function (event, meeting: Meeting) {
            $scope.meeting = meeting;
            CKEDITOR.instances.newIdeaDetails.setData(meeting.details);
            $('#AddTopicModal').modal('show');
            $scope.errorMessage = "";
        });
        $scope.$on('addMeeting', function (event) {
            $scope.meeting = meetingSvc.createMeeting();
            $('#AddTopicModal').modal('show');
            $scope.errorMessage = "";
        });
    }

    public AddMeeting(): void {
        $('.add-modal-button').prop('disabled', true);
        this.$scope.meeting.SetUser(this.userSvc.getUser());
        this.$scope.meeting.details = CKEDITOR.instances.newIdeaDetails.getData();
        var mtgData: MeetingData = this.$scope.meeting.GetData();
        this.$http.post('/api/restricted/AddMeeting', mtgData).success( (data: any) => {
            $('#AddTopicModal').modal('hide');
            $('.add-modal-button').prop('disabled', false);
            if (data.action == "Added") {
                this.meetingSvc.notifyMeetingAdded(data.meeting);
            }
            this.$scope.meeting = this.meetingSvc.createMeeting();
        }).error( (data) => {
            $('.add-modal-button').prop('disabled', false);
            this.$scope.errorMessage = data.toString();
        });
    }
}

interface IStorySubmitControllerScope extends ng.IScope {
    story: Story;
    errorMessage: string;
}

class StorySubmitController {
    constructor(private $scope: IStorySubmitControllerScope, private storySvc: StorySvc, private $http: ng.IHttpService, private userSvc: UserSvc) {
        $scope.story = new Story();
        $scope.$on('editStory', function (event, story: Story) {
            $scope.story = story;
            CKEDITOR.instances.storyDetails.setData(story.description);
            $('#AddStoryModal').modal('show');
            $scope.errorMessage = "";
        });
        $scope.$on('addStory', function (event) {
            $scope.story = new Story();
            CKEDITOR.instances.storyDetails.setData("");
            $('#AddStoryModal').modal('show');
            $scope.errorMessage = "";
        });
        $(document).ready(() => {
            $('#storyDetails').ckeditor();
        });
    }

    public Submit(): void {
        $('.add-modal-button').prop('disabled', true);
        this.$scope.story.submittor = this.userSvc.getUser();
        this.$scope.story.description = CKEDITOR.instances.storyDetails.getData();
        this.$http.post('/api/restricted/AddStory', this.$scope.story).success((data: any) => {
            $('#AddStoryModal').modal('hide');
            $('.add-modal-button').prop('disabled', false);
            if (data.action == "Added") {
                this.storySvc.notifyStoryAdded(data.story);
            }
            this.$scope.story = new Story();
        }).error((data) => {
                $('.add-modal-button').prop('disabled', false);
                this.$scope.errorMessage = data.toString();
            });
    }
}

interface AdminControllerScope extends ng.IScope {
    emailAddress: string;
    errorMessage: string;
    successMessage: string;
}

class AdminController {
    constructor(private $scope: AdminControllerScope, private $http: ng.IHttpService) {
        this.$scope.emailAddress = "";
        this.$scope.errorMessage = "";
        this.$scope.successMessage = "";
    }

    public Submit(): void {
        this.$scope.successMessage = "";
        this.$scope.errorMessage = "";
        $('.settings-btn').prop('disabled', true);
        this.$http.post('/api/restricted/AddUser', { user: this.$scope.emailAddress }).success((data: any) => {
            $('.settings-btn').prop('disabled', false);
            this.$scope.successMessage = data.toString();
        }).error((data) => {
                $('.settings-btn').prop('disabled', false);
                this.$scope.errorMessage = data.toString();
        });
    }
}

interface UserSettingsControllerScope extends ng.IScope {
    settings: UserSettings;
    errorMessage: string;
    successMessage: string;
}

class UserSettingsController {
    constructor(private $scope: UserSettingsControllerScope, private $http: ng.IHttpService, private userSvc: IUserSvc ) {
        $('.navbar-nav li.active').removeClass('active');
        $('#NavUserSettings').addClass('active');

        this.$scope.settings = new UserSettings();
        this.$scope.errorMessage = "";
        this.$scope.successMessage = "";

        this.$http.get('/api/restricted/GetUserSettings').success((data) => {
            if (data != "" && data != null)
                this.$scope.settings = <UserSettings>data;
        });
    }

    public isLoggedIn(): boolean {
        return this.userSvc.isLoggedIn();
    }

    public Submit(): void {
        $('.settings-btn').prop('disabled', true);
        this.$http.post('/api/restricted/SetUserSettings', this.$scope.settings).success((data: any) => {
            $('.settings-btn').prop('disabled', false);
            this.$scope.errorMessage = "";
            this.$scope.successMessage = "Settings saved.";
        }).error((data) => {
            $('.settings-btn').prop('disabled', false);
            this.$scope.successMessage = "";
            this.$scope.errorMessage = data.toString();
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
                this.$scope.message = "";
            })
            .error( (data, status, headers, config) => {
                this.localStorageService.remove('userToken');
                this.localStorageService.remove('userEmail');
                this.$scope.message = data;
            });
    }

    public submitVerification(): void {
        this.$http.post('/verify', this.$scope.user)
            .success( (data, status, headers, config) => {
                this.localStorageService.set('userToken', data.token);
                this.localStorageService.set('userEmail', this.$scope.user);
                this.close();
                location.reload();
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

class SiteConfig {
    constructor(localStorageServiceProvider, $locationProvider: ng.ILocationProvider, $httpProvider: ng.IHttpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
        localStorageServiceProvider.setPrefix('PndDevCommunity');
        $locationProvider.hashPrefix('!');
    }
}

class RouteConfig {
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
        when("/brainstorming", {
            templateUrl: 'partials/brainstorming',
            controller: 'BrainstormingController'
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

(function () {
    var app = angular.module('devCommunity', ['LocalStorageModule', 'ngRoute', 'ngSanitize']);

    app.directive('dirDisqus', ['$window', function ($window) {
        return {
            restrict: 'E',
            scope: {
                disqus_shortname: '@disqusShortname',
                disqus_identifier: '@disqusIdentifier',
                disqus_title: '@disqusTitle',
                disqus_url: '@disqusUrl',
                disqus_category_id: '@disqusCategoryId',
                disqus_disable_mobile: '@disqusDisableMobile',
                readyToBind: "@"
            },
            template: '<div id="disqus_thread"></div><a href="http://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a>',
            link: function (scope) {
                // ensure that the disqus_identifier and disqus_url are both set, otherwise we will run in to identifier conflicts when using URLs with "#" in them
                // see http://help.disqus.com/customer/portal/articles/662547-why-are-the-same-comments-showing-up-on-multiple-pages-
                if (typeof scope.disqus_identifier === 'undefined' || typeof scope.disqus_url === 'undefined') {
                    throw "Please ensure that the `disqus-identifier` and `disqus-url` attributes are both set.";
                }

                scope.$watch("readyToBind", function (isReady) {
                    // If the directive has been called without the 'ready-to-bind' attribute, we
                    // set the default to "true" so that Disqus will be loaded straight away.
                    if (!angular.isDefined(isReady)) {
                        isReady = "true";
                    }
                    if (scope.$eval(isReady)) {
                        // put the config variables into separate global vars so that the Disqus script can see them
                        $window.disqus_shortname = scope.disqus_shortname;
                        $window.disqus_identifier = scope.disqus_identifier;
                        $window.disqus_title = scope.disqus_title;
                        $window.disqus_url = scope.disqus_url;
                        $window.disqus_category_id = scope.disqus_category_id;
                        $window.disqus_disable_mobile = scope.disqus_disable_mobile;

                        // get the remote Disqus script and insert it into the DOM, but only if it not already loaded (as that will cause warnings)
                        if (!$window.DISQUS) {
                            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
                            dsq.src = '//' + scope.disqus_shortname + '.disqus.com/embed.js';
                            var head: HTMLHeadElement = document.getElementsByTagName('head')[0];
                            var body: HTMLBodyElement = document.getElementsByTagName('body')[0];
                            if(null != head ){
                                head.appendChild(dsq);
                            }
                            else if (null != body) {
                                body.appendChild(dsq);
                            }
                        } else {
                            $window.DISQUS.reset({
                                reload: true,
                                config: function () {
                                    this.page.identifier = scope.disqus_identifier;
                                    this.page.url = scope.disqus_url;
                                    this.page.title = scope.disqus_title;
                                }
                            });
                        }
                    }
                });
            }
        };
    }]);

    app.config(['localStorageServiceProvider', '$locationProvider', '$httpProvider', SiteConfig]);
    app.config(['$routeProvider', RouteConfig]);

    app.service('userSvc', ['localStorageService', UserSvc]);

    app.service('meetingSvc', ['userSvc', '$http', '$rootScope', MeetingSvc]);

    app.service('storySvc', ['$rootScope', StorySvc]);

    app.controller('HomeController', ['$scope', '$http', 'userSvc', 'meetingSvc', 'localStorageService', HomeController]);

    app.controller('StoryController', ['$scope', '$http', 'userSvc', 'storySvc', StoryController]);

    app.controller('AddMeetingController', ['$scope', '$http', 'meetingSvc', 'userSvc', AddMeetingController]);

    app.controller('StorySubmitController', ['$scope', 'storySvc', '$http', 'userSvc', StorySubmitController]);

    app.controller('UserSettingsController', ['$scope', '$http', 'userSvc', UserSettingsController]);

    app.controller('MeetingController', ['$scope', '$http', '$routeParams', 'meetingSvc', MeetingController]);

    app.controller('SingleStoryController', ['$scope', '$http', '$routeParams', SingleStoryController]);

    app.controller('AdminController', ['$scope', '$http', AdminController]);

    app.controller('PastMeetingsController', ['$scope', '$http', 'meetingSvc', PastMeetingsController]);

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
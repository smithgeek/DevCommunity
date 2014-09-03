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
/// <reference path="Impl/Browser.ts" />

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
    constructor(private $scope: IMeetingControllerScope, private $http: ng.IHttpService, private meetingSvc: IMeetingSvc, private userSvc: IUserSvc, private rtb: IRichTextEditor) {
        this.rtb.setId('newIdeaDetails');
        $scope.meeting = meetingSvc.createMeeting();
        $scope.errorMessage = "";
        $scope.$on('editMeeting', (event, meeting: Meeting) => {
            $scope.meeting = meeting;
            this.rtb.setText(meeting.details);
            $('#AddTopicModal').modal('show');
            $scope.errorMessage = "";
        });
        $scope.$on('addMeeting', (event) => {
            $scope.meeting = meetingSvc.createMeeting();
            $('#AddTopicModal').modal('show');
            $scope.errorMessage = "";
        });
    }

    public AddMeeting(): void {
        $('.add-modal-button').prop('disabled', true);
        this.$scope.meeting.SetUser(this.userSvc.getUser());
        this.$scope.meeting.details = this.rtb.getText();
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
    constructor(private $scope: IStorySubmitControllerScope, private storySvc: IStorySvc, private $http: ng.IHttpService, private userSvc: IUserSvc, private rtb: IRichTextEditor) {
        $scope.story = new Story();
        this.rtb.setId("storyDetails");
        this.$scope.errorMessage = '';
        $scope.$on('editStory', (event, story: Story) => {
            $scope.story = story;
            this.rtb.setText(story.description);
            $('#AddStoryModal').modal('show');
            $scope.errorMessage = "";
        });
        $scope.$on('addStory', (event) => {
            $scope.story = new Story();
            this.rtb.setText("");
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
        this.$scope.story.description = this.rtb.getText();
        this.$http.post('/api/restricted/AddStory', this.$scope.story).success((data: any) => {
            $('#AddStoryModal').modal('hide');
            $('.add-modal-button').prop('disabled', false);
            if (data.action == "Added") {
                this.storySvc.notifyStoryAdded(data.story);
            }
            this.$scope.errorMessage = '';
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
    tweetErrorMessage: string;
    tweetSuccessMessage: string;
    tweetEmbedCode: string;
}

class AdminController {
    constructor(private $scope: AdminControllerScope, private $http: ng.IHttpService) {
        this.$scope.emailAddress = "";
        this.$scope.errorMessage = "";
        this.$scope.successMessage = "";
        this.$scope.tweetSuccessMessage = "";
        this.$scope.tweetErrorMessage = "";
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

    public AddTweet(): void {
        this.$scope.tweetSuccessMessage = "";
        this.$scope.tweetErrorMessage = "";
        $('.settings-btn').prop('disabled', true);
        this.$http.post('/api/restricted/AddTweet', { embedCode: this.$scope.tweetEmbedCode }).success((data: any) => {
            $('.settings-btn').prop('disabled', false);
            this.$scope.tweetSuccessMessage = data.toString();
            this.$scope.tweetEmbedCode = "";
        }).error((data) => {
            $('.settings-btn').prop('disabled', false);
            this.$scope.tweetErrorMessage = data.toString();
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
    constructor(private $scope: ILoginControllerScope, private $http, private localStorageService, private location: IDocumentLocation) {
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
                this.location.reload();
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

    app.config(['localStorageServiceProvider', '$locationProvider', '$httpProvider', SiteConfig]);
    app.config(['$routeProvider', RouteConfig]);

    app.service('userSvc', ['localStorageService', UserSvc]);

    app.service('richTextService', [CKEditorRichText]);

    app.service('meetingSvc', ['userSvc', '$http', '$rootScope', MeetingSvc]);

    app.service('storySvc', ['$rootScope', StorySvc]);

    app.service('documentLocation', [DocumentLocation]);

    app.controller('HomeController', ['$scope', '$http', 'userSvc', 'meetingSvc', 'localStorageService', HomeController]);

    app.controller('StoryController', ['$scope', '$http', 'userSvc', 'storySvc', StoryController]);

    app.controller('AddMeetingController', ['$scope', '$http', 'meetingSvc', 'userSvc', 'richTextService', AddMeetingController]);

    app.controller('StorySubmitController', ['$scope', 'storySvc', '$http', 'userSvc', 'richTextService', StorySubmitController]);

    app.controller('UserSettingsController', ['$scope', '$http', 'userSvc', UserSettingsController]);

    app.controller('MeetingController', ['$scope', '$http', '$routeParams', 'meetingSvc', MeetingController]);

    app.controller('SingleStoryController', ['$scope', '$http', '$routeParams', SingleStoryController]);

    app.controller('AdminController', ['$scope', '$http', AdminController]);

    app.controller('PastMeetingsController', ['$scope', '$http', 'meetingSvc', PastMeetingsController]);

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
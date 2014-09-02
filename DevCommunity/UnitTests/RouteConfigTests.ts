/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/expect.js/expect.js.d.ts" />
/// <reference path="../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../public/assets/js/app.ts" />

describe("RouteConfig", function () {
    it("About", function () {
        module('devCommunity');
        inject(function ($route) {
            expect($route.routes['/about'].controller).to.be('AboutController');
            expect($route.routes['/about'].templateUrl).to.be('partials/about');
        });
    });

    it("Home", function () {
        module('devCommunity');
        inject(function ($route) {
            expect($route.routes['/'].controller).to.be('HomeController');
            expect($route.routes['/'].templateUrl).to.be('partials/home');
        });
    });

    it("Contact", function () {
        module('devCommunity');
        inject(function ($route) {
            expect($route.routes['/contact'].controller).to.be('ContactController');
            expect($route.routes['/contact'].templateUrl).to.be('partials/contact');
        });
    });

    it("PastMeetings", function () {
        module('devCommunity');
        inject(function ($route) {
            expect($route.routes['/pastMeetings'].controller).to.be('PastMeetingsController');
            expect($route.routes['/pastMeetings'].templateUrl).to.be('partials/pastMeetings');
        });
    });

    it("Story", function () {
        module('devCommunity');
        inject(function ($route) {
            expect($route.routes['/stories'].controller).to.be('StoryController');
            expect($route.routes['/stories'].templateUrl).to.be('partials/stories');
        });
    });

    it("UserSettings", function () {
        module('devCommunity');
        inject(function ($route) {
            expect($route.routes['/UserSettings'].controller).to.be('UserSettingsController');
            expect($route.routes['/UserSettings'].templateUrl).to.be('partials/UserSettings');
        });
    });

    it("Meeting", function () {
        module('devCommunity');
        inject(function ($route) {
            expect($route.routes['/meeting/:id'].controller).to.be('MeetingController');
            expect($route.routes['/meeting/:id'].templateUrl).to.be('partials/meeting/');
        });
    });

    it("SingleStory", function () {
        module('devCommunity');
        inject(function ($route) {
            expect($route.routes['/story/:id'].controller).to.be('SingleStoryController');
            expect($route.routes['/story/:id'].templateUrl).to.be('partials/story/');
        });
    });

    it("Admin", function () {
        module('devCommunity');
        inject(function ($route) {
            expect($route.routes['/admin'].controller).to.be('AdminController');
            expect($route.routes['/admin'].templateUrl).to.be('partials/admin');
        });
    });
});
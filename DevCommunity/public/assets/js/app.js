(function () {
    var app = angular.module('devCommunity', ['LocalStorageModule', 'ngRoute']);

    app.controller('HomeController', function($scope){
        $('.panel-body').readmore({
            maxHeight: 60,
            moreLink: '<a href="#" class="readmore-link">More</a>',
            lessLink: '<a href="#" class="readmore-link">Close</a>',
            speed: 500
        });

        $('.navbar-nav li.active').removeClass('active');
        $('#NavHome').addClass('active');

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
            otherwise({
                redirectTo: '/'
                });
            //$locationProvider.html5Mode(true);
        }
    ]);
    
})();
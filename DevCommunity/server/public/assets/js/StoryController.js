/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/bootstrap/bootstrap.d.ts" />
/// <reference path="../../../typings/readmore/readmore.d.ts" />
/// <reference path="../../../typings/ckeditor/ckeditor.d.ts" />
/// <reference path="Services.ts" />
/// <reference path="Story.ts" />
var StoryController = (function () {
    function StoryController($scope, $http, userSvc, storySvc) {
        this.userSvc = userSvc;
        this.storySvc = storySvc;
        $('.navbar-nav li.active').removeClass('active');
        $('#NavStories').addClass('active');

        $scope.stories = [];
        $scope.$on('storyAdded', function (event, story) {
            $scope.stories.push(story);
        });

        $http.get('/api/GetStories').success(function (data) {
            for (var i = 0; i < data.length; ++i) {
                $scope.stories.push(data[i]);
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
    }
    StoryController.prototype.SubmitStory = function () {
        if (this.userSvc.isLoggedIn()) {
            this.storySvc.notifyAddStory();
        } else
            $('#LoginModal').modal('show');
    };

    StoryController.prototype.EditStory = function (story) {
        this.storySvc.notifyEditStory(story);
    };

    StoryController.prototype.isUserSubmittor = function (story) {
        return this.userSvc.getUser() == story.submittor && story.submittor != "";
    };

    StoryController.prototype.getHumanTime = function (story) {
        var date = new Date(story.timestamp);
        return date.toLocaleDateString();
    };
    return StoryController;
})();
//# sourceMappingURL=StoryController.js.map

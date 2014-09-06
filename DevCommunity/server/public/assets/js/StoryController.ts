/// <reference path="../../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../../typings/bootstrap/bootstrap.d.ts" />
/// <reference path="../../../../typings/readmore/readmore.d.ts" />
/// <reference path="../../../../typings/ckeditor/ckeditor.d.ts" />
/// <reference path="Services.ts" />
/// <reference path="Story.ts" />

interface StoryControllerScope extends ng.IScope {
    stories: Array<Story>;
}

class StoryController {
    constructor($scope: StoryControllerScope, $http: ng.IHttpService, private userSvc: IUserSvc, private storySvc: IStorySvc) {
        $('.navbar-nav li.active').removeClass('active');
        $('#NavStories').addClass('active');

        $scope.stories = [];
        $scope.$on('storyAdded', function (event, story) {
            $scope.stories.push(story);
        });

        $http.get('/api/GetStories').success((data: Array<Story>) => {
            for (var i = 0; i < data.length; ++i) {
                $scope.stories.push(data[i]);
            }

            setTimeout(()=> {
                $('.panel-body').readmore({
                    maxHeight: 60,
                    moreLink: '<a href="#" class="readmore-link">More</a>',
                    lessLink: '<a href="#" class="readmore-link">Close</a>',
                    speed: 500
                });
            }, 1);

        });
    }

    public SubmitStory(): void {
        if (this.userSvc.isLoggedIn()) {
            this.storySvc.notifyAddStory();
        }
        else
            $('#LoginModal').modal('show');
    }

    public EditStory(story: Story): void {
        this.storySvc.notifyEditStory(story);
    }

    public isUserSubmittor(story: Story): boolean {
        return this.userSvc.getUser() == story.submittor && story.submittor != "";
    }

    public getHumanTime(story): string {
        var date = new Date(story.timestamp);
        return date.toLocaleDateString();
    }
}

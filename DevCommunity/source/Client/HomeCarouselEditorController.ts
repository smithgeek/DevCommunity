///ts:import=app
import app = require('./app'); ///ts:import:generated


class HomeCarouselEditorController {
    constructor(private $scope, private $http: ng.IHttpService) {
        this.$scope.carouselErrorMessage = "";
        this.$scope.carouselSuccessMessage = "";

        $http.get('/api/restricted/GetCarousel').success((data: string) => {
            this.$scope.jadeText = data;
            this.renderPreview();
        }).error(() => {
            this.$scope.jadeText = "Error getting carousel";
        });
    }

    public renderPreview() {
        this.$http.post('/api/restricted/RenderJade', { jade: this.$scope.jadeText }).success((data: string) => {
            $("#CarouselPreview")[0].innerHTML = data;
        });
    }

    public renderItemPreview() {
        this.$http.post('/api/restricted/RenderJade', { jade: this.$scope.itemJadeText }).success((data: string) => {
            $("#ItemCarouselPreview")[0].innerHTML = data;
        });
    }

    public insertTweet() {
        this.$scope.itemJadeText = ".item.active\n  .row\n    .col-md-12\n      div(ng-controller='TweetController as controller')\n        h3 Random Tweet\n          button.editable(ng-click='controller.getNewTweet()')\n            span.glyphicon.glyphicon-refresh\n        div(id='tweetHolder')";
    }

    public insertEmbeddedVideo() {
        this.$scope.itemJadeText = '.item\n  .row\n    .col-sm-4.visible-lg\n      div\n        iframe(src="//www.youtube-nocookie.com/embed/dQw4w9WgXcQ" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen)\n    .col-md-8\n      h3 \n        a(href="INSERT_URL_TO_PAGE_HERE") INSERT_TEXT_LINK_HERE\n      p.jumbotron-small-text\n        | INSERT_DESCRIPTION_HERE\n  .carousel-caption\n    p INSERT_CAPTION_HERE';
    }

    public insertText() {
        this.$scope.itemJadeText = '.item\n  .row\n    .col-md-12\n      h3 \n        a(href="INSERT_LINK_HERE") INSERT_HEADER_TEXT_HERE\n      p.jumbotron-small-text(style="white-space:pre;")\n        | INSERT_TEXT\n        | INSERT_MORE_TEXT\n  .carousel-caption\n    p INSERT_CAPTION';
    }

    public saveCarousel() {
        this.$scope.carouselErrorMessage = "";
        this.$scope.carouselSuccessMessage = "";

        this.$http.post('/api/restricted/SaveCarousel', { jade: this.$scope.jadeText }).success((msg: string) => {
            this.$scope.carouselSuccessMessage = msg;
        }).error((msg: string) => {
            this.$scope.carouselErrorMessage = msg;
        });
    }
}

angular.module(app.getModuleName()).controller('HomeCarouselEditorController', ['$scope', '$http', HomeCarouselEditorController]);

export = HomeCarouselEditorController;
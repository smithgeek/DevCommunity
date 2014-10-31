///ts:import=Story
import Story = require('../Common/Story'); ///ts:import:generated
///ts:import=app
import app = require('./app'); ///ts:import:generated

class SingleStoryController {

    constructor($scope, $http: ng.IHttpService, $routeParams) {
        $('.navbar-nav li.active').removeClass('active');
        $scope.contentLoaded = false;
        $scope.modifiedTime = "";

        $http.get('/api/GetStoryById/' + $routeParams.id).success((data: Story) => {
            $scope.story = data;
            $('.hidden').removeClass('hidden');
            $scope.modifiedTime = this.getHumanTime(data);
            $scope.contentLoaded = true;
        });
    }

    public getHumanTime(story: Story): string {
        var date = new Date(story.timestamp);
        return date.toLocaleDateString();
    }
}

angular.module(app.getModuleName()).controller('SingleStoryController', ['$scope', '$http', '$routeParams', SingleStoryController]);

export = SingleStoryController;
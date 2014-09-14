///ts:import=Story
import Story = require('../Common/Story'); ///ts:import:generated
///ts:import=app
import app = require('./app'); ///ts:import:generated

class SingleStoryController {

    constructor($scope, $http: ng.IHttpService, $routeParams) {
        $('.navbar-nav li.active').removeClass('active');
        $scope.contentLoaded = false;

        $http.get('/api/GetStoryById/' + $routeParams.id).success((data: Story) => {
            $scope.story = data;
            $('.hidden').removeClass('hidden');
            $scope.contentLoaded = true;
        });
    }
}

angular.module(app.getModuleName()).controller('SingleStoryController', ['$scope', '$http', '$routeParams', SingleStoryController]);

export = SingleStoryController;
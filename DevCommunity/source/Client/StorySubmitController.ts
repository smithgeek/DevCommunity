///ts:import=IStorySubmitControllerScope
import IStorySubmitControllerScope = require('./IStorySubmitControllerScope'); ///ts:import:generated
///ts:import=IStorySvc
import IStorySvc = require('./IStorySvc'); ///ts:import:generated
///ts:import=IUserSvc
import IUserSvc = require('./IUserSvc'); ///ts:import:generated
///ts:import=Story
import Story = require('../Common/Story'); ///ts:import:generated
///ts:import=Browser
import Browser = require('./Impl/Browser'); ///ts:import:generated
///ts:import=app
import app = require('./app'); ///ts:import:generated

class StorySubmitController {
    constructor(private $scope: IStorySubmitControllerScope, private storySvc: IStorySvc, private $http: ng.IHttpService, private userSvc: IUserSvc, private rtb: Browser.IRichTextEditor) {
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
            rtb.initEditor();
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

angular.module(app.getModuleName()).controller('StorySubmitController', ['$scope', 'storySvc', '$http', 'userSvc', 'richTextService', StorySubmitController]);

export = StorySubmitController;
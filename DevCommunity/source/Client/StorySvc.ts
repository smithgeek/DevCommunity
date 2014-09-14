///ts:import=IStorySvc
import IStorySvc = require('./IStorySvc'); ///ts:import:generated
///ts:import=Story
import Story = require('../Common/Story'); ///ts:import:generated
///ts:import=app
import app = require('./app'); ///ts:import:generated

class StorySvc implements IStorySvc {
    constructor(private $rootScope) {
    }

    public notifyStoryAdded(story: Story): void {
        this.$rootScope.$broadcast('storyAdded', story);
    }

    public notifyAddStory(): void {
        this.$rootScope.$broadcast('addStory');
    }

    public notifyEditStory(story: Story): void {
        this.$rootScope.$broadcast('editStory', story);
    }
}

angular.module(app.getModuleName()).service('storySvc', ['$rootScope', StorySvc]);

export = StorySvc;
///ts:import=Story
import Story = require('../Common/Story'); ///ts:import:generated

interface StoryControllerScope extends ng.IScope {
    stories: Array<Story>;
}
export = StoryControllerScope;
///ts:import=Story
import Story = require('../Common/Story'); ///ts:import:generated

interface IStorySvc {
    notifyStoryAdded(story: Story): void;

    notifyAddStory(): void;

    notifyEditStory(story: Story): void;
}
export = IStorySvc;
///ts:import=NewsletterTransport
import NewsletterTransport = require('../Common/NewsletterTransport'); ///ts:import:generated
///ts:import=Meeting
import Meeting = require('./Meeting'); ///ts:import:generated
///ts:import=Story
import Story = require('../Common/Story'); ///ts:import:generated

interface AdminNewsletterControllerScope extends ng.IScope {
    meetings: Array<Meeting>;
    stories: Array<Story>;
    lastMeeting: Meeting;
    date: string;
    hasPreview: boolean;
    newsletter: any;
    NewsletterErrorMessage: string;
    NewsletterSuccessMessage: string;
}

export = AdminNewsletterControllerScope;

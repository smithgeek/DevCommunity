///ts:import=Twitter
import Twitter = require('../Twitter'); ///ts:import:generated
///ts:import=Site
import Site = require('../../Common/Site'); ///ts:import:generated
///ts:import=WebsiteVisitorFactory
import WebsiteVisitorFactory = require('../WebsiteVisitorFactory'); ///ts:import:generated

import express = require('express');
var config: Site.Config;
var jwt = require('jsonwebtoken');
var twitter: Twitter;
var visitorFactory: WebsiteVisitorFactory;

export function setTwitterInstance(t: Twitter) {
    twitter = t;
}

export function setConfig(c: Site.Config) {
    config = c;
}

export function setVisitorFactory(factory: WebsiteVisitorFactory) {
    visitorFactory = factory;
}

function isAdmin(req): boolean {
    if (config.server.admin == "") {
        return true;
    }
    if (req.headers.authorization) {
        var visitor = visitorFactory.getByEmail(jwt.decode(req.headers.authorization.substr(7)).email);
        return visitor.isAdmin();
    }
    else
        return false;
}

export function index(req: express.Request, res: express.Response) {
    res.render('index', { pathToAssets: 'public', config: config.nav });
};

export function home(req: express.Request, res: express.Response) {
    if (config.nav.showRandomTweets) {
        twitter.getRandomTweet(function (html) {
            if (html == '') {
                res.render('partials/home', { admin: isAdmin(req), showTweet: false, tweetHtml: '' });
            }
            else {
                res.render('partials/home', { admin: isAdmin(req), showTweet: true, tweetHtml: html });
            }
        });
    }
    else {
        res.render('partials/home', { admin: isAdmin(req), showTweet: false, tweetHtml: '' });
    }
};

export function about(req: express.Request, res: express.Response) {
  res.render('partials/about');
};

export function contact(req: express.Request, res: express.Response) {
  res.render('partials/contact', { contact: config.contact });
};

export function brainstorming(req: express.Request, res: express.Response) {
    res.render('partials/brainstorming');
};

export function pastMeetings(req: express.Request, res: express.Response) {
    res.render('partials/pastMeetings');
};

export function stories(req: express.Request, res: express.Response) {
    res.render('partials/stories', { disqus: config.disqus });
};

export function UserSettings(req: express.Request, res: express.Response) {
    res.render('partials/UserSettings');
};

export function meeting(req: express.Request, res: express.Response) {
    res.render('partials/meeting', { disqus: config.disqus });
};

export function story(req: express.Request, res: express.Response) {
    res.render('partials/story', { disqus: config.disqus });
};

export function admin(req: express.Request, res: express.Response) {
    res.render('partials/admin', { admin: isAdmin(req) });
};
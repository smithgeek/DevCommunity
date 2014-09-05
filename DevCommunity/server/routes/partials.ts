
/*
 * GET partials page.
 */
import express = require('express');
import Twitter = require('../Twitter');
var config = require('../config/config.js');
var jwt = require('jsonwebtoken');
var twitter: Twitter.store;

export function setTwitterInstance(t: Twitter.store) {
    twitter = t;
}

function isAdmin(req): boolean {
    if (req.headers.authorization)
        return config.server.admin == jwt.decode(req.headers.authorization.substr(7)).email;
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
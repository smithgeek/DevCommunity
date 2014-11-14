///ts:import=Site
import Site = require('../../Common/Site'); ///ts:import:generated
///ts:import=WebsiteVisitorFactory
import WebsiteVisitorFactory = require('../WebsiteVisitorFactory'); ///ts:import:generated

import express = require('express');
var config: Site.Config;
var jwt = require('jsonwebtoken');
var visitorFactory: WebsiteVisitorFactory;

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
    res.render('partials/home', { admin: isAdmin(req) });
};

export function about(req: express.Request, res: express.Response) {
  res.render('partials/about');
};

export function win(req: express.Request, res: express.Response) {
    res.redirect('#!/register');
};

export function register(req: express.Request, res: express.Response) {
    res.render('partials/register');
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

export function commentSystem(req: express.Request, res: express.Response) {
    res.render('partials/CommentSystem');
}

export function comment(req: express.Request, res: express.Response) {
    res.render('partials/Comment');
}

export function commentForm(req: express.Request, res: express.Response) {
    res.render('partials/CommentForm');
}
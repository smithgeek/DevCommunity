
/*
 * GET partials page.
 */
import express = require('express');
var config = require('../config.js');

export function home(req: express.Request, res: express.Response) {
    res.render('partials/home', {
        title: 'Test',
        pathToAssets: 'public',
        lastMeetingTitle: 'Demanding Professionalism in Software Development',
        description: 'Robert C. Martin explains in his own unique style why professionalism is so important for software development teams and their managers.',
        preview: 'iframe width="280" height="158" src="//www.youtube-nocookie.com/embed/p0O1VVqRSK0" frameborder="0" allowfullscreen'
    });
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

/*
 * GET home page.
 */

var config = require('./config.js');

exports.home = function(req, res){
  res.render('partials/home', { title: 'Test', pathToAssets: 'public', lastMeetingTitle: 'Demanding Professionalism in Software Development', description: 'Robert C. Martin explains in his own unique style why professionalism is so important for software development teams and their managers.', preview: 'iframe width="280" height="158" src="//www.youtube-nocookie.com/embed/p0O1VVqRSK0" frameborder="0" allowfullscreen' });
};

exports.about = function(req, res){
  res.render('partials/about');
};

exports.contact = function(req, res){
  res.render('partials/contact', { contact: config.contact });
};
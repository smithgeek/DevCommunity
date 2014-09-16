DevCommunity
============
[![Build Status](https://travis-ci.org/brentosmith/DevCommunity.svg?branch=master)](https://travis-ci.org/brentosmith/DevCommunity)
[![Coverage Status](https://img.shields.io/coveralls/brentosmith/DevCommunity.svg)](https://coveralls.io/r/brentosmith/DevCommunity?branch=master)
Prerequisites
============
[Node](http://nodejs.org/) must be installed

Dev Installation
============
Once you have project cloned open a command prompt at the DevCommunity directory.   Then install all of the dependencies and grunt (for building) using npm. 
```javascript
npm install
npm install -g grunt-cli
```

Building
============
To compile the typescript files into javascript just run
```javascript
grunt build
```
or if this is for a production server you can build release to minify the client javascrit
```javascript
grunt build_rel
```

All the files are output to the site directory where the other resources exist.

Running
============
Now you are ready to run the server, the first thing you should do is set up the site configuration.

1. First start the server
```javascript
npm start
```

2. Login to the site, the default admin account is "admin@admin.com" and a blank verification code.
3. Now that you are logged in click on the admin tab and set up the site configuration as you wish.  Once the config is updated verification codes will be required to log in.

Running Tests
============
Unit tests are run on every commit using travis-ci and can be run manually by running
```javascript
npm test
```
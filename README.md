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
The next thing you need to do is set up the configuration file.  A config-example.js file exists in the repo and you just need to rename that to config.js.  Then adjust all of the options to suit your needs.

Once you get through all that it should be ready to go and you can start the node server by going back to the command prompt and running
```javascript
npm start
```

Running Tests
============
Unit tests are run on every commit using travis-ci and can be run manually by running
```javascript
npm test
```
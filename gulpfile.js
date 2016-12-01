'use strict';
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var saucelabs = require('./index');

var packageJSON = require('./package.json');

var browsers = [
        { browserName: 'googlechrome', platform: 'linux' }
];

function callbackSuccess(status) {
    if(!status) {
        throw new $.gutil.PluginError({
            plugin: 'gulp-saucelabs',
            message: 'Tests failed'
        });
    }
}

function callbackFail(status) {
    if(status) {
        throw new $.gutil.PluginError({
            plugin: 'gulp-saucelabs',
            message: 'Tests failed'
        });
    }
}

var config = {
    qunit: {
        build: 'NONAME',
        framework: 'qunit',
        urls: ['http://localhost:3000/test/qunit/index.html'],
        onTestSuiteComplete: callbackSuccess,
        browsers
    },
    qunitFail: {
        build: 'NONAME',
        framework: 'qunit',
        urls: ['http://localhost:3000/test/qunit/fails.html'],
        onTestSuiteComplete: callbackFail,
        browsers
    },
    jasmine: {
        build: 'NONAME',
        framework: 'jasmine',
        urls: ['http://localhost:3000/test/jasmine/succeeds.html'],
        onTestSuiteComplete: callbackSuccess,
        browsers
    },
    jasmineFail: {
        build: 'NONAME',
        framework: 'jasmine',
        urls: ['http://localhost:3000/test/jasmine/fails.html'],
        onTestSuiteComplete: callbackFail,
        browsers
    },
    mocha: {
        build: 'NONAME',
        framework: 'mocha',
        urls: ['http://localhost:3000/test/mocha/test/browser/index.html'],
        onTestSuiteComplete: callbackSuccess,
        browsers
    },
    mochaFail: {
        build: 'NONAME',
        framework: 'mocha',
        urls: ['http://localhost:3000/test/mocha/test/browser/fails.html'],
        onTestSuiteComplete: callbackFail,
        browsers
    },
    yui: {
        build: 'NONAME',
        framework: 'yui',
        urls: ['http://localhost:3000/test/yui/index.html'],
        onTestSuiteComplete: callbackSuccess,
        browsers
    }
}

var testCases = Object.keys(config);

gulp.task('default', ['connect'], () => {
    return saucelabs(config.qunit)
        .then(() => saucelabs(config.qunitFail))
        .then(() => saucelabs(config.jasmine))
        .then(() => saucelabs(config.jasmineFail))
        .then(() => saucelabs(config.mocha))
        .then(() => saucelabs(config.mochaFail))
        .then(() => saucelabs(config.yui))
});

// Start local http server
gulp.task('connect', () => {
    plugins.connect.server({ port: 3000, root: './' });
});

// Close down the http server
gulp.task('disconnect', () => {
    plugins.connect.serverClose();
});

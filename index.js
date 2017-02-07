var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var Q = require('q');

module.exports = function(config) {
    var framework = (config) ? config.framework : undefined;
    var sauce = require('./tasks/saucelabs')(gulp, plugins, config)

    var callbackDone = function(deferred) {
        return function(passed) {
            if (config && typeof config.onTestSuiteComplete === 'function'){
                config.onTestSuiteComplete(passed)
            }
            deferred.resolve();
        }
    }

    var callbackExcept = function(deferred) {
        return function() {
            if (config && typeof config.onException === 'function'){
                config.onException()
            }
            deferred.resolve();
        }
    }

    if(!framework) {
        throw new plugins.util.PluginError('gulp-saucelabs', {
            message: 'Framework not specified.'
        })
    }

    var deferred = Q.defer();
    sauce(framework, callbackDone(deferred), callbackExcept(deferred))

    return deferred.promise;

}

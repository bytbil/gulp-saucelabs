var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var Q = require('q');

module.exports = function(config) {
    var framework = (config) ? config.framework : undefined;
    var sauce = require('./tasks/saucelabs')(gulp, plugins, config)

    var callback = function(deferred) {
        return function(passed) {
            if(config && typeof config.onTestSuiteComplete === 'function'){
                config.onTestSuiteComplete(passed)
            }
            deferred.resolve()
        }
    }

    if(!framework) {
        throw new plugins.util.PluginError('gulp-saucelabs', {
            message: 'Framework not specified.'
        })
    }

    var deferred = Q.defer();
    sauce(framework, callback(deferred))

    return deferred.promise;

}



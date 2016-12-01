'use strict';

module.exports = function (gulp, plugins, config) {
    var Q = require('q');
    var SauceTunnel = require('sauce-connect-tunnel');
    var TestRunner = require('../src/TestRunner')(gulp);
    var colors = plugins.util.colors
    var SUCCESS = 'ok'
    var ERROR = 'error'
    var WARN = 'warning'

    var log = function (title, text, level) {
        if (level === 'ok') {
            plugins.util.log(colors.green(title), text)
        } else if (level === 'error') {
            plugins.util.log(colors.red(title), text)
        } else if (level === 'warning') {
            plugins.util.log(colors.yellow(title), text)
        } else {
            plugins.util.log(title)
        }
    }

    Q.longStackSupport = true;

    function reportProgress(notification) {
        switch (notification.type) {
            case 'tunnelOpen':
                log('=> Starting Tunnel to Sauce Labs');
                break;
            case 'tunnelOpened':
                log('Connected to Saucelabs');
                break;
            case 'tunnelClose':
                log('=> Stopping Tunnel to Sauce Labs');
                break;
            case 'tunnelEvent':
                if (notification.verbose) {
                    plugins.debug(notification.text);
                } else {
                    plugins.debug(notification.text);
                }
                break;
            case 'jobStarted':
                log(notification.startedJobs + '/' + notification.numberOfJobs + ' tests started');
                break;
            case 'jobCompleted':
                var STATUS = (notification.passed) ? SUCCESS : ERROR;

                log('Tested: ' + notification.url);
                log('Platform: ' + notification.platform);

                if (notification.tunnelId && unsupportedPort(notification.url)) {
                    log('Warning:', 'This url might use a port that is not proxied by Sauce Connect.', WARN);
                }

                log('Passed: ', + notification.passed, STATUS);
                log('Url: ' + notification.jobUrl);
                break;
            case 'testCompleted':
                if (notification.passed) {
                    log('OK:', 'All tests completed with status ' + notification.passed, SUCCESS);
                } else {
                    log('FAIL:', 'All tests completed with status', ERROR);
                }
                break;
            case 'retrying':
                plugins.debug('Timed out, retrying URL ' + notification.url + ' on browser ' + JSON.stringify(notification.browser));
                break;
            default:
                log('Error:', 'Unexpected notification type', ERROR);
        }
    }

    function createTunnel(arg) {
        var tunnel;

        reportProgress({
            type: 'tunnelOpen'
        });

        tunnel = new SauceTunnel(arg.username, arg.key, arg.identifier, true, ['-P', '0'].concat(arg.tunnelArgs));

        ['write', 'writeln', 'error', 'ok', 'debug'].forEach(function (method) {
            tunnel.on('log:' + method, function (text) {
                reportProgress({
                    type: 'tunnelEvent',
                    verbose: false,
                    method: method,
                    text: text
                });
            });
            tunnel.on('verbose:' + method, function (text) {
                reportProgress({
                    type: 'tunnelEvent',
                    verbose: true,
                    method: method,
                    text: text
                });
            });
        });

        return tunnel;
    }

    function runTask(arg, framework, callback) {
        var tunnel;

        return Q
            .fcall(function () {
                var deferred;

                if (arg.tunneled) {
                    deferred = Q.defer();

                    tunnel = createTunnel(arg);
                    tunnel.start(function (succeeded) {
                        if (!succeeded) {
                            deferred.reject('Could not create tunnel to Sauce Labs');
                        } else {
                            reportProgress({
                                type: 'tunnelOpened'
                            });

                            deferred.resolve();
                        }
                    });
                    return deferred.promise;
                }
            })
            .then(function () {
                var testRunner = new TestRunner(arg, framework, reportProgress);
                return testRunner.runTests();
            })
            .fin(function () {
                var deferred;

                if (tunnel) {
                    deferred = Q.defer();

                    reportProgress({
                        type: 'tunnelClose'
                    });

                    tunnel.stop(function () {
                        deferred.resolve();
                    });

                    return deferred.promise;
                }
            })
            .then(
            function (passed) {
                callback(passed);
            },
            function (error) {
                throw new plugins.util.PluginError('gulp-saucelabs', {
                    message: error.stack || error.toString()
                })
            }
            )
            .done();
    }

    function unsupportedPort(url) {
        // Not all ports are proxied by Sauce Connect. List of supported ports is
        // available at https://saucelabs.com/docs/connect#localhost
        var portRegExp = /:(\d+)\//;
        var matches = portRegExp.exec(url);
        var port = matches ? parseInt(matches[1], 10) : null;
        var supportedPorts = [
            80, 443, 888, 2000, 2001, 2020, 2109, 2222, 2310, 3000, 3001, 3030,
            3210, 3333, 4000, 4001, 4040, 4321, 4502, 4503, 4567, 5000, 5001, 5050, 5555, 5432, 6000,
            6001, 6060, 6666, 6543, 7000, 7070, 7774, 7777, 8000, 8001, 8003, 8031, 8080, 8081, 8765,
            8888, 9000, 9001, 9080, 9090, 9876, 9877, 9999, 49221, 55001
        ];

        if (port) {
            return supportedPorts.indexOf(port) === -1;
        }

        return false;
    }

    var defaults = {
        username: process.env.SAUCE_USERNAME,
        key: process.env.SAUCE_ACCESS_KEY,
        tunneled: true,
        identifier: Math.floor((new Date()).getTime() / 1000 - 1230768000).toString(),
        pollInterval: 1000 * 2,
        statusCheckAttempts: 90,
        testname: '',
        browsers: [{}],
        tunnelArgs: ['--verbose'],
        sauceConfig: {},
        maxRetries: 0
    };

    return (framework, cb) => {
        const options = Object.assign({}, defaults, config);
        runTask(options, framework, cb);
    };

};

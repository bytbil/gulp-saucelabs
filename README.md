gulp-saucelabs
---------------------
A Gulp task for running QUnit, Jasmine, Mocha, YUI tests, or any framework using Sauce Labs' Cloudified Browsers.

Usage
------
This task is available as a [node package](https://npmjs.org/package/gulp-saucelabs) and can be installed as `npm install gulp-saucelabs`. It can also be included as a devDependency in package.json in your node project.

To use the task in `gulpfile.js` create a config

Then require the plugin and instantiate it with the config.

```javascript
  const saucelabs   = require('gulp-saucelabs');
  gulp.task('saucelabs', saucelabs(config));
```

The configuration of `saucelabs-jasmine`, `saucelabs-mocha`, `saucelabs-yui`, and `saucelabs-custom` are exactly the same.

Full list of parameters which can be added to a saucelabs-* task:

* __username__ : The Sauce Labs username that will be used to connect to the servers. If not provided, uses the value of SAUCE_USERNAME environment variable. _Optional_
* __key__ : The Sauce Labs secret key. Since this is a secret, this should not be checked into the source code and may be available as an environment variable. Gulp can access this using `process.env.saucekey`. Will also default to SAUCE_ACCESS_KEY environment variable. _Optional_
* __urls__: An array or URLs that will be loaded in the browsers, one after another. Since SauceConnect is used, these URLs can also be localhost URLs that are available using the `server` task from gulp. _Required_
* __build__: The build number for this test. _Optional_
* __testname__: The name of this test, displayed on the Sauce Labs dashboard. _Optional_
* __tags__: An array of strings, to be added as tags to the test on Sauce Labs. _Optional_
* __tunneled__: Defaults to true; Won't launch a Sauce Connect tunnel if set to false. _Optional_
* __tunnelArgs__: Array of optional arguments to be passed to the Sauce Connect tunnel. example: `['--debug', '--direct-domains', 'google.com']`. See [here](https://saucelabs.com/docs/connect) for further documentation.
* __sauceConfig__: Map of extra parameters to be passed to sauce labs. example: `{'video-upload-on-pass': false, 'idle-timeout': 60}`. See [here](https://saucelabs.com/docs/additional-config) for further documentation.
* __pollInterval__: Number of milliseconds between each retry to see if a test is completed or not (default: 2000). _Optional_
* __statusCheckAttempts__: Number of times to attempt to see if a test is completed or not (default: 90).  Effectively, your tests have `statusCheckAttempts * pollInterval` seconds to complete (Thus, 180s by default).  Set to `-1` to try forever.
* __throttled__: Maximum number of unit test pages which will be sent to Sauce Labs concurrently.  Exceeding your Sauce Labs' allowed concurrency can lead to test failures if you have a lot of unit test pages. _Optional_
* __max-duration__: Maximum duration of a test, this is actually a Selenium Capability. Sauce Labs defaults to 180 seconds for js unit tests. _Optional_
* __browsers__: An array of objects representing the [various browsers](https://saucelabs.com/docs/platforms) on which this test should run. _Optional_
* __onTestComplete__: A callback that is called every time a unit test for a page is complete. Runs per page, per browser configuration. Receives two arguments `(result, callback)`. `result` is the javascript object exposed to sauce labs as the results of the test. `callback` must be called, node-style (having arguments `err`, `result` where result is a true/false boolean which sets the test result reported to the command line). See [example below](#ontestcomplete-callback) _Optional_
* __onTestSuiteComplete__: A callback that is called when all tests have run and the tunnel has been closed down. The callback receives one argument (boolean) which is true if all tests passed, otherwise false.
* __maxRetries__: Specifies how many times the timed out tests should be retried (default: 0). _Optional_
* __public__: The [job visibility level](https://docs.saucelabs.com/reference/test-configuration/#job-visibility). Defaults to 'team'. _Optional_

Example config
-----------------------

```
{
  username: 'saucelabs-user-name', // if not provided it'll default to ENV SAUCE_USERNAME (if applicable)
  key: 'saucelabs-key', // if not provided it'll default to ENV SAUCE_ACCESS_KEY (if applicable)
  urls: ['www.example.com/qunitTests', 'www.example.com/mochaTests'],
  build: process.env.CI_BUILD_NUMBER,
  testname: 'Sauce Unit Test for example.com',
  browsers: [{
    browserName: 'firefox',
    version: '19',
    platform: 'XP'
  }],
  onTestComplete: function(result, callback) {
    // Called after a unit test is done, per page, per browser
    // 'result' param is the object returned by the test framework's reporter
    // 'callback' is a Node.js style callback function. You must invoke it after you
    // finish your work.
    // Pass a non-null value as the callback's first parameter if you want to throw an
    // exception. If your function is synchronous you can also throw exceptions
    // directly.
    // Passing true or false as the callback's second parameter passes or fails the
    // test. Passing undefined does not alter the test result. Please note that this
    // only affects the gulp task's result. You have to explicitly update the Sauce
    // Labs job's status via its REST API, if you want so.

    // The example below negates the result, and also updates the Sauce Labs job's status
    var user = process.env.SAUCE_USERNAME;
    var pass = process.env.SAUCE_ACCESS_KEY;
    request.put({
        url: ['https://saucelabs.com/rest/v1', user, 'jobs', result.job_id].join('/'),
        auth: { user: user, pass: pass },
        json: { passed: !result.passed }
    }, function (error, response, body) {
      if (error) {
        callback(error);
      } else if (response.statusCode !== 200) {
        callback(new Error('Unexpected response status'));
      } else {
        callback(null, !result.passed);
      }
    });
  }
  onTestSuiteComplete: function(result){
    // Called after all tests were executed
    ...
  }
}
```

Contribution
---------
Forked from https://github.com/axemclion/grunt-saucelabs

Changelog
---------
####0.1.0####
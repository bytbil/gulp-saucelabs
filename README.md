gulp-saucelabs
---------------------
A Gulp task for running QUnit, Jasmine, Mocha, YUI tests, or any framework using Sauce Labs' Cloudified Browsers.

[Gulp](http://gulpjs.com/) is a task-based command line build tool for JavaScript projects, based on nodejs.
[QUnit](http://qunitjs.com/) is a powerful, easy-to-use JavaScript unit test suite used by the jQuery, jQuery UI and jQuery Mobile projects and is capable of testing any generic JavaScript code, including itself!
[Jasmine](http://jasmine.github.io/) is a behavior-driven development framework for testing JavaScript code.
[Mocha](https://github.com/mochajs/mocha) is a JavaScript test framework for running serial asynchronous tests.
[YUI Test](http://developer.yahoo.com/yui/yuitest/) is a browser-based testing framework from Yahoo!.
[Sauce Labs](https://saucelabs.com/) offers browser environments on the cloud for testing code.

About the tool
--------------
The `saucelabs-qunit` task is very similar but runs the test suites on the cloudified browser environment provided by Sauce Labs. This ensures that subject of the test runs across different browser environment.
The task also uses [Sauce Connect](https://saucelabs.com/docs/connect) to establish a tunnel between Sauce Labs browsers and the machine running Grunt to load local pages. This is typically useful for testing pages on localhost that are not publicly accessible on the internet.
The `saucelabs-jasmine` runs [Jasmine](http://pivotal.github.io/jasmine/) tests in the Sauce Labs browser. The `saucelabs-jasmine` task requires `jasmine-1.3.0`. There are also `saucelabs-mocha` and `saucelabs-yui` tasks that let you run your Mocha and YUI tests on Sauce Labs cloudified browser environment.

Usage
------
This task is available as a [node package](https://npmjs.org/package/gulp-saucelabs) and can be installed as `npm install gulp-saucelabs`. It can also be included as a devDependency in package.json in your node project.

To use the task in `gulpfile.js` create a config

```javascript
const config = {      
      username: 'saucelabs-user-name', // if not provided it'll default to ENV SAUCE_USERNAME (if applicable)
      key: 'saucelabs-key', // if not provided it'll default to ENV SAUCE_ACCESS_KEY (if applicable)
      urls: ['www.example.com/qunitTests', 'www.example.com/mochaTests'],
      build: process.env.CI_BUILD_NUMBER,
      testname: 'Sauce Unit Test for example.com',
      browsers: [{
        browserName: 'firefox',
        version: '19',
        platform: 'XP'
      }]
      // optionally, he `browsers` param can be a flattened array:
      // [["XP", "firefox", 19], ["XP", "chrome", 31]]
}

```

Then require the plugin and instantiate it with the config.

```javascript
  const saucelabs   = require('gulp-saucelabs');
  gulp.task('saucelabs', saucelabs(config));
```

The configuration of `saucelabs-jasmine`, `saucelabs-mocha`, `saucelabs-yui`, and `saucelabs-custom` are exactly the same.
Note the options object inside a grunt target. This was introduced in grunt-saucelabs-* version 4.0.0 to be compatible with grunt@0.4.0


Full list of parameters which can be added to a saucelabs-* task:

* __username__ : The Sauce Labs username that will be used to connect to the servers. If not provided, uses the value of SAUCE_USERNAME environment variable. _Optional_
* __key__ : The Sauce Labs secret key. Since this is a secret, this should not be checked into the source code and may be available as an environment variable. Grunt can access this using `process.env.saucekey`. Will also default to SAUCE_ACCESS_KEY environment variable. _Optional_
* __urls__: An array or URLs that will be loaded in the browsers, one after another. Since SauceConnect is used, these URLs can also be localhost URLs that are available using the `server` task from grunt. _Required_
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
* __maxRetries__: Specifies how many times the timed out tests should be retried (default: 0). _Optional_
* __public__: The [job visibility level](https://docs.saucelabs.com/reference/test-configuration/#job-visibility). Defaults to 'team'. _Optional_


Exposing Test Results to the Sauce Labs API
-------------------------------------------
Since this project uses the Sauce Labs js unit test API, the servers at Sauce Labs need a way to get the results of your test. Follow the instructions below to assure that the results of your tests are delivered properly.

### Test result details with Jasmine ###

You can make Job Details pages more informative on Sauce by providing more data with each test. You will get info about each test run inside your suite directly on Sauce pages.

[![Jasmine detailed results](https://saucelabs.com/images/front-tests/jasmine.png)](https://saucelabs.com/docs/javascript-unit-tests-integration)

You can do that by using [Jasmine JS Reporter](https://github.com/detro/jasmine-jsreporter) that will let `saucelabs-jasmine` task provide in-depth data about each test as a JSON object.

All you need to do is to include the new jasmine-jsreporter reporter to the page running Jasmine tests by adding new script in header:
```html
<script src="path/to/jasmine-jsreporter.js" type="text/javascript"></script>
```
and telling Jasmine to use it:
```javascript
jasmineEnv.addReporter(new jasmine.JSReporter());
````

### Test result details with QUnit ###

Add the following to your QUnit test specification
```javascript
var log = [];
var testName;

QUnit.done(function (test_results) {
  var tests = [];
  for(var i = 0, len = log.length; i < len; i++) {
    var details = log[i];
    tests.push({
      name: details.name,
      result: details.result,
      expected: details.expected,
      actual: details.actual,
      source: details.source
    });
  }
  test_results.tests = tests;

  window.global_test_results = test_results;
});
QUnit.testStart(function(testDetails){
  QUnit.log(function(details){
    if (!details.result) {
      details.name = testDetails.name;
      log.push(details);
    }
  });
});
```

### Test result details with mocha ###

Add the following to the mocha test page html. Make sure you remove any calls to ```mocha.checkLeaks()``` or add ```mochaResults``` to the list of globals.
```html
<script>
  onload = function(){
    //mocha.checkLeaks();
    //mocha.globals(['foo']);
    var runner = mocha.run();

    var failedTests = [];
    runner.on('end', function(){
      window.mochaResults = runner.stats;
      window.mochaResults.reports = failedTests;
    });

    runner.on('fail', logFailure);

    function logFailure(test, err){

      var flattenTitles = function(test){
        var titles = [];
        while (test.parent.title){
          titles.push(test.parent.title);
          test = test.parent;
        }
        return titles.reverse();
      };

      failedTests.push({name: test.title, result: false, message: err.message, stack: err.stack, titles: flattenTitles(test) });
    };
  };
</script>
```

### Test result details with YUI Test ###

There's nothing you have to do for YUI Tests! The js library already exposes ```window.YUITest.TestRunner.getResults()```

### Test result details with a custom framework ###

When you tests are finished, expose your tests results on `window.global_test_results` as explained in [SauceLab's JS Unit Testing REST API Documentation](https://saucelabs.com/docs/rest#jsunit)

OnTestComplete callback
-----------------------
An optional parameter to the grunt task is `OnTestComplete`, a callback which is called at the end of every test, before results are logged to the console.
You can use this callback to intercept results from SauceLabs and re-report the results (or use the information for your own purposes)

Receives two arguments `(result, callback)`. `result` is the javascript object exposed to sauce labs as the results of the test. `callback` must be called, node-style (having arguments `err`, `result` where result is a true/false boolean which sets the test result reported to the command line)

When running the tests for this project, we need to test the case where a test *fails* on Sauce. In this case, we want to record a test Failure as a Success for us.

```
'saucelabs-qunit': {
  all: {
    options: {
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
        // only affects the grunt task's result. You have to explicitly update the Sauce
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
  }
}
```

Contribution
---------
Forked from https://github.com/axemclion/grunt-saucelabs

Changelog
---------
####1.0.0####